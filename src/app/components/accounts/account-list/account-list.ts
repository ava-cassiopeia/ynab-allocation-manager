import {Component, inject} from '@angular/core';

import {AccountSummary} from '../account-summary/account-summary';
import {AccountData} from '../../../../lib/accounts/account_data';

@Component({
  selector: 'ya-account-list',
  templateUrl: './account-list.html',
  styleUrl: './account-list.scss',
  imports: [AccountSummary],
})
export class AccountList {
  protected readonly accountData = inject(AccountData);
}
