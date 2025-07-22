import {
  AccountMetadata,
  AccountMetadataSchema,
} from './account_metadata';

describe('AccountMetadata', () => {
  describe('.toSchema()', () => {
    it('outputs equivalent schema', () => {
      const accountMetadata = new AccountMetadata(
        'fake_account_id',
        'fake_budget_id',
        0.05,
        100000,
        50000
      );

      expect(accountMetadata.toSchema('fake_user_id')).toEqual({
        userId: 'fake_user_id',
        accountId: 'fake_account_id',
        budgetId: 'fake_budget_id',
        interestRate: 0.05,
        interestThresholdMillis: 100000,
        minimumBalanceMillis: 50000,
      });
    });
  });

  describe('.fromSchema()', () => {
    it('loads all data from the provided schema', () => {
      const schema: AccountMetadataSchema = {
        userId: 'fake_user_id',
        accountId: 'fake_account_id',
        budgetId: 'fake_budget_id',
        interestRate: 0.05,
        interestThresholdMillis: 100000,
        minimumBalanceMillis: 50000,
      };
      const accountMetadata = AccountMetadata.fromSchema(schema);

      expect(accountMetadata.accountId).toEqual('fake_account_id');
      expect(accountMetadata.budgetId).toEqual('fake_budget_id');
      expect(accountMetadata.interestRate).toEqual(0.05);
      expect(accountMetadata.interestThresholdMillis).toEqual(100000);
      expect(accountMetadata.minimumBalanceMillis).toEqual(50000);
    });
  });
});
