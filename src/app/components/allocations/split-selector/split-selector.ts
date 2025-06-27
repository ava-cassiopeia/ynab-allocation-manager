import {Component, signal, inject} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {Account} from 'ynab';

import {YnabStorage} from '../../../../lib/ynab/ynab_storage';

@Component({
  selector: 'ya-split-selector',
  templateUrl: './split-selector.html',
  styleUrl: './split-selector.scss',
  imports: [ReactiveFormsModule],
})
export class SplitSelector {
  protected readonly splits = signal<ConfiguredSplit[]>([
    // Start the user off with two blank splits
    this.mkSplit(),
    this.mkSplit(),
  ]);

  protected readonly ynabStorage = inject(YnabStorage);

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

  protected addSplit() {
    this.splits.update((s) => [...s, this.mkSplit()]);
  }

  private mkSplit(): ConfiguredSplit {
    return {
      account: new FormControl<Account | null>(null),
      amount: new FormControl<number>(0),
    };
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
