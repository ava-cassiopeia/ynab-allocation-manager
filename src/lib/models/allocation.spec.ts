import {Allocation} from "./allocation";

describe('Allocation', () => {
  describe('.toSchema()', () => {
    it('outputs equivalent schema', () => {
      const alloc = new Allocation(
          'fake_budget_id',
          'fake_category_id',
          'fake_account_id');

      expect(alloc.toSchema('fake_user_id')).toEqual({
        userId: 'fake_user_id',
        budgetId: 'fake_budget_id',
        categoryId: 'fake_category_id',
        accountId: 'fake_account_id',
      });
    });
  });

  describe('.fromSchema()', () => {
    it('loads all data from the provided schema', () => {
      const alloc = Allocation.fromSchema({
        userId: 'fake_user_id',
        budgetId: 'fake_budget_id',
        categoryId: 'fake_category_id',
        accountId: 'fake_account_id',
      });

      expect(alloc.budgetId).toEqual('fake_budget_id');
      expect(alloc.categoryId).toEqual('fake_category_id');
      expect(alloc.accountId).toEqual('fake_account_id');
    });
  });
});
