import {Injectable, signal, computed, resource} from "@angular/core";
import {AccountType, API, BudgetSummary, CategoryGroupWithCategories} from "ynab";

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
  readonly selectedBudget = signal<BudgetSummary | null>(null);

  /**
   * A resource which supplies all of the categories for the user's selected
   * budget. Empty if no budget has been selected yet.
   */
  readonly categories = resource({
    params: () => ({
      api: this.api(),
      budget: this.selectedBudget(),
    }),

    loader: async ({params}) => {
      const {api, budget} = params;
      if (api === null) return [];
      if (budget === null) return [];

      const response = await api.categories.getCategories(budget.id);
      return response.data.category_groups;
    },
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
          .filter((a) => !a.closed)
          .filter((a) => a.on_budget)
          // ...and exclude credit cards, since you can't _really_ just cache
          // money there.
          .filter((a) => a.type !== AccountType.CreditCard);
    },
  });

  reset() {
    this.selectedBudget.set(null);
  }
}
