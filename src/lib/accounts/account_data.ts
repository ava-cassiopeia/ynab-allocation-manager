import {computed, Injectable, inject} from "@angular/core";
import {Account, Category} from "ynab";

import {YnabStorage} from "../ynab/ynab_storage";
import {FirestoreStorage} from "../firestore/firestore_storage";
import {Allocation} from "../models/allocation";

/**
 * Contains pre-computed signals for common account information.
 */
@Injectable({providedIn: "root"})
export class AccountData {
  readonly accounts = computed<AccountAllocation[]>(() => {
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

    const groups = this.ynabStorage.latestCategories.value() ?? [];
    const categories = groups.flatMap((v) => v.categories);
    const categoriesMap = new Map<CategoryId, Category>();
    for (const category of categories) {
      categoriesMap.set(category.id, category);
    }

    return accounts.map((account) => {
      const allocations = allocationsMap.get(account.id) ?? [];
      const accountCategories: Category[] = [];
      let sum = 0;
      for (const allocation of allocations) {
        const category = categoriesMap.get(allocation.categoryId);
        if (!category) continue;

        accountCategories.push(category);
        sum += category.balance;
      }

      return {
        account,
        categories: accountCategories,
        total: sum,
      };
    });
  });

  private readonly ynabStorage = inject(YnabStorage);
  private readonly firestoreStorage = inject(FirestoreStorage);
}

/**
 * Summarizes the allocation for a given account.
 */
export interface AccountAllocation {
  readonly account: Account;
  readonly categories: Category[];
  readonly total: number;
}

type AccountId = string;
type CategoryId = string;
