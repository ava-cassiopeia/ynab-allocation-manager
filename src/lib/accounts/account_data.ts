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
  /**
   * All of the user's active accounts, with summary information for their
   * allocations.
   */
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

  /**
   * The total amount of allocated money across all accounts.
   */
  readonly totalAllocated = computed<number>(() => {
    let sum = 0;
    for (const account of this.accounts()) {
      sum += account.total;
    }
    return sum;
  });

  /**
   * The total available money (cleared) across all accounts.
   */
  readonly totalAvailable = computed<number>(() => {
    let sum = 0;
    for (const account of this.accounts()) {
      sum += account.account.cleared_balance;
    }
    return sum;
  });

  /**
   * The total remaining available cash after all allocations.
   */
  readonly availableCash = computed<number>(() => {
    return this.totalAvailable() - this.totalAllocated();
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
