import {Injectable, signal, effect, inject} from '@angular/core';
import {User} from 'firebase/auth';
import {Unsubscribe, onSnapshot, query, collection, where, addDoc, getDocs, updateDoc, doc, deleteDoc, writeBatch} from 'firebase/firestore';
import {BudgetSummary, Category} from 'ynab';

import {AccountMetadata} from '../models/account_metadata';
import {AbsoluteSplitAllocation, Allocation, SingleAllocation} from '../models/allocation';
import {AuthStorage} from '../firebase/auth_storage';
import {SettingsStorage} from '../firebase/settings_storage';
import {UserMetadata} from '../models/user_metadata';
import {YnabStorage} from '../ynab/ynab_storage';
import {db} from "../firebase/app";

@Injectable({providedIn: 'root'})
export class FirestoreStorage {
  readonly allocations = signal<Allocation[]>([]);
  readonly accountMetadata = signal<Map<AccountId, AccountMetadata>>(new Map());
  readonly userMetadata = signal<UserMetadata | null>(null);

  private readonly ynabStorage = inject(YnabStorage);
  private readonly authStorage = inject(AuthStorage);
  private readonly settingsStorage = inject(SettingsStorage);

  private allocationsUnsubscribe: Unsubscribe | null = null;
  private accountUnsubscribe: Unsubscribe | null = null;
  private settingsUnsubscribe: Unsubscribe | null = null;
  private metadataUnsubscribe: Unsubscribe | null = null;

  constructor() {
    // Subscribe to updates for the user's data once we have a user.
    effect(async () => {
      const user = this.authStorage.currentUser();
      const budget = this.ynabStorage.selectedBudget();

      if (user === null) return;
      this.listenForSettingsUpdates(user);

      if (budget === null) return;
      this.listenForAllocationsUpdates(user, budget);
      this.listenForAccountUpdates(user, budget);
    });

    // Subscribe to updates for the user's metadata once we have a user.
    effect(() => {
      const currentUser = this.authStorage.currentUser();
      if (currentUser === null) return;

      this.listenForMetadataUpdates(currentUser);
    });

    // Update the API token needed to reach YNAB, once it is available through
    // the user's settings.
    effect(() => {
      const metadata = this.userMetadata();
      if (metadata === null) {
        this.ynabStorage.apiKey.set(null);
      } else {
        this.ynabStorage.apiKey.set(metadata.lastToken.access_token);
      }
    });
  }

  /**
   * We never really want there to be multiple allocations per category (maybe
   * a cool future feature?), so if there is one, update it instead of adding
   * a new allocation.
   */
  async upsertAllocation(allocation: Allocation) {
    const user = this.authStorage.currentUser();
    if (user === null) return;

    const budget = this.ynabStorage.selectedBudget();
    if (budget === null) return;

    const allocationsQuery = query(
      collection(db, 'allocations'),
      where("userId", "==", user.uid),
      where("categoryId", "==", allocation.categoryId),
      where("budgetId", "==", budget.id));
    const querySnapshot = await getDocs(allocationsQuery);

    const existingAllocation = querySnapshot.docs[0] ?? null;

    if (existingAllocation === null) {
      await addDoc(
        collection(db, 'allocations'),
        allocation.toSchema(this.assertUser().uid));
    } else {
      updateDoc(existingAllocation.ref, {
        ...allocation.toSchema(user.uid),
      });
    }
  }

  /**
   * We never really want there to be multiple account metadata entries per
   * account, so if there is one, just update it.
   */
  async upsertAccount(account: AccountMetadata) {
    const user = this.authStorage.currentUser();
    if (user === null) return;

    const budget = this.ynabStorage.selectedBudget();
    if (budget === null) return;

    const accountsQuery = query(
      collection(db, 'accounts'),
      where("userId", "==", user.uid),
      where("budgetId", "==", budget.id),
      where("accountId", "==", account.accountId));
    const querySnapshot = await getDocs(accountsQuery);

    const existingAccount = querySnapshot.docs[0] ?? null;

    if (existingAccount === null) {
      await addDoc(
        collection(db, 'accounts'),
        account.toSchema(this.assertUser().uid));
    } else {
      updateDoc(existingAccount.ref, {
        ...account.toSchema(user.uid),
      });
    }
  }

  async clearAllocationForCategory(category: Category) {
    const user = this.authStorage.currentUser();
    if (user === null) return;

    const budget = this.ynabStorage.selectedBudget();
    if (budget === null) return;

    const allocationsQuery = query(
      collection(db, 'allocations'),
      where("userId", "==", user.uid),
      where("categoryId", "==", category.id),
      where("budgetId", "==", budget.id));
    const querySnapshot = await getDocs(allocationsQuery);

    const promises: Promise<void>[] = [];
    querySnapshot.forEach((doc) => {
      promises.push(deleteDoc(doc.ref));
    });
    await Promise.all(promises);
  }

