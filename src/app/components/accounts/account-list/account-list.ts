import {Component, inject} from '@angular/core';

import {YnabStorage} from '../../../../lib/ynab/ynab_storage';

@Component({
  selector: 'ya-account-list',
  templateUrl: './account-list.html',
  styleUrl: './account-list.scss'
})
export class AccountList {
  protected readonly ynabStorage = inject(YnabStorage);
}
