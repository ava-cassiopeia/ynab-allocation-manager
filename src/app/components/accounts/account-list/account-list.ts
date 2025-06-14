import {Category} from 'ynab';
import {Component, inject, computed} from '@angular/core';

import {AccountSummary, AccountAllocation} from '../account-summary/account-summary';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';
import {FirestoreStorage} from '../../../../lib/firestore/firestore_storage';
import {Allocation} from '../../../../lib/models/allocation';

@Component({
  selector: 'ya-account-list',
  templateUrl: './account-list.html',
  styleUrl: './account-list.scss',
  imports: [AccountSummary],
})
export class AccountList {
  private readonly ynabStorage = inject(YnabStorage);
  private readonly firestoreStorage = inject(FirestoreStorage);

  protected readonly accounts = computed<AccountAllocation[]>(() => {
    const accounts = this.ynabStorage.accounts.value() ?? [];
    if (accounts.length < 1) return [];

    const allocations = this.firestoreStorage.allocations();

    const allocationsMap = new Map<AccountId, Allocation[]>();
    for (const allocation of allocations) {
      if (!allocationsMap.has(allocation.accountId)) {
        allocationsMap.set(allocation.accountId, [allocation]);
        continue;
      }

      allocationsMap.get(allocation.accountId)!.push(allocation);
    }

    const groups = this.ynabStorage.categories.value() ?? [];
    const categories = groups.flatMap((v) => v.categories);
    const categoriesMap = new Map<CategoryId, Category>();
    for (const category of categories) {
      categoriesMap.set(category.id, category);
    }

    return accounts.map((account) => {
      const allocations = allocationsMap.get(account.id) ?? [];
      const accountCategories: Category[] = [];
      for (const allocation of allocations) {
        const category = categoriesMap.get(allocation.categoryId);
        if (!category) continue;

        accountCategories.push(category);
      }

      return {
        account,
        categories: accountCategories,
      };
    });
  });
}

type AccountId = string;
type CategoryId = string;
