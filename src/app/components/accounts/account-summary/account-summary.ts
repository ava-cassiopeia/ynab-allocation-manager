import {Component, input, computed, inject, resource} from '@angular/core';
import {Account, Category} from 'ynab';

import {CurrencyCopyButton} from '../../common/currency-copy-button/currency-copy-button';
import {Currency} from '../../common/currency/currency';
import {DropdownButton, ButtonTheme} from '../../common/dropdown-button/dropdown-button';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';
import {SettingsStorage} from '../../../../lib/firebase/settings_storage';

@Component({
  selector: 'ya-account-summary',
  templateUrl: './account-summary.html',
  styleUrl: './account-summary.scss',
  imports: [
    Currency,
    CurrencyCopyButton,
    DropdownButton,
  ],
})
export class AccountSummary {
  readonly account = input.required<AccountAllocation>();

  protected readonly allocatedAmount = resource({
    params: () => ({
      api: this.ynabStorage.api(),
      budget: this.ynabStorage.selectedBudget(),
      categories: this.account().categories,
      months: this.settingsStorage.settings().timeRange,
    }),

    loader: async ({params}) => {
      const {api, categories, months, budget} = params;
      if (!api) return 0;
      if (!budget) return 0;
      if (categories.length < 1) return 0;

      const today = new Date();
      const promises = [];
      for (const category of categories) {
        promises.push(this.walkCategory(category.id, today, months));
      }

      const values = await Promise.all(promises);

      let sum = 0;
      for (const value of values) {
        sum += value;
      }
      return sum;
    },

    defaultValue: 0,
  });

  protected readonly delta = computed<number>(() => {
    return this.account().account.cleared_balance - this.allocatedAmount.value();
  });

  protected readonly hasAllocations = computed<boolean>(() => {
    return this.account().categories.length > 0;
  });

  protected readonly allocationsTheme = computed<ButtonTheme>(() => {
    if (!this.hasAllocations()) return 'default';
    const delta = this.delta();

    if (delta > 0) {
      return 'overage';
    } else if (delta < 0) {
      return 'warning';
    } else {
      return 'perfect';
    }
  });

  private readonly ynabStorage = inject(YnabStorage);
  private readonly settingsStorage = inject(SettingsStorage);

  /**
   * This method works around a tricky limitation of the YNAB API. When we ask
   * the YNAB API for a category for a particular month, we'll either get a 404
   * if the user hasn't assigned anything to that category in that month, or
   * we'll get the category. Critically though, that category's balance will
   * be a rolling sum of all of the category's allotments and activity up until
   * that point.
   *
   * So, if we want to know the cumulative balance of a category, we have to
   * walk forward down the API, asking for one month at a time, until we hit
   * a 404 error. Once we hit that error, we stop and return the last cumulative
   * value we saw.
   *
   * Unfortunately, that does mean that if the user asks for a large amount of
   * months as window, that the runtime of this method monotonically increases
   * by, in the worst case, 1 network request per month. Though, in the author's
   * opinion, that's better than the alternative, where we spam the YNAB API
   * with N requests all at once, where N is the amount of months they want to
   * look forward times the amount of allocated categories (yeesh!).
   */
  private async walkCategory(categoryId: string, startDate: Date, maxSteps: number): Promise<number> {
    const api = this.ynabStorage.api();
    const budget = this.ynabStorage.selectedBudget();
    if (api === null) return 0;
    if (budget === null) return 0;

    let last = 0;
    for (let i = 0; i < maxSteps; i++) {
      const currDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate());
      const apiDate = currDate.toISOString().split('T')[0];
      const newVal = await api.categories.getMonthCategoryById(budget.id, apiDate, categoryId).then((c) => {
        return c.data.category.balance;
      }).catch((e) => {
        return null;
      });

      if (newVal === null) {
        return last;
      }

      last = newVal;
    }

    return last;
  }
}

/**
 * The special data structure that this component renders.
 */
export interface AccountAllocation {
  readonly account: Account;
  readonly categories: Category[];
}
