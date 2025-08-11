import {Component, input, computed} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

import {Currency} from '../../common/currency/currency';
import {AccountAllocation} from '../../../../lib/accounts/account_data';
import {DropdownButton} from '../../common/dropdown-button/dropdown-button';
import {ReconciledTime} from '../../time/reconciled-time/reconciled-time';
import { AccountType } from 'ynab';

@Component({
  selector: 'ya-account-status-indicator',
  templateUrl: './account-status-indicator.html',
  styleUrl: './account-status-indicator.scss',
  imports: [
    Currency,
    DropdownButton,
    MatIcon,
    ReconciledTime,
  ],
})
export class AccountStatusIndicator {
  readonly account = input.required<AccountAllocation>();

  protected readonly hasProblems = computed<boolean>(() => {
    return this.ynabReconIsOutdated()
        || this.metadataReconIsOutdated()
        || this.amountBelowMinimum() !== null;
  });

  protected readonly ynabReconIsOutdated = computed<boolean>(() => {
    const lastRecon = this.account().account.last_reconciled_at;
    if (lastRecon == null) return true;

    const last = new Date(lastRecon);
    return isOutOfDate(last);
  });

  protected readonly metadataReconIsOutdated = computed<boolean>(() => {
    if (this.isCashAccount()) return false;

    const lastRecon = this.account().metadata?.lastReconciled ?? null;
    if (lastRecon == null) return true;

    return isOutOfDate(lastRecon);
  });

  protected readonly amountBelowMinimum = computed<number | null>(() => {
    if (this.isCashAccount()) return null;

    const metadata = this.account().metadata;
    if (!metadata) return null;
    if (metadata.minimumBalanceMillis <= 0) return null;

    const balance = this.account().account.cleared_balance;
    if (balance >= metadata.minimumBalanceMillis) return null;

    return metadata.minimumBalanceMillis - balance;
  });

  private readonly isCashAccount = computed<boolean>(() => {
    return this.account().account.type === AccountType.Cash;
  });
}

function isOutOfDate(lastRecon: Date): boolean {
  const now = new Date();
  const deltaMs = now.getTime() - lastRecon.getTime();
  const deltaDays = deltaMs / 1000 / 60 / 60 / 24;

  // A reconciliation is considered out-of-date if it is 30 days old (or
  // older).
  return deltaDays >= 30;
}
