import {Component, input, computed, inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';

import {AccountAllocation} from '../../../../lib/accounts/account_data';
import {AccountMetadataDialog} from '../account-metadata-dialog/account-metadata-dialog';
import {CurrencyCopyButton} from '../../common/currency-copy-button/currency-copy-button';
import {Currency} from '../../common/currency/currency';
import {DropdownButton, ButtonTheme} from '../../common/dropdown-button/dropdown-button';
import {ReconciledTime} from "../../time/reconciled-time/reconciled-time";

@Component({
  selector: 'ya-account-summary',
  templateUrl: './account-summary.html',
  styleUrl: './account-summary.scss',
  imports: [
    Currency,
    CurrencyCopyButton,
    DropdownButton,
    ReconciledTime,
  ],
})
export class AccountSummary {
  readonly account = input.required<AccountAllocation>();

  protected readonly lastReconciledAt = computed<Date | null>(() => {
    const lastReconciledAt = this.account().account.last_reconciled_at;
    if (!lastReconciledAt) return null;

    return new Date(lastReconciledAt);
  });

  protected readonly lastReconciledWarning = computed<boolean>(() => {
    const now = new Date();
    const last = this.lastReconciledAt();
    if (!last) return true;

    const deltaMs = now.getTime() - last.getTime();
    return deltaMs > (1000 * 60 * 60 * 24 * 30); // 30 days
  });

  protected readonly delta = computed<number>(() => {
    return this.account().account.cleared_balance - this.account().total;
  });

  protected readonly hasAllocations = computed<boolean>(() => {
    return this.account().categories.length > 0;
  });

  protected readonly allocationsTheme = computed<ButtonTheme>(() => {
    const delta = this.delta();
    if (!this.hasAllocations()) {
      return delta === 0 ? 'perfect' : 'overfunded';
    }

    if (delta > 0) {
      return 'overfunded';
    } else if (delta < 0) {
      return 'underfunded';
    } else {
      return 'perfect';
    }
  });

  private readonly matDialog = inject(MatDialog);

  protected showMetadataDialog() {
    this.matDialog.open(AccountMetadataDialog, {
      data: {
        metadata: this.account().metadata,
        account: this.account().account,
      },
    });
  }
}
