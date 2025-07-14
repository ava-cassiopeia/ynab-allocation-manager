import {Component, inject, computed} from '@angular/core';

import {AccountSummary} from '../account-summary/account-summary';
import {AccountData, AccountAllocation} from '../../../../lib/accounts/account_data';
import {AccountType} from 'ynab';

@Component({
  selector: 'ya-account-list',
  templateUrl: './account-list.html',
  styleUrl: './account-list.scss',
  imports: [AccountSummary],
})
export class AccountList {
  /**
   * All of the user's accounts, sorted by type for easier comprehension.
   */
  protected readonly accounts = computed<SortedAccounts>(() => {
    const accounts = this.accountData.accounts();

    const checkingAccounts: AccountAllocation[] = [];
    const savingsAccounts: AccountAllocation[] = [];
    for (const account of accounts) {
      if (account.account.type === AccountType.Savings) {
        savingsAccounts.push(account);
      } else {
        checkingAccounts.push(account);
      }
    }

    return {checkingAccounts, savingsAccounts};
  });

  private readonly accountData = inject(AccountData);
}

interface SortedAccounts {
  readonly checkingAccounts: AccountAllocation[];
  readonly savingsAccounts: AccountAllocation[];
}
