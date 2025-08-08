/**
 * Represents metadata about a single bank account.
 */
export class AccountMetadata {
  constructor(
    readonly accountId: string,
    readonly budgetId: string,
    readonly interestRate: number,
    readonly interestThresholdMillis: number,
    readonly minimumBalanceMillis: number,
    readonly lastReconciled: Date | null,
  ) {}

  /**
   * Returns a Firestore-friendly object that matches this allocation.
   * @param userId The ID of the user this Allocation is associated with.
   */
  toSchema(userId: string): AccountMetadataSchema {
    return {
      userId,
      accountId: this.accountId,
      budgetId: this.budgetId,
      interestRate: this.interestRate,
      interestThresholdMillis: this.interestThresholdMillis,
      minimumBalanceMillis: this.minimumBalanceMillis,
      lastReconciled: this.lastReconciled?.getTime() ?? null,
    };
  }

  reconcile(date = new Date()): AccountMetadata {
    return new AccountMetadata(
      this.accountId,
      this.budgetId,
      this.interestRate,
      this.interestThresholdMillis,
      this.minimumBalanceMillis,
      date,
    );
  }

  static fromSchema(schema: AccountMetadataSchema): AccountMetadata {
    return new AccountMetadata(
      schema.accountId,
      schema.budgetId,
      schema.interestRate,
      schema.interestThresholdMillis,
      schema.minimumBalanceMillis,
      (schema.lastReconciled ? new Date(schema.lastReconciled) : null),
    );
  }
}

export interface AccountMetadataSchema {
  readonly userId: string;
  readonly accountId: string;
  readonly budgetId: string;
  readonly interestRate: number;
  readonly interestThresholdMillis: number;
  readonly minimumBalanceMillis: number;
  readonly lastReconciled: number | null; // milliseconds
}
