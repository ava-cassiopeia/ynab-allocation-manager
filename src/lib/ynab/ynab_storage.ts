import {Injectable, signal, computed, resource, effect, inject, ResourceRef} from "@angular/core";
import {Account, AccountType, API, BudgetSummary, Category} from "ynab";

import {SettingsStorage} from "../firebase/settings_storage";
import {getMonthsLabel, latestMonth, monthDistance, monthToApiMonth, parseMonth} from "../time/months";

/**
 * Stores cached YNAB data for the application.
 */
@Injectable({providedIn: 'root'})
export class YnabStorage {
  readonly apiKey = signal<string | null>(null);

  readonly api = computed<API | null>(() => {
    const key = this.apiKey();
    if (key === null) return null;

    return new API(key);
  });

  /**
   * A resource which supplies all of the user's budgets, if an appropriate
   * API key is available.
   */
  readonly budgets = resource({
    params: () => ({api: this.api()}),

    loader: async ({params}) => {
      if (params.api === null) return [];

      const response = await params.api.budgets.getBudgets();
      return response.data.budgets;
    },
  });

  /**
   * The budget the user has selected to work on. Null if the user hasn't
   * selected a budget yet.
   */
  readonly selectedBudget = computed<BudgetSummary | null>(() => {
    const settingsBudgetId = this.settingsStorage.settings().selectedBudgetId;
    if (settingsBudgetId === null) return null;

    const budgets = this.budgets.value();
    if (!budgets) return null;

    let foundBudget = null;
    for (const budget of budgets) {
      if (budget.id === settingsBudgetId) {
        foundBudget = budget;
        break;
      }
    }

    return foundBudget;
  });

  /**
   * The latest-in-time month available in the user's budget, capped by their
   * current month window selection, or today if none could be found.
   */
  readonly latestMonth: ResourceRef<Date> = resource({
    params: () => ({
      api: this.api(),
      selectedBudget: this.selectedBudget(),
    }),

    loader: async ({params}) => {
      const {api, selectedBudget} = params;
      if (!api) return new Date();
      if (!selectedBudget) return new Date();

      const monthsResponse = await api.months.getBudgetMonths(selectedBudget.id);
      const allMonths = monthsResponse.data.months
          .filter((m) => !m.deleted)
          .map((m) => parseMonth(m.month));
      return latestMonth(new Date(), allMonths);
    },

    defaultValue: new Date(),
  });

  /**
   * The distance between the current month and the latest month.
   */
  readonly latestMonthDistance = computed<number>(() => {
    return monthDistance(new Date(), this.latestMonth.value());
  });

  /**
   * A label like "Jan - Mar" or "Mar - Jun 2026" for the distance between now
   * and the latest month in the user's budget.
   */
  readonly latestMonthLabel = computed<string>(() => {
    return getMonthsLabel(this.latestMonthDistance());
  });

  /**
   * A list of all of the user's accounts for their selected budget, or an empty
   * array if they haven't selected a budget yet.
   */
  readonly accounts = resource({
    params: () => ({
      api: this.api(),
      budget: this.selectedBudget(),
    }),

    loader: async ({params}) => {
      const {api, budget} = params;
      if (api === null) return [];
      if (budget === null) return [];

      const response = await api.accounts.getAccounts(budget.id);
      return response.data.accounts
          // Only show active budget accounts
          .filter((a) => !a.closed && !a.deleted)
          .filter((a) => a.on_budget)
          // ...and exclude credit lines, since you can't _really_ just cache
          // money there.
          .filter((a) => a.type !== AccountType.CreditCard && a.type !== AccountType.LineOfCredit);
    },

    defaultValue: [],
  });

