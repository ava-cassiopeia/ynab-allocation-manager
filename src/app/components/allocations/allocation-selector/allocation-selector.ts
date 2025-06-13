import {Component, inject, input, computed, ViewChild} from '@angular/core';
import {Account, Category} from 'ynab';

import {Allocation} from '../../../../lib/models/allocation';
import {DropdownButton, DropdownMenuItem} from '../../common/dropdown-button/dropdown-button';
import {FirestoreStorage} from '../../../../lib/firestore/firestore_storage';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';

@Component({
  selector: 'ya-allocation-selector',
  templateUrl: './allocation-selector.html',
  styleUrl: './allocation-selector.scss',
  imports: [DropdownButton],
})
export class AllocationSelector {
  readonly category = input.required<Category>();

  @ViewChild(DropdownButton) dropdownButton!: DropdownButton<Account>;

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

  protected readonly menuItems = computed<DropdownMenuItem<Account>[]>(() => {
    const accounts = this.ynabStorage.accounts.value();
    if (!accounts) return [];

    return accounts.map((a) => ({
      label: a.name,
      icon: this.allocatedAccount() === a ? 'done' : 'account_balance',
      value: a,
      action: (value: Account) => {
        this.selectAccount(value);
      },
    }));
  });

  protected readonly ynabStorage = inject(YnabStorage);

  private readonly firestoreStorage = inject(FirestoreStorage);

  protected async selectAccount(account: Account | null) {
    const budget = this.ynabStorage.selectedBudget();
    if (budget === null) return;

    if (account === null) {
      await this.firestoreStorage.clearAllocationForCategory(this.category());
      this.dropdownButton.close();
      return;
    }

    const newAllocation = new Allocation(budget.id, this.category().id, account.id);
    await this.firestoreStorage.upsertAllocation(newAllocation);
    this.dropdownButton.close();
  }
}
