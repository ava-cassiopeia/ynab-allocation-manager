import {Injectable, signal, effect} from '@angular/core';
import {FirebaseApp, initializeApp} from 'firebase/app';
import {Auth, User, getAuth, signInAnonymously, connectAuthEmulator} from 'firebase/auth';
import {Firestore, getFirestore, onSnapshot, query, collection, where, addDoc, connectFirestoreEmulator} from 'firebase/firestore';

import {Allocation} from '../models/allocation';
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
      if (user === null) return;

      this.listenForFirestoreUpdates(user);
    });
  }

  async signInUser() {
    const results = await signInAnonymously(this.auth);
    this.currentUser.set(results.user);
  }

  async addAllocation(allocation: Allocation) {
    await addDoc(
      collection(this.db, 'allocations'),
      allocation.toSchema(this.assertUser().uid));
  }

  private assertUser(): User {
    const user = this.currentUser();
    if (user === null) {
      throw new Error("User doesn't exist yet!");
    }

    return user;
  }

  private listenForFirestoreUpdates(forUser: User) {
    // Update local copy of allocations whenever the user's allocations change
    // in the database.
    const allocationsQuery = query(
      collection(this.db, 'allocations'),
      where("userId", "==", forUser.uid));
    onSnapshot(allocationsQuery, (querySnapshot) => {
      const allocations: Allocation[] = [];
      querySnapshot.forEach((doc) => {
        allocations.push(Allocation.fromSchema(doc.data() as any));
      });
      this.allocations.set(allocations);
    });
  }
}
