import {AccountAllocation} from './account_data';

/**
 * sort()-friendly comparison that sorts by interest rate and then name.
 */
export function compareAccounts(a: AccountAllocation, b: AccountAllocation): number {
  let aInterest = a.metadata?.interestRate ?? null;
  let bInterest = b.metadata?.interestRate ?? null;
  if (aInterest === 0) aInterest = null;
  if (bInterest === 0) bInterest = null;

  if (aInterest != null && bInterest != null) {
    return bInterest - aInterest;
  } else if (aInterest == null && bInterest != null) {
    return 1; // bInterest is bigger automatically
  } else if (aInterest != null && bInterest == null) {
    return -1; // aInterest is bigger automatically
  }

  // Otherwise fall back to alphabetical comparison.
  return a.account.name.localeCompare(b.account.name);
}
