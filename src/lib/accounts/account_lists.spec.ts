import {Account} from 'ynab';

import {AccountAllocation} from './account_data';
import {AccountMetadata} from '../models/account_metadata';
import {compareAccounts} from './account_lists';

describe('compareAccounts()', () => {
  it('indicates that a is greater than b', () => {
    const a = account('Fake A', 0.15);
    const b = account('Fake B', 0.10);

    expect(compareAccounts(a, b)).toBeLessThan(0);
  });

  it('indicates that b is greater than a', () => {
    const a = account('Fake A', 0.05);
    const b = account('Fake B', 0.10);

    expect(compareAccounts(a, b)).toBeGreaterThan(0);
  });

  it('indicates that a and b are equal', () => {
    const a = account('Fake A', 0.05);
    const b = account('Fake B', 0.05);

    expect(compareAccounts(a, b)).toEqual(0);
  });

  it('prefers an account with any interest rate', () => {
    const a = account('Fake A', 0.05);
    const b = account('Fake B', 0);

    expect(compareAccounts(a, b)).toBeLessThan(0);
  });

  it('sorts alphabetically barring other options', () => {
    const a = account('Fake A', 0);
    const b = account('Fake B', 0);

    expect(compareAccounts(a, b)).toBeLessThan(0);
  });

  it('works well with .sort()', () => {
    const accounts = [
      account('DDD', 0),
      account('CCC', 0),
      account('AAA', 0),
      account('BBB', 0.15),
    ];

    const sorted = accounts.sort((a, b) => compareAccounts(a, b)).map((a) => a.account.name);

    expect(sorted).toEqual([
      'BBB', // because this has a rate
      'AAA',
      'CCC',
      'DDD',
    ]);
  });
});

function account(name: string, interestRate: number): AccountAllocation {
  return {
    account: { name } as Account, // thin fake
    metadata: new AccountMetadata(
      'fake_account_id',
      'fake_budget_id',
      interestRate,
      0,
      0,
      null,
    ),
    categories: [], // unneeded
    total: 0, // unneeded
  };
}
