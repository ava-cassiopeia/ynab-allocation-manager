/**
 * Represents a user-configured allocation of money in a particular budget
 * category into a financial account.
 */
export abstract class Allocation {
  constructor(
      readonly id: string | null,
      readonly budgetId: string,
      readonly categoryId: string) {}

  abstract toSchema(userId: string): AllocationSchema;

  static fromSchema(id: string, schema: LegacyAllocationSchema): Allocation {
    switch (schema.type) {
      case undefined:
      case AllocationType.SINGLE:
        return new SingleAllocation(
            id,
            schema.budgetId,
            schema.categoryId,
            schema.accountId);
      case AllocationType.ABSOLUTE_SPLIT:
        return new AbsoluteSplitAllocation(
            id,
            schema.budgetId,
            schema.categoryId,
            schema.defaultAccountId,
            schema.splits);
    }
  }
}

/**
 * An allocation of a single category to a single account.
 */
export class SingleAllocation extends Allocation {
  constructor(
      id: string | null,
      budgetId: string,
      categoryId: string,
      readonly accountId: string) {
    super(id, budgetId, categoryId);
  }

  /**
   * Returns a Firestore-friendly object that matches this allocation.
   * @param userId The ID of the user this Allocation is associated with.
   */
  override toSchema(userId: string): AllocationSchema {
    return {
      userId,
      type: AllocationType.SINGLE,
      budgetId: this.budgetId,
      categoryId: this.categoryId,
      accountId: this.accountId,
    };
  }
}

export class AbsoluteSplitAllocation extends Allocation {
  constructor(
      id: string | null,
      budgetId: string,
      categoryId: string,
      readonly defaultAccountId: string,
      readonly splits: AbsoluteSplitEntry[]) {
    super(id, budgetId, categoryId);
  }

  override toSchema(userId: string): AllocationSchema {
    return {
      type: AllocationType.ABSOLUTE_SPLIT,
      userId,
      budgetId: this.budgetId,
      categoryId: this.categoryId,
      splits: this.splits,
      defaultAccountId: this.defaultAccountId,
    };
  }
}

/**
 * Represents an allocation from the database which had a type that was
 * unrecognized.
 */
export class UnknownAllocation extends Allocation {
  override toSchema(userId: string): AllocationSchema {
    throw new Error('Cannot convert allocation to schema, it is unknown.');
  }
}

export enum AllocationType {
  // This allocation allocates a category to one account.
  SINGLE = 'single',

  // This allocation allocates a category to multiple accounts, wherein each
  // account gets a fixed number which trickles down to a 'default' account.
  ABSOLUTE_SPLIT = 'absolute_split',
}

/**
 * The ideal, outgoing schema to Firestore.
 */
export type AllocationSchema = {
  readonly userId: string;
  readonly budgetId: string;
  readonly categoryId: string;
} & (
  {
    readonly type: AllocationType.SINGLE;
    readonly accountId: string;
  } | {
    readonly type: AllocationType.ABSOLUTE_SPLIT;
    readonly splits: AbsoluteSplitEntry[];
    readonly defaultAccountId: string;
  }
);

/**
 * The historical, possible-to-be-in Firestore schema.
 */
export type LegacyAllocationSchema = {
  readonly userId: string;
  readonly budgetId: string;
  readonly categoryId: string;
} & (
  {
    readonly type?: AllocationType.SINGLE;
    readonly accountId: string;
  } | {
    readonly type: AllocationType.ABSOLUTE_SPLIT;
    readonly splits: AbsoluteSplitEntry[];
    readonly defaultAccountId: string;
  }
);

export interface AbsoluteSplitEntry {
  readonly accountId: string;
  readonly millisAmount: number;
}
