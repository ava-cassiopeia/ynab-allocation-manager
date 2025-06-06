import {Injectable, signal, effect, inject} from '@angular/core';
import {FirebaseApp, initializeApp} from 'firebase/app';
import {Auth, User, getAuth, signInAnonymously, connectAuthEmulator} from 'firebase/auth';
import {Unsubscribe, Firestore, getFirestore, onSnapshot, query, collection, where, addDoc, connectFirestoreEmulator, getDocs, updateDoc} from 'firebase/firestore';
import {BudgetSummary} from 'ynab';

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

  private readonly app: FirebaseApp;
  private readonly db: Firestore;
  private readonly auth: Auth;
  private readonly ynabStorage = inject(YnabStorage);

  private allocationsUnsubscribe: Unsubscribe | null = null;

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
      if (budget === null) return;

      this.listenForFirestoreUpdates(user, budget);
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

    const allocationsQuery = query(
      collection(this.db, 'allocations'),
      where("userId", "==", user.uid),
      where("categoryId", "==", allocation.categoryId));
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

  private assertUser(): User {
    const user = this.currentUser();
    if (user === null) {
      throw new Error("User doesn't exist yet!");
    }

    return user;
  }

  private listenForFirestoreUpdates(forUser: User, forBudget: BudgetSummary) {
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
}
