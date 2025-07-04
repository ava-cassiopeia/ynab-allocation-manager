import {Component, inject, computed} from '@angular/core';

import {DropdownButton} from '../../common/dropdown-button/dropdown-button';
import {FirestoreStorage} from '../../../../lib/firestore/firestore_storage';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';

@Component({
  selector: 'ya-allocation-count-button',
  templateUrl: './allocation-count-button.html',
  styleUrl: './allocation-count-button.scss',
  imports: [DropdownButton],
})
export class AllocationCountButton {
  protected readonly status = computed<AllocationStatus>(() => {
    const categoryGroups = this.ynabStorage.latestCategories.value();
    const allocationCount = this.firestoreStorage.allocations().length;

    let totalCategories = 0;
    for (const categoryGroup of categoryGroups) {
      totalCategories += categoryGroup.categories
          .filter((c) => !c.deleted && !c.hidden)
          .length;
    }

    return {
      totalCategories,
      allocatedCategories: allocationCount,
    };
  });

  private readonly ynabStorage = inject(YnabStorage);
  private readonly firestoreStorage = inject(FirestoreStorage);
}

interface AllocationStatus {
  readonly totalCategories: number;
  readonly allocatedCategories: number;
}
