import {computed, Injectable, inject} from "@angular/core";
import {Account, Category} from "ynab";

import {YnabStorage} from "../ynab/ynab_storage";
import {FirestoreStorage} from "../firestore/firestore_storage";
import {AccountExecutionBuilder} from "./account_execution_result";
import {AccountMetadata} from "../models/account_metadata";

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
    const metadata = this.firestoreStorage.accountMetadata();
    if (accounts.length < 1) return [];

    const groups = this.ynabStorage.latestCategories.value() ?? [];
    const categories = groups.flatMap((v) => v.categories);

    const allocations = this.firestoreStorage.allocations();
    const executionResults = new AccountExecutionBuilder(allocations, categories).build();

    return accounts.map((account) => {
      const executionResult = executionResults.get(account.id) ?? null;
      const accountMetadata = metadata.get(account.id) ?? null;

      return {
        account,
        metadata: accountMetadata,
        categories: executionResult?.categories ?? [],
        total: executionResult?.allocatedMillis ?? 0,
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
   let total = 0;
   for (const account of this.accounts()) {
      const allocated = account.total;
      const balance = account.account.cleared_balance;

      if (balance > allocated) {
        const diff = balance - allocated;
        total += diff;
      }
   }
   return total;
 });

  private readonly ynabStorage = inject(YnabStorage);
  private readonly firestoreStorage = inject(FirestoreStorage);
}

/**
 * Summarizes the allocation for a given account.
 */
export interface AccountAllocation {
  readonly account: Account;
  readonly metadata: AccountMetadata | null;
  readonly categories: Category[];
  readonly total: number;
}
