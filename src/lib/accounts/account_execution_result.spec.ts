import {Category} from "ynab";

import {AccountExecutionBuilder, AccountExecutionResult} from "./account_execution_result";
import {AbsoluteSplitAllocation, AbsoluteSplitEntry, SingleAllocation} from "../models/allocation";

describe("AccountExecutionBuilder", () => {
  it("sums up values correctly", () => {
    const categories = [
      cat("1", 1000),
      cat("2", 2000),
    ];
    const allocations = [
      single("1", "fake_account_1"),
      absoluteSplit("2", [
        {
          accountId: "fake_account_1",
          millisAmount: 1000,
        },
        {
          accountId: "fake_account_2",
          millisAmount: 1000,
        },
      ], "fake_account_3"),
    ];
    const results = new AccountExecutionBuilder(allocations, categories).build();

    expect(results.size).toEqual(2);
    assertAccount(results.get("fake_account_1")!, 2, 2000);
    assertAccount(results.get("fake_account_2")!, 1, 1000);
  });

  it("overflows values to the default account, if needed", () => {
    const categories = [
      cat("1", 1000),
      cat("2", 5000),
    ];
    const allocations = [
      single("1", "fake_account_1"),
      absoluteSplit("2", [
        {
          accountId: "fake_account_1",
          millisAmount: 1000,
        },
        {
          accountId: "fake_account_2",
          millisAmount: 1000,
        },
      ], "fake_account_3"),
    ];
    const results = new AccountExecutionBuilder(allocations, categories).build();

    expect(results.size).toEqual(3);
    assertAccount(results.get("fake_account_1")!, 2, 2000);
    assertAccount(results.get("fake_account_2")!, 1, 1000);
    assertAccount(results.get("fake_account_3")!, 1, 3000);
  });

  it("overflows only the available amount", () => {
    const categories = [
      cat("1", 1000),
      cat("2", 500),
    ];
    const allocations = [
      single("1", "fake_account_1"),
      absoluteSplit("2", [
        {
          accountId: "fake_account_1",
          millisAmount: 1000,
        },
        {
          accountId: "fake_account_2",
          millisAmount: 1000,
        },
      ], "fake_account_3"),
    ];
    const results = new AccountExecutionBuilder(allocations, categories).build();

    expect(results.size).toEqual(2);
    assertAccount(results.get("fake_account_1")!, 2, 1500);
    assertAccount(results.get("fake_account_2")!, 1, 0);
  });
});

function assertAccount(result: AccountExecutionResult, categoryCount: number, millis: number) {
  expect(result.categories.length).toEqual(categoryCount);
  expect(result.allocatedMillis).toEqual(millis);
}

function cat(id: string, balance: number): Category {
  return {
    id,
    balance,
  } as Category;
}

function single(categoryId: string, accountId: string): SingleAllocation {
  return new SingleAllocation("fake_budget", categoryId, accountId);
}

function absoluteSplit(categoryId: string, entries: AbsoluteSplitEntry[], defaultCategoryId: string): AbsoluteSplitAllocation {
  return new AbsoluteSplitAllocation("fake_budget", categoryId, defaultCategoryId, entries);
}
