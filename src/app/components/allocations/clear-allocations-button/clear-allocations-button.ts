import {Component, inject, ViewChild} from '@angular/core';

import {DropdownButton} from '../../common/dropdown-button/dropdown-button';
import {FirestoreStorage} from '../../../../lib/firestore/firestore_storage';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';

@Component({
  selector: 'ya-clear-allocations-button',
  templateUrl: './clear-allocations-button.html',
  styleUrl: './clear-allocations-button.scss',
  imports: [DropdownButton],
})
export class ClearAllocationsButton {
  protected readonly ynabStorage = inject(YnabStorage);

  @ViewChild(DropdownButton)
  private readonly dropdownButton!: DropdownButton<unknown>;
  private readonly firestoreStorage = inject(FirestoreStorage);

  protected cancel() {
    this.dropdownButton.close();
  }

  protected clearAll() {
    this.firestoreStorage.clearAllocationsForBudget();
    this.dropdownButton.close();
  }
}
