import {Component, input, computed, inject} from '@angular/core';
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

  protected readonly allocatedAmount = computed<number>(() => {
    let sum = 0;
    for (const category of this.account().categories) {
      // We always take a positive value here because negative values still need
      // to be covered somehow.
      sum += Math.abs(category.balance);
    }
    return sum;
  });

  protected readonly delta = computed<number>(() => {
    return this.account().account.cleared_balance - this.allocatedAmount();
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
}

/**
 * The special data structure that this component renders.
 */
export interface AccountAllocation {
  readonly account: Account;
  readonly categories: Category[];
}
