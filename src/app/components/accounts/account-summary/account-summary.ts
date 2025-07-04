import {Component, input, computed, inject} from '@angular/core';

import {CurrencyCopyButton} from '../../common/currency-copy-button/currency-copy-button';
import {Currency} from '../../common/currency/currency';
import {DropdownButton, ButtonTheme} from '../../common/dropdown-button/dropdown-button';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';
import {AccountAllocation} from '../../../../lib/accounts/account_data';

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

  protected readonly delta = computed<number>(() => {
    return this.account().account.cleared_balance - this.account().total;
  });

  protected readonly hasAllocations = computed<boolean>(() => {
    return this.account().categories.length > 0;
  });

  protected readonly allocationsTheme = computed<ButtonTheme>(() => {
    const delta = this.delta();
    if (!this.hasAllocations()) {
      return delta === 0 ? 'perfect' : 'overfunded';
    }

    if (delta > 0) {
      return 'overfunded';
    } else if (delta < 0) {
      return 'underfunded';
    } else {
      return 'perfect';
    }
  });

  private readonly ynabStorage = inject(YnabStorage);
}
