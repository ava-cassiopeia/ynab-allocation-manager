/**
 * Represents metadata about a single bank account.
 */
export class AccountMetadata {
  constructor(
    readonly accountId: string,
    readonly interestRate: number,
    readonly interestThresholdMillis: number,
    readonly minimumBalanceMillis: number
  ) {}

  /**
   * Returns a Firestore-friendly object that matches this allocation.
   * @param userId The ID of the user this Allocation is associated with.
   */
  toSchema(userId: string): AccountMetadataSchema {
    return {
      userId,
      accountId: this.accountId,
      interestRate: this.interestRate,
      interestThresholdMillis: this.interestThresholdMillis,
      minimumBalanceMillis: this.minimumBalanceMillis,
    };
  }

  static fromSchema(schema: AccountMetadataSchema): AccountMetadata {
    return new AccountMetadata(
      schema.accountId,
      schema.interestRate,
      schema.interestThresholdMillis,
      schema.minimumBalanceMillis
    );
  }
}

export interface AccountMetadataSchema {
  readonly userId: string;
  readonly accountId: string;
  readonly interestRate: number;
  readonly interestThresholdMillis: number;
  readonly minimumBalanceMillis: number;
}
