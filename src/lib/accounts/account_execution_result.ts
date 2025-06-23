import {Category} from "ynab";
import {AbsoluteSplitAllocation, Allocation, SingleAllocation} from "../models/allocation";

export class AccountExecutionBuilder {
  private readonly accumulator = new Map<AccountId, AccountExecutionResultBuilder>();
  private readonly categories = new Map<CategoryId, Category>();

  constructor(
    private readonly allocations: Allocation[],
    categories: Category[],
  ) {
    for (const category of categories) {
      this.categories.set(category.id, category);
    }
  }

  build(): Map<AccountId, AccountExecutionResult> {
    for (const allocation of this.allocations) {
      const category = this.categories.get(allocation.categoryId) ?? null;
      if (!category) continue;

      if (allocation instanceof SingleAllocation) {
        this.add(allocation.accountId, category, category.balance);
      } else if (allocation instanceof AbsoluteSplitAllocation) {
        let runningBalance = category.balance;
        for (const split of allocation.splits) {
          const splitAmount = runningBalance < split.millisAmount ? runningBalance : split.millisAmount;
          runningBalance -= splitAmount;
          this.add(split.accountId, category, splitAmount);
        }
        // TODO: Add fallback account logic here
      } else {
        throw new Error("Unsupported allocation type.");
      }
    }

    return this.accumulator;
  }

  private add(accountId: AccountId, category: Category, millis: number) {
    if (!this.accumulator.has(accountId)) {
      this.accumulator.set(accountId, {
        categories: [category],
        allocatedMillis: millis,
      });
      return;
    }

    const builder = this.accumulator.get(accountId)!;
    builder.categories.push(category);
    builder.allocatedMillis += millis;
  }
}

export interface AccountExecutionResultBuilder {
  categories: Category[];
  allocatedMillis: number;
}

export interface AccountExecutionResult {
  readonly categories: Category[];
  readonly allocatedMillis: number;
}

type AccountId = string;
type CategoryId = string;
