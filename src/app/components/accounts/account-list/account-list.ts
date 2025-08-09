import {AccountType} from 'ynab';
import {Component, inject, computed} from '@angular/core';

import {AccountData, AccountAllocation} from '../../../../lib/accounts/account_data';
import {AccountSummary} from '../account-summary/account-summary';
import {Currency} from '../../common/currency/currency';
import {compareAccounts} from '../../../../lib/accounts/account_lists';

@Component({
  selector: 'ya-account-list',
  templateUrl: './account-list.html',
  styleUrl: './account-list.scss',
  imports: [AccountSummary, Currency],
})
export class AccountList {
  /**
   * All of the user's accounts, sorted by type for easier comprehension.
   */
  protected readonly accounts = computed<SortedAccounts>(() => {
    const accounts = this.accountData.accounts();

    let checkingAccounts: AccountAllocation[] = [];
    let savingsAccounts: AccountAllocation[] = [];
    for (const account of accounts) {
      if (account.account.type === AccountType.Savings) {
        savingsAccounts.push(account);
      } else {
        checkingAccounts.push(account);
      }
    }

    checkingAccounts = checkingAccounts.sort((a, b) => compareAccounts(a, b));
    savingsAccounts = savingsAccounts.sort((a, b) => compareAccounts(a, b));

    return {checkingAccounts, savingsAccounts};
  });

  protected readonly balances = computed<Sums>(() => {
    const accounts = this.accounts();

    const checking = accounts.checkingAccounts
        .map((a) => a.account.cleared_balance)
        .reduce((p, c) => p + c, 0);
    const savings = accounts.savingsAccounts
        .map((a) => a.account.cleared_balance)
        .reduce((p, c) => p + c, 0);

    return {checking, savings};
  });

  private readonly accountData = inject(AccountData);
}

interface SortedAccounts {
  readonly checkingAccounts: AccountAllocation[];
  readonly savingsAccounts: AccountAllocation[];
}

interface Sums {
  readonly checking: number;
  readonly savings: number;
}
