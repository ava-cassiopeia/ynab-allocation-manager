import {Component, inject, input, computed, ViewChild, signal} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {Account, Category} from 'ynab';

import {AbsoluteSplitAllocation, Allocation, SingleAllocation} from '../../../../lib/models/allocation';
import {DropdownButton, DropdownMenuItem} from '../../common/dropdown-button/dropdown-button';
import {FirestoreStorage} from '../../../../lib/firestore/firestore_storage';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';
import {SplitSelector} from '../split-selector/split-selector';

@Component({
  selector: 'ya-allocation-selector',
  templateUrl: './allocation-selector.html',
  styleUrl: './allocation-selector.scss',
  imports: [DropdownButton, MatIcon, SplitSelector],
})
export class AllocationSelector {
  readonly category = input.required<Category>();

  @ViewChild(DropdownButton) dropdownButton!: DropdownButton<Account>;
  @ViewChild(SplitSelector) splitSelector!: SplitSelector;

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

    // TODO: Render something more interesting here
    if (allocation instanceof AbsoluteSplitAllocation) return null;
    if (!(allocation instanceof SingleAllocation)) return null;

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

    const selectedAccount = this.splitMode() ? this.splitState.defaultAccount() : this.allocatedAccount();

    return accounts.map((a) => ({
      label: a.name,
      icon: selectedAccount === a ? 'done' : 'account_balance',
      value: a,
      action: (value: Account) => {
        this.selectAccount(value);
      },
    }));
  });

  protected readonly splitMode = signal<boolean>(false);
  protected readonly splitState = {
    defaultAccount: signal<Account | null>(null),
  };
  protected readonly ynabStorage = inject(YnabStorage);

  private readonly firestoreStorage = inject(FirestoreStorage);

  protected async selectAccount(account: Account | null) {
    if (this.splitMode()) {
      this.splitState.defaultAccount.set(account);
      return;
    }

    const budget = this.ynabStorage.selectedBudget();
    if (budget === null) return;

    if (account === null) {
      await this.firestoreStorage.clearAllocationForCategory(this.category());
      this.dropdownButton.close();
      return;
    }

    const newAllocation = new SingleAllocation(budget.id, this.category().id, account.id);
    await this.firestoreStorage.upsertAllocation(newAllocation);
    this.dropdownButton.close();
  }

  protected toggleSplitMode() {
    this.splitMode.update((s) => !s);
  }

  protected applySplit() {
    const splits = this.splitSelector.getSplits();
    console.log(splits);
  }
}
