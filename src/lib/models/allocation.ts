/**
 * Represents a user-configured allocation of money in a particular budget
 * category into a financial account.
 */
export class Allocation {
  constructor(
    readonly categoryId: string,
    readonly accountId: string) {}

  /**
   * Returns a Firestore-friendly object that matches this allocation.
   * @param userId The ID of the user this Allocation is associated with.
   */
  toSchema(userId: string): AllocationSchema {
    return {
      userId,
      categoryId: this.categoryId,
      accountId: this.accountId,
    };
  }

  static fromSchema(schema: AllocationSchema): Allocation {
    return new Allocation(schema.categoryId, schema.accountId);
  }
}

export interface AllocationSchema {
  readonly userId: string;
  readonly categoryId: string;
  readonly accountId: string;
}
