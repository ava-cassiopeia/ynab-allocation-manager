import {Component, inject, input, computed} from '@angular/core';
import {Account, Category} from 'ynab';

import {Currency} from '../../common/currency/currency';
import {DropdownButton, ButtonTheme} from '../../common/dropdown-button/dropdown-button';
import {FirestoreStorage} from '../../../../lib/firestore/firestore_storage';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';

@Component({
  selector: 'ya-account-summary',
  templateUrl: './account-summary.html',
  styleUrl: './account-summary.scss',
  imports: [Currency, DropdownButton],
})
export class AccountSummary {
  readonly account = input.required<Account>();

  protected readonly categories = computed<Category[]>(() => {
    const allocations = this.firestoreStorage.allocations()
      .filter((a) => a.accountId === this.account().id);
    const categoryIds = allocations.map((a) => a.categoryId);
    const groups = this.ynabStorage.categories.value() ?? [];
    const output: Category[] = [];
    for (const group of groups) {
      for (const category of group.categories) {
        if (categoryIds.includes(category.id)) {
          output.push(category);
        }
      }
    }

    return output;
  });

  protected readonly allocatedAmount = computed<number>(() => {
    let sum = 0.0;
    for (const category of this.categories()) {
      sum += category.balance;
    }
    return sum;
  });

  protected readonly delta = computed<number>(() => {
    return this.account().cleared_balance - this.allocatedAmount();
  });

  protected readonly hasAllocations = computed<boolean>(() => {
    return this.categories().length > 0;
  });

  protected readonly allocationsTheme = computed<ButtonTheme>(() => {
    if (!this.hasAllocations()) return 'default';
    const delta = this.delta();

    if (delta > 0) {
      return 'overage';
    } else if (delta < 0) {
      return 'warning';
    } else {
      return 'perfect';
    }
  });

  private readonly firestoreStorage = inject(FirestoreStorage);
  private readonly ynabStorage = inject(YnabStorage);
}
