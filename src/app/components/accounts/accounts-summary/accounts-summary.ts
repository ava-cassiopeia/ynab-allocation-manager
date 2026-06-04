import {Component, inject, ChangeDetectionStrategy} from '@angular/core';

import {AccountData} from '../../../../lib/accounts/account_data';
import {DropdownButton} from '../../common/dropdown-button/dropdown-button';
import {Currency} from '../../common/currency/currency';

@Component({
  selector: 'ya-accounts-summary',
  templateUrl: './accounts-summary.html',
  styleUrl: './accounts-summary.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DropdownButton, Currency],
})
export class AccountsSummary {
  protected readonly accountData = inject(AccountData);
}
