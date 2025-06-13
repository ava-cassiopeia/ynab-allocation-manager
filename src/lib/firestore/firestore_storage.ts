import {Injectable, signal, effect, inject} from '@angular/core';
import {FirebaseApp, initializeApp} from 'firebase/app';
import {Auth, User, getAuth, signInAnonymously, connectAuthEmulator} from 'firebase/auth';
import {Unsubscribe, Firestore, getFirestore, onSnapshot, query, collection, where, addDoc, connectFirestoreEmulator, getDocs, updateDoc, doc, setDoc, deleteDoc} from 'firebase/firestore';
import {BudgetSummary, Category} from 'ynab';

import {Allocation} from '../models/allocation';
import {YnabStorage} from '../ynab/ynab_storage';
import {isProd} from '../../app/env';

// Surprisingly, it's recommended and OK to check this information in according
// to Firebase documentation. Huh.
const firebaseConfig = {
  apiKey: "AIzaSyBnzGRQ5XIXRjEaYFmptN_w_sPvkkyDOQ4",
  authDomain: "ynab-allocation-manager.firebaseapp.com",
  projectId: "ynab-allocation-manager",
  storageBucket: "ynab-allocation-manager.firebasestorage.app",
  messagingSenderId: "940773929018",
  appId: "1:940773929018:web:a768dceefb7b2028948503",
  measurementId: "G-H0XNLE94YN"
};

@Injectable({providedIn: 'root'})
export class FirestoreStorage {
  readonly currentUser = signal<User | null>(null);

  readonly allocations = signal<Allocation[]>([]);

  readonly settings = signal<UserSettings>({
    selectedBudgetId: null,
  });

  private readonly app: FirebaseApp;
  private readonly db: Firestore;
  private readonly auth: Auth;
  private readonly ynabStorage = inject(YnabStorage);

  private allocationsUnsubscribe: Unsubscribe | null = null;
  private settingsUnsubscribe: Unsubscribe | null = null;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);

    if (!isProd) {
      console.log("Connecting to Firebase emulators!");
      connectAuthEmulator(this.auth, 'http://127.0.0.1:9099');
      connectFirestoreEmulator(this.db, '127.0.0.1', 8080);
    }

    // Subscribe to updates for the users' data once we have a user.
    effect(() => {
      const user = this.currentUser();
      const budget = this.ynabStorage.selectedBudget();

      if (user === null) return;
      this.listenForSettingsUpdates(user);

      if (budget === null) return;

      setDoc(doc(this.db, 'settings', user.uid), {
        selectedBudgetId: budget.id,
      });
      this.listenForAllocationsUpdates(user, budget);
    });

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

  async signInUser() {
    const results = await signInAnonymously(this.auth);
    this.currentUser.set(results.user);
  }

  /**
   * We never really want there to be multiple allocations per category (maybe
   * a cool future feature?), so if there is one, update it instead of adding
   * a new allocation.
   */
  async upsertAllocation(allocation: Allocation) {
    const user = this.currentUser();
    if (user === null) return;

    const budget = this.ynabStorage.selectedBudget();
    if (budget === null) return;

    const allocationsQuery = query(
      collection(this.db, 'allocations'),
      where("userId", "==", user.uid),
      where("categoryId", "==", allocation.categoryId),
      where("budgetId", "==", budget.id));
    const querySnapshot = await getDocs(allocationsQuery);

    const existingAllocation = querySnapshot.docs[0] ?? null;

    if (existingAllocation === null) {
      await addDoc(
        collection(this.db, 'allocations'),
        allocation.toSchema(this.assertUser().uid));
    } else {
      updateDoc(existingAllocation.ref, {
        ...allocation.toSchema(user.uid),
      });
    }
  }

  async clearAllocationForCategory(category: Category) {
    const user = this.currentUser();
    if (user === null) return;

    const budget = this.ynabStorage.selectedBudget();
    if (budget === null) return;

    const allocationsQuery = query(
      collection(this.db, 'allocations'),
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

  private assertUser(): User {
    const user = this.currentUser();
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
      collection(this.db, 'allocations'),
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
    this.allocationsUnsubscribe = onSnapshot(doc(this.db, 'settings', forUser.uid), (docSnapshot) => {
      const data = docSnapshot.data();
      if (!data) return;

      this.settings.set(data as any);
    });
  }
}

interface UserSettings {
  readonly selectedBudgetId: string | null;
}