  async clearAllocationsForBudget() {
    const user = this.authStorage.currentUser();
    if (user === null) return;

    const budget = this.ynabStorage.selectedBudget();
    if (budget === null) return;


    const deleteQuery = query(
      collection(db, 'allocations'),
      where("userId", "==", user.uid),
      where("budgetId", "==", budget.id));
    const snapshot = await getDocs(deleteQuery);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  async reconcileMetadata(metadata: AccountMetadata) {
    await this.upsertAccount(metadata.reconcile());
  }

  private assertUser(): User {
    const user = this.authStorage.currentUser();
    if (user === null) {
      throw new Error("User doesn't exist yet!");
    }

    return user;
  }

  private listenForAllocationsUpdates(forUser: User, forBudget: BudgetSummary) {
    if (this.allocationsUnsubscribe !== null) {
      this.allocationsUnsubscribe();
    }

    // Update local copy of allocations whenever the user's allocations change
    // in the database.
    const allocationsQuery = query(
      collection(db, 'allocations'),
      where("userId", "==", forUser.uid),
      where("budgetId", "==", forBudget.id));
    this.allocationsUnsubscribe = onSnapshot(allocationsQuery, (querySnapshot) => {
      const allocations: Allocation[] = [];
      querySnapshot.forEach((doc) => {
        allocations.push(Allocation.fromSchema(doc.id, doc.data() as any));
      });

      const {unused, used} = this.filterUnusedAllocations(allocations);
      // Don't await this method, it can happen in the background.
      this.cullUnusedAllocations(unused);

      this.allocations.set(used);
    });
  }

  private async cullUnusedAllocations(unused: Allocation[]): Promise<void> {
    const batch = writeBatch(db);

    for (const alloc of unused) {
      if (alloc.id === null) continue;

      batch.delete(doc(db, "allocations", alloc.id));
    }

    await batch.commit();
  }

  /**
   * Sorts all of the provided allocations by whether they are used or not.
   * Each allocation is compared against the current list of accounts in YNAB
   * to determine whether it is used.
   */
  private filterUnusedAllocations(allocations: Allocation[]): FilteredAllocations {
    const used: Allocation[] = [];
    const unused: Allocation[] = [];

    for (const allocation of allocations) {
      const accountIds: string[] = [];
      if (allocation instanceof SingleAllocation) {
        accountIds.push(allocation.accountId);
      } else if (allocation instanceof AbsoluteSplitAllocation) {
        accountIds.push(allocation.defaultAccountId);
        accountIds.push(...allocation.splits.map((s) => s.accountId));
      }

      const matches = accountIds.filter((id) => !!this.ynabStorage.findAccount(id));

      if (matches.length > 0) {
        used.push(allocation);
      } else {
        unused.push(allocation);
      }
    }

    return {used, unused};
  }

  private async cullUnusedAccountMetadata(unused: AccountMetadata[]): Promise<void> {
    const batch = writeBatch(db);

    for (const metadata of unused) {
      if (metadata.id === null) continue;

      batch.delete(doc(db, "accounts", metadata.id));
    }

    await batch.commit();
  }

  private filterUnusedAccountMetadata(metadataList: AccountMetadata[]): FilteredAccountMetadata {
    const used: AccountMetadata[] = [];
    const unused: AccountMetadata[] = [];

    for (const metadata of metadataList) {
      const accountExists = this.ynabStorage.findAccount(metadata.accountId);

      if (accountExists) {
        used.push(metadata);
      } else {
        unused.push(metadata);
      }
    }

    return {used, unused};
  }

  private listenForAccountUpdates(forUser: User, forBudget: BudgetSummary) {
    if (this.accountUnsubscribe !== null) {
      this.accountUnsubscribe();
    }

    // Update local copy of accounts' metadata whenever the user's metadata
    // change in the database.
    const accountsQuery = query(
      collection(db, 'accounts'),
      where("userId", "==", forUser.uid),
      where("budgetId", "==", forBudget.id));
    this.accountUnsubscribe = onSnapshot(accountsQuery, (querySnapshot) => {
      const accounts = new Map<AccountId, AccountMetadata>();
      querySnapshot.forEach((doc) => {
        const account = AccountMetadata.fromSchema(doc.id, doc.data() as any);
        accounts.set(account.accountId, account);
      });

      const {used, unused} = this.filterUnusedAccountMetadata([...accounts.values()]);
      this.cullUnusedAccountMetadata(unused);

      // TODO: Encapsulate this logic more.
      const output = new Map<AccountId, AccountMetadata>();
      used.forEach((u) => output.set(u.accountId, u));
      this.accountMetadata.set(output);
    });
  }

  private listenForSettingsUpdates(forUser: User) {
    if (this.settingsUnsubscribe !== null) {
      this.settingsUnsubscribe();
    }

    // Keep user settings in sync.
    this.settingsUnsubscribe = onSnapshot(doc(db, 'settings', forUser.uid), (docSnapshot) => {
      const data = docSnapshot.data();
      if (!data) return;

      this.settingsStorage.reload();
    });
  }

  private listenForMetadataUpdates(forUser: User) {
    if (this.metadataUnsubscribe !== null) {
      this.metadataUnsubscribe();
    }

    // Keep user metadata in sync.
    this.metadataUnsubscribe = onSnapshot(doc(db, 'users', forUser.uid), (docSnapshot) => {
      const data = docSnapshot.data();
      if (!data) return;

      this.userMetadata.set(data as UserMetadata);
    });
  }
}

type AccountId = string;

interface FilteredAllocations {
  readonly used: Allocation[];
  readonly unused: Allocation[];
}

interface FilteredAccountMetadata {
  readonly used: AccountMetadata[];
  readonly unused: AccountMetadata[];
}
