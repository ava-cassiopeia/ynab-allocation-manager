import {Component, inject} from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import {FirestoreStorage} from '../../../../../lib/firestore/firestore_storage';

@Component({
  selector: 'ya-clear-allocations-dialog',
  templateUrl: './clear-allocations-dialog.html',
  styleUrl: './clear-allocations-dialog.scss',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class ClearAllocationsDialog {
  private readonly firestoreStorage = inject(FirestoreStorage);
  private readonly dialogRef = inject(MatDialogRef);

  protected clear() {
    void this.firestoreStorage.clearAllocationsForBudget();
    this.dialogRef.close();
  }
}
