import {Component, inject, input, computed, signal} from '@angular/core';
import {Account, Category} from 'ynab';

import {Allocation} from '../../../../lib/models/allocation';
import {FirestoreStorage} from '../../../../lib/firestore/firestore_storage';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';

@Component({
  selector: 'ya-allocation-selector',
  templateUrl: './allocation-selector.html',
  styleUrl: './allocation-selector.scss'
})
export class AllocationSelector {
  readonly category = input.required<Category>();

  protected readonly showDropdown = signal<boolean>(false);

  /**
   * The currently selected allocation. Instead of keeping some local copy
   * of the allocation in this component, we try to find it in the list of the
   * user's current allocations so this is always in sync.
   */
  protected readonly allocation = computed<Allocation | null>(() => {
    for (const allocation of this.firestoreStorage.allocations()) {
      if (allocation.categoryId === this.category().id) {
        return allocation;
      }
    }

    return null;
  });

  /**
   * The account associated with the selected allocation, or null if there is
   * no selected allocation or the account cannot be found.
   */
  protected readonly allocatedAccount = computed<Account | null>(() => {
    const allocation = this.allocation();
    if (allocation === null) return null;

    const accounts = this.ynabStorage.accounts.value();
    if (!accounts) return null;

    for (const account of accounts) {
      if (account.id === allocation.accountId) {
        return account;
      }
    }

    return null;
  });

  protected readonly ynabStorage = inject(YnabStorage);

  private readonly firestoreStorage = inject(FirestoreStorage);

  protected toggleDropdown() {
    this.showDropdown.update((show) => !show);
  }

  protected async selectAccount(account: Account) {
    const newAllocation = new Allocation(this.category().id, account.id);
    await this.firestoreStorage.upsertAllocation(newAllocation);
    this.showDropdown.set(false);
  }
}
