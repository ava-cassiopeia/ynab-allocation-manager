/* eslint-disable @typescript-eslint/no-explicit-any */
import {provideZonelessChangeDetection, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FirestoreStorage} from './firestore_storage';
import {YnabStorage, YnabStorageStatus} from '../ynab/ynab_storage';
import {AuthStorage} from '../firebase/auth_storage';
import {SettingsStorage} from '../firebase/settings_storage';
import {addDoc, collection, getDoc} from 'firebase/firestore';
import {signInAnonymously, User} from 'firebase/auth';
import {db, auth} from '../firebase/app';
import {AllocationType} from '../models/allocation';

describe('FirestoreStorage Integration with Emulator', () => {
  let ynabStorageMock: any;
  let authStorageMock: any;
  let settingsStorageMock: any;

  beforeEach(() => {
    // Mock storage services
    authStorageMock = {
      currentUser: signal<User | null>(null),
    };

    settingsStorageMock = {
      settings: signal({selectedBudgetId: null}),
      reload: jasmine.createSpy('reload'),
    };

    ynabStorageMock = {
      apiKey: {set: jasmine.createSpy('apiKey.set')},
      selectedBudget: signal<any>(null),
      status: signal<YnabStorageStatus>(
        YnabStorageStatus.LOADING_BUDGET_DETAILS,
      ),
      accounts: {value: () => [] as any[]},
      findActiveAccount: jasmine
        .createSpy('findActiveAccount')
        .and.returnValue(null),
      findActiveCategory: jasmine
        .createSpy('findActiveCategory')
        .and.returnValue(null),
      findAccount: jasmine.createSpy('findAccount').and.returnValue(null),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {provide: AuthStorage, useValue: authStorageMock},
        {provide: SettingsStorage, useValue: settingsStorageMock},
        {provide: YnabStorage, useValue: ynabStorageMock},
      ],
    });
  });

  async function waitFor(
    condition: () => boolean,
    timeout = 3000,
  ): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (condition()) return;
      await new Promise(resolve => setTimeout(resolve, 50));
      TestBed.flushEffects();
    }
    throw new Error('Timeout waiting for test condition');
  }

  async function signUpTestUser(): Promise<User> {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  }

  it('should load allocations and defer culling until YNAB is READY', async () => {
    const user = await signUpTestUser();
    const userId = user.uid;
    const budgetId = `budget_alloc_${Math.random()}`;

    // Set mock states
    authStorageMock.currentUser.set(user);
    ynabStorageMock.selectedBudget.set({id: budgetId} as any);
    ynabStorageMock.status.set(YnabStorageStatus.LOADING_BUDGET_DETAILS);

    // Insert an invalid allocation directly to the Firestore emulator
    const allocRef = await addDoc(collection(db, 'allocations'), {
      userId,
      budgetId,
      categoryId: 'cat_invalid',
      accountId: 'acc_invalid',
      type: AllocationType.SINGLE,
    });

    // Instantiate FirestoreStorage
    const storage = TestBed.inject(FirestoreStorage);
    TestBed.flushEffects();

    // Verify it loads the allocation into its public list
    await waitFor(() => storage.allocations().length === 1);
    expect(storage.allocations()[0].categoryId).toBe('cat_invalid');

    // Confirm that since YNAB is not READY, the allocation was not deleted from the database
    let docSnap = await getDoc(allocRef);
    expect(docSnap.exists()).toBeTrue();

    // Now, transition YNAB to READY
    ynabStorageMock.status.set(YnabStorageStatus.READY);
    ynabStorageMock.accounts.value = () => [];
    ynabStorageMock.findActiveAccount.and.returnValue(null);
    ynabStorageMock.findActiveCategory.and.returnValue(null);

    // Flush the effects to trigger culling logic
    TestBed.flushEffects();

    // Verify that the allocation gets culled and removed from the active list
    await waitFor(() => storage.allocations().length === 0);

    // Confirm it has been deleted from the Firestore database
    docSnap = await getDoc(allocRef);
    expect(docSnap.exists()).toBeFalse();
  });

  it('should load account metadata and defer culling until YNAB is READY', async () => {
    const user = await signUpTestUser();
    const userId = user.uid;
    const budgetId = `budget_meta_${Math.random()}`;

    // Set mock states
    authStorageMock.currentUser.set(user);
    ynabStorageMock.selectedBudget.set({id: budgetId} as any);
    ynabStorageMock.status.set(YnabStorageStatus.LOADING_BUDGET_DETAILS);

    // Insert an invalid account metadata directly to the Firestore emulator
    const accountRef = await addDoc(collection(db, 'accounts'), {
      userId,
      budgetId,
      accountId: 'acc_invalid',
      interestRate: 1.5,
      interestThresholdMillis: 1000,
      minimumBalanceMillis: 2000,
      lastReconciled: null,
    });

    // Instantiate FirestoreStorage
    const storage = TestBed.inject(FirestoreStorage);
    TestBed.flushEffects();

    // Verify it loads the account metadata into its public list
    await waitFor(() => storage.accountMetadata().size === 1);
    expect(storage.accountMetadata().has('acc_invalid')).toBeTrue();

    // Confirm that since YNAB is not READY, the account metadata was not deleted from the database
    let docSnap = await getDoc(accountRef);
    expect(docSnap.exists()).toBeTrue();

    // Now, transition YNAB to READY
    ynabStorageMock.status.set(YnabStorageStatus.READY);
    ynabStorageMock.accounts.value = () => [];
    ynabStorageMock.findAccount.and.returnValue(null);

    // Flush the effects to trigger culling logic
    TestBed.flushEffects();

    // Verify that the metadata gets culled and removed from the active list
    await waitFor(() => storage.accountMetadata().size === 0);

    // Confirm it has been deleted from the Firestore database
    docSnap = await getDoc(accountRef);
    expect(docSnap.exists()).toBeFalse();
  });
});
