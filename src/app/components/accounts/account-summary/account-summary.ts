import {AccountType} from 'ynab';
import {Component, input, computed, inject, booleanAttribute} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';

import {AccountAllocation} from '../../../../lib/accounts/account_data';
import {AccountMetadataDialog} from '../account-metadata-dialog/account-metadata-dialog';
import {AccountStatusIndicator} from '../account-status-indicator/account-status-indicator';
import {CurrencyCopyButton} from '../../common/currency-copy-button/currency-copy-button';
import {Currency} from '../../common/currency/currency';
import {DropdownButton, ButtonTheme} from '../../common/dropdown-button/dropdown-button';
import {InterestWarningButton} from '../../interest/interest-warning-button/interest-warning-button';

@Component({
  selector: 'ya-account-summary',
  templateUrl: './account-summary.html',
  styleUrl: './account-summary.scss',
  imports: [
    AccountStatusIndicator,
    Currency,
    CurrencyCopyButton,
    DropdownButton,
    InterestWarningButton,
  ],
})
export class AccountSummary {
  readonly account = input.required<AccountAllocation>();
  readonly hideInterest = input(false, {transform: booleanAttribute});

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

  /**
   * Only allow the user to edit metadata if the account isn't a cash account.
   * A cash account definitionally shouldn't have metadata.
   */
  protected readonly allowMetadata = computed<boolean>(() => {
    return this.account().account.type !== AccountType.Cash;
  });

  private readonly matDialog = inject(MatDialog);

  protected showMetadataDialog() {
    if (!this.allowMetadata()) return;

    this.matDialog.open(AccountMetadataDialog, {
      data: {
        metadata: this.account().metadata,
        account: this.account().account,
      },
    });
  }
}
