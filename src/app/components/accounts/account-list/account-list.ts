import {Component, inject} from '@angular/core';

import {AccountSummary} from '../account-summary/account-summary';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';

@Component({
  selector: 'ya-account-list',
  templateUrl: './account-list.html',
  styleUrl: './account-list.scss',
  imports: [AccountSummary],
})
export class AccountList {
  protected readonly ynabStorage = inject(YnabStorage);
}
