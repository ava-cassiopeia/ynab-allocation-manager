import {Injectable, signal, effect, inject} from '@angular/core';
import {User} from 'firebase/auth';
import {Unsubscribe, onSnapshot, query, collection, where, addDoc, getDocs, updateDoc, doc, setDoc, deleteDoc, writeBatch} from 'firebase/firestore';
import {BudgetSummary, Category} from 'ynab';

import {Allocation} from '../models/allocation';
import {AuthStorage} from '../firebase/auth_storage';
import {UserMetadata} from '../models/user_metadata';
import {YnabStorage} from '../ynab/ynab_storage';
import {db} from "../firebase/app";

@Injectable({providedIn: 'root'})
export class FirestoreStorage {
  readonly allocations = signal<Allocation[]>([]);

  readonly settings = signal<UserSettings>({
    selectedBudgetId: null,
  });
  readonly userMetadata = signal<UserMetadata | null>(null);

  private readonly ynabStorage = inject(YnabStorage);
  private readonly authStorage = inject(AuthStorage);

  private allocationsUnsubscribe: Unsubscribe | null = null;
  private settingsUnsubscribe: Unsubscribe | null = null;
  private metadataUnsubscribe: Unsubscribe | null = null;

  constructor() {
    // Subscribe to updates for the user's data once we have a user.
    effect(() => {
      const user = this.authStorage.currentUser();
      const budget = this.ynabStorage.selectedBudget();

      if (user === null) return;
      this.listenForSettingsUpdates(user);

      if (budget === null) return;

      setDoc(doc(db, 'settings', user.uid), {
        selectedBudgetId: budget.id,
      });
      this.listenForAllocationsUpdates(user, budget);
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

    // Update the currently selected budget based on the updated selected budget
    // from the user's settings.
    effect(() => {
      const settingsBudgetId = this.settings().selectedBudgetId;
      if (settingsBudgetId === null) return;

      const budgets = this.ynabStorage.budgets.value();
      if (!budgets) return;

      let foundBudget = null;
      for (const budget of budgets) {
        if (budget.id === settingsBudgetId) {
          foundBudget = budget;
          break;
        }
      }

      if (!foundBudget) return;

      this.ynabStorage.selectedBudget.set(foundBudget);
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
        allocations.push(Allocation.fromSchema(doc.data() as any));
      });
      this.allocations.set(allocations);
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

      this.settings.set(data as any);
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

interface UserSettings {
  readonly selectedBudgetId: string | null;
}
