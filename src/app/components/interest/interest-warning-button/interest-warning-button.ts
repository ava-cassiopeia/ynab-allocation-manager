import {Component, input, computed} from '@angular/core';

import {AccountAllocation} from '../../../../lib/accounts/account_data';
import {Currency} from '../../common/currency/currency';
import {DropdownButton} from '../../common/dropdown-button/dropdown-button';

@Component({
  selector: 'ya-interest-warning-button',
  templateUrl: './interest-warning-button.html',
  styleUrl: './interest-warning-button.scss',
  imports: [DropdownButton, Currency],
})
export class InterestWarningButton {
  readonly account = input.required<AccountAllocation>();

  protected readonly interestRate = computed<string>(() => {
    const metadata = this.account().metadata;
    if (!metadata) return '-';
    if (metadata.interestRate <= 0) return '-';

    const rate = (metadata.interestRate * 100.0).toFixed(1);
    return `${rate}%`;
  });

  /**
   * The amount the user is missing from this account to get the target interest
   * rate. Null if they're good, or we don't have interest rate data.
   */
  protected readonly missingAmount = computed<number | null>(() => {
    const metadata = this.account().metadata;
    if (!metadata) return null;
    if (metadata.interestRate <= 0) return null;
    if (metadata.interestThresholdMillis <= 0) return null;


    const balance = this.account().account.cleared_balance;
    if (balance >= metadata.interestThresholdMillis) return null;

    return metadata.interestThresholdMillis - balance;
  });
}
