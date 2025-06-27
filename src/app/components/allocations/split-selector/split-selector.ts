import {Component, signal, inject, input, effect} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {Account} from 'ynab';

import {YnabStorage} from '../../../../lib/ynab/ynab_storage';
import {AbsoluteSplitAllocation, AbsoluteSplitEntry, Allocation} from '../../../../lib/models/allocation';

@Component({
  selector: 'ya-split-selector',
  templateUrl: './split-selector.html',
  styleUrl: './split-selector.scss',
  imports: [ReactiveFormsModule, MatIcon],
})
export class SplitSelector {
  readonly allocation = input<Allocation | null>();

  protected readonly splits = signal<ConfiguredSplit[]>([
    // Start the user off with two blank splits
    this.mkSplit(),
    this.mkSplit(),
  ]);

  protected readonly ynabStorage = inject(YnabStorage);

  constructor() {
    effect(() => {
      const allocation = this.allocation();
      if (!allocation) return;

      this.importFromAllocation(allocation);
    });
  }

  getSplits(): FinalSplit[] {
    const output: FinalSplit[] = [];
    for (const split of this.splits()) {
      const account = split.account.value;
      const amount = split.amount.value ?? 0;
      if (!account) continue;

      output.push({account, amount});
    }
    return output;
  }

  getEntries(): AbsoluteSplitEntry[] {
    return this.getSplits().map((s) => ({
      accountId: s.account.id,
      millisAmount: s.amount * 1000.0,
    }));
  }

  protected removeSplit(event: Event, index: number) {
    event.preventDefault();
    event.stopPropagation();

    const splits = this.splits();
    const newSplits = [
      ...splits.slice(0, index),
      ...splits.slice(index + 1),
    ];

    this.splits.set(newSplits);
  }

  protected addSplit() {
    this.splits.update((s) => [...s, this.mkSplit()]);
  }

  private mkSplit(): ConfiguredSplit {
    return {
      account: new FormControl<Account | null>(null),
      amount: new FormControl<number>(0),
    };
  }

  private importFromAllocation(allocation: Allocation | null) {
    if (!allocation) return;
    if (!(allocation instanceof AbsoluteSplitAllocation)) return;

    const newSplits: ConfiguredSplit[] = [];
    for (const split of allocation.splits) {
      const account = this.ynabStorage.findAccount(split.accountId);
      if (!account) continue;

      newSplits.push({
        account: new FormControl(account),
        amount: new FormControl(split.millisAmount / 1000.0),
      });
    }

    this.splits.set(newSplits);
  }
}

interface ConfiguredSplit {
  readonly account: FormControl<Account | null>;
  readonly amount: FormControl<number | null>;
}

interface FinalSplit {
  readonly account: Account;
  readonly amount: number;
}
