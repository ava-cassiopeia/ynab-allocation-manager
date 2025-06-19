import {Component, inject} from '@angular/core';

import {AccountData} from '../../../../lib/accounts/account_data';
import {DropdownButton} from '../../common/dropdown-button/dropdown-button';
import {Currency} from "../../common/currency/currency";

@Component({
  selector: 'ya-accounts-summary',
  templateUrl: './accounts-summary.html',
  styleUrl: './accounts-summary.scss',
  imports: [DropdownButton, Currency],
})
export class AccountsSummary {
  protected readonly accountData = inject(AccountData);
}