  /**
   * The latest categories, based on the user's time-range selection.
   */
  readonly latestCategories: ResourceRef<SimpleCategoryGroup[]> = resource({
    params: () => ({
      api: this.api(),
      budget: this.selectedBudget(),
      latestMonth: this.latestMonth.value(),
      categories: this.categories.value(),
    }),

    loader: async ({params}) => {
      const {api, budget, latestMonth, categories} = params;
      if (!api) return [];
      if (!budget) return [];
      if (categories.length < 1) return [];
      const apiMonth = monthToApiMonth(latestMonth);

      const response = await api.months.getBudgetMonth(budget.id, apiMonth);
      const simpleCategories: SimpleCategoryGroup[] = categories
          // While we're here we might as well throw out the results we don't
          // care about.
          .filter((c) => !c.hidden && !c.deleted)
          .map((c) => ({
            id: c.id,
            name: c.name,
            categories: [],
          }));

      // Sort each category into its appropriate SimpleCategoryGroup
      // TODO: This is currently O(c*g) time, but with a map it could be
      // improved, assuming map construction isn't too expensive.
      // John Carmack has a great story about Doom and how sometimes the
      // "expensive" algorithm, for a small set of values, is actually the
      // performant choice. It's possible that's true here, not sure.
      for (const category of response.data.month.categories) {
        // No reason to process results we don't care about.
        if (category.hidden || category.deleted) continue;

        for (const group of simpleCategories) {
          if (category.category_group_id === group.id) {
            group.categories.push(category);
            break;
          }
        }
      }

      return simpleCategories;
    },

    defaultValue: [],
  });

  readonly status = computed<YnabStorageStatus>(() => {
    if (this.budgets.isLoading()) return YnabStorageStatus.LOADING_BUDGET_LIST;
    if (this.selectedBudget() === null) return YnabStorageStatus.NO_BUDGET_SELECTED;

    if (this.accounts.isLoading() || this.categories.isLoading() || this.latestCategories.isLoading()) {
      return YnabStorageStatus.LOADING_BUDGET_DETAILS;
    }

    return YnabStorageStatus.READY;
  });

  /**
   * A resource which supplies all of the categories for the user's selected
   * budget. Empty if no budget has been selected yet.
   */
  private readonly categories = resource({
    params: () => ({
      api: this.api(),
      budget: this.selectedBudget(),
    }),

    loader: async ({params}) => {
      const {api, budget} = params;
      if (api === null) return [];
      if (budget === null) return [];

      const response = await api.categories.getCategories(budget.id);
      return response.data.category_groups
          .filter((g) => !g.deleted && !g.hidden)
          // Special category generated by YNAB automatically that isn't
          // relevant to this application. Sadly, there's no easier way (with
          // the data provided from the API) to identify this category, because
          // it's not considered hidden or deleted, nor does it have a fixed
          // ID between budgets.
          // It's possible this won't work for non-English YNAB budgets, some
          // experimentation might be required here.
          .filter((g) => g.name.trim().toLowerCase() !== "hidden categories")
          .filter((g) => g.name.trim().toLowerCase() !== "internal master category");
    },

    defaultValue: [],
  });

  private readonly settingsStorage = inject(SettingsStorage);

  constructor() {
    // Attempt to load any saved API key from session storage.
    const storedApiKey = sessionStorage.getItem('ynab.apiKey');
    if (storedApiKey) {
      this.apiKey.set(storedApiKey);
    }

    // Save the provided API key to session storage.
    effect(() => {
      const apiKey = this.apiKey();
      if (apiKey) {
        sessionStorage.setItem('ynab.apiKey', apiKey);
      } else {
        sessionStorage.removeItem('ynab.apiKey');
      }
    });
  }

  /**
   * Refreshes all YNAB data.
   */
  async refresh() {
    await Promise.all([
      this.budgets.reload(),
      this.latestMonth.reload(),
      this.accounts.reload(),
      this.latestCategories.reload(),
    ]);
  }

  findAccount(accountId: string): Account | null {
    const accounts = this.accounts.value();
    for (const account of accounts) {
      if (account.id === accountId) return account;
    }

    return null;
  }
}

export enum YnabStorageStatus {
  LOADING_BUDGET_LIST = 1,
  NO_BUDGET_SELECTED,
  LOADING_BUDGET_DETAILS,
  READY,
}

interface SimpleCategoryGroup {
  readonly id: string;
  readonly name: string;
  readonly categories: Category[];
}
