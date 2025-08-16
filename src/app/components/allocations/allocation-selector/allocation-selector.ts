import {Component, inject, input, computed, ViewChild, signal, effect} from '@angular/core';
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

    let accountId: string;
    if (allocation instanceof AbsoluteSplitAllocation) {
      accountId = allocation.defaultAccountId;
    } else if (allocation instanceof SingleAllocation) {
      accountId = allocation.accountId;
    } else {
      return null;
    }

    const accounts = this.ynabStorage.accounts.value();
    if (!accounts) return null;

    for (const account of accounts) {
      if (account.id === accountId) {
        return account;
      }
    }

    return null;
  });

  protected readonly label = computed<string>(() => {
    const allocation = this.allocation();
    if (!allocation) return '-';

    const allocatedName = this.allocatedAccount()?.name ?? '?';
    if (allocation instanceof SingleAllocation) {
      return allocatedName;
    } else if (allocation instanceof AbsoluteSplitAllocation) {
      return `${allocatedName} (+${allocation.splits.length})`;
    } else {
      return '??';
    }
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

  constructor() {
    // Update the splitMode based on the current allocation.
    effect(() => {
      const allocation = this.allocation();

      if (allocation instanceof AbsoluteSplitAllocation) {
        this.splitMode.set(true);
        const defaultAccount = this.ynabStorage.findAccount(allocation.defaultAccountId);
        if (defaultAccount) {
          this.splitState.defaultAccount.set(defaultAccount);
        }
      } else if (allocation instanceof SingleAllocation) {
        this.splitMode.set(false);
      }
    });
  }

  protected async selectAccount(account: Account | null) {
    if (account === null) {
      await this.firestoreStorage.clearAllocationForCategory(this.category());
      this.dropdownButton.close();
      return;
    }

    if (this.splitMode()) {
      this.splitState.defaultAccount.set(account);
      return;
    }

    const budget = this.ynabStorage.selectedBudget();
    if (budget === null) return;

    const newAllocation = new SingleAllocation(null, budget.id, this.category().id, account.id);
    await this.firestoreStorage.upsertAllocation(newAllocation);
    this.dropdownButton.close();
  }

  protected toggleSplitMode() {
    this.splitMode.update((s) => !s);
  }

  protected async applySplit() {
    const splits = this.splitSelector.getEntries();
    const defaultAccount = this.splitState.defaultAccount();
    const budget = this.ynabStorage.selectedBudget();
    if (!budget) return;
    if (!defaultAccount) return;

    const allocation = new AbsoluteSplitAllocation(
        null,
        budget.id,
        this.category().id,
        defaultAccount.id,
        splits);
    await this.firestoreStorage.upsertAllocation(allocation);

    this.dropdownButton.close();
  }
}
