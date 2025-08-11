import {Account, AccountType} from 'ynab';
import {Component, inject, OnInit, HostBinding, signal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';

import {AccountMetadata} from '../../../../lib/models/account_metadata';
import {FirestoreStorage} from '../../../../lib/firestore/firestore_storage';
import {ReconciledTime} from '../../time/reconciled-time/reconciled-time';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';

/**
 * Renders a dialog that lets the user edit metadata related to their accounts.
 */
@Component({
  selector: 'ya-account-metadata-dialog',
  templateUrl: './account-metadata-dialog.html',
  styleUrl: './account-metadata-dialog.scss',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatIcon,
    ReactiveFormsModule,
    ReconciledTime,
  ],
})
export class AccountMetadataDialog implements OnInit {
  protected readonly interestRateControl = new FormControl<number>(0);
  protected readonly interestThresholdControl = new FormControl<number>(0);
  protected readonly minimumBalanceControl = new FormControl<number>(0);
  protected readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  protected readonly isCheckingAccount = signal<boolean>(false);

  private readonly firestoreStorage = inject(FirestoreStorage);
  private readonly ynabStorage = inject(YnabStorage);
  private readonly dialogRef = inject(MatDialogRef<AccountMetadataDialog>);

  @HostBinding('class')
  get dialogClass(): string {
    return 'ya-dialog';
  }

  ngOnInit() {
    // Populate values from the provided AccountMetadata instance, if it exists.
    if (this.data.metadata) {
      this.interestRateControl.setValue(this.data.metadata.interestRate * 100.0);
      this.interestThresholdControl.setValue(this.data.metadata.interestThresholdMillis / 1000.0);
      this.minimumBalanceControl.setValue(this.data.metadata.minimumBalanceMillis / 1000.0);
    }

    this.isCheckingAccount.set(this.data.account.type === AccountType.Checking);
  }

  protected async save() {
    const currentBudget = this.ynabStorage.selectedBudget();
    if (!currentBudget) return;

    const newInterestRate = this.interestRateControl.value ?? 0;
    const newInterestThreshold = toMillis(this.interestThresholdControl.value);
    const newMinimumBalance = toMillis(this.minimumBalanceControl.value);

    const newMetadata = new AccountMetadata(
        this.data.account.id,
        currentBudget.id,
        newInterestRate === 0 ? newInterestRate : (newInterestRate / 100.0),
        newInterestThreshold,
        newMinimumBalance,
        new Date(),
    );

    await this.firestoreStorage.upsertAccount(newMetadata);
    this.closeDialog();
  }

  protected closeDialog(): void {
    this.dialogRef.close();
  }
}

function toMillis(val: number | null): number {
  if (val === null) return 0;
  return val * 1000;
}

interface DialogData {
  readonly metadata: AccountMetadata | null;
  readonly account: Account;
}
