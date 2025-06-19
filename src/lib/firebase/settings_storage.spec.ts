import {provideZonelessChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {deleteDoc, doc, getDoc, setDoc} from 'firebase/firestore';
import {BudgetSummary} from 'ynab';

import {db} from './app';
import {SettingsStorage, CurrencyFormat} from './settings_storage';
import {sleep} from '../tests/sleep';
import {AuthStorage} from './auth_storage';
import {FakeAuthStorage, fakeAuthStorageProvider} from '../tests/fake_auth_storage';

describe('SettingsStorage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SettingsStorage,
        provideZonelessChangeDetection(),
        fakeAuthStorageProvider,
      ],
    });
  });

  // Clean up user settings after each test
  afterEach(async () => {
    const authStorage = TestBed.inject(AuthStorage);
    const uid = authStorage.currentUser()?.uid ?? null;
    if (!uid) return;

    await deleteDoc(doc(db, "users", uid));
  });

  it('should be created', () => {
    const settingsStorage = TestBed.inject(SettingsStorage);
    expect(settingsStorage).toBeTruthy();
  });

  it('should return default values for settings', () => {
    const settingsStorage = TestBed.inject(SettingsStorage);
    const settings = settingsStorage.settings();

    expect(settings.selectedBudgetId).toBeNull();
    expect(settings.timeRange).toEqual(2);
    expect(settings.currencyFormat).toBeUndefined();
  });

  it('should update when the firestore settings are updated', async () => {
    const settingsStorage = TestBed.inject(SettingsStorage);
    const fakeAuthStorage = TestBed.inject(FakeAuthStorage);
    const uid = await fakeAuthStorage.createFakeUser();

    await setDoc(doc(db, "settings", uid), {
      selectedBudgetId: "fake_budget_id",
      timeRange: 4,
    });
    await sleep(10); // wait for Firestore to update
    const settings = settingsStorage.settings();

    expect(settings.selectedBudgetId).toEqual("fake_budget_id");
    expect(settings.timeRange).toEqual(4);
  });

  describe(".setSelectedBudget()", () => {
    it("updates the budget in settings and in the db", async () => {
      const settingsStorage = TestBed.inject(SettingsStorage);
      const fakeAuthStorage = TestBed.inject(FakeAuthStorage);
      const uid = await fakeAuthStorage.createFakeUser();

      await settingsStorage.setSelectedBudget({id: "fake_budget_id"} as BudgetSummary);
      await sleep(10); // wait for Firestore to update
      const snapshot = await getDoc(doc(db, "settings", uid));
      const dbValue = !!snapshot.data() ? snapshot.data()!['selectedBudgetId'] : null;

      expect(settingsStorage.settings().selectedBudgetId).toEqual("fake_budget_id");
      expect(dbValue).toEqual("fake_budget_id");
    });
  });

  describe(".setTimeRange()", () => {
    it("updates the time range in settings and in the db", async () => {
      const settingsStorage = TestBed.inject(SettingsStorage);
      const fakeAuthStorage = TestBed.inject(FakeAuthStorage);
      const uid = await fakeAuthStorage.createFakeUser();

      await settingsStorage.setTimeRange(4);
      await sleep(10); // wait for Firestore to update
      const snapshot = await getDoc(doc(db, "settings", uid));
      const dbValue = !!snapshot.data() ? snapshot.data()!['timeRange'] : null;

      expect(settingsStorage.settings().timeRange).toEqual(4);
      expect(dbValue).toEqual(4);
    });
  });

  describe(".setCurrencyFormat()", () => {
    it("updates the time range in settings and in the db", async () => {
      const settingsStorage = TestBed.inject(SettingsStorage);
      const fakeAuthStorage = TestBed.inject(FakeAuthStorage);
      const uid = await fakeAuthStorage.createFakeUser();

      await settingsStorage.setCurrencyFormat(CurrencyFormat.FINANCE);
      await sleep(10); // wait for Firestore to update
      const snapshot = await getDoc(doc(db, "settings", uid));
      const dbValue = !!snapshot.data() ? snapshot.data()!['currencyFormat'] : null;

      expect(settingsStorage.settings().currencyFormat).toEqual(CurrencyFormat.FINANCE);
      expect(dbValue).toEqual(CurrencyFormat.FINANCE);
    });
  });
});
