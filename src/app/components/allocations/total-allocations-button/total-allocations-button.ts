import {Component, inject} from '@angular/core';
import {DropdownButton} from '../../common/dropdown-button/dropdown-button';
import {AccountData} from '../../../../lib/accounts/account_data';
import {Currency} from "../../common/currency/currency";

@Component({
  selector: 'ya-total-allocations-button',
  templateUrl: './total-allocations-button.html',
  styleUrl: './total-allocations-button.scss',
  imports: [DropdownButton, Currency],
})
export class TotalAllocationsButton {
  protected readonly accountData = inject(AccountData);
}
