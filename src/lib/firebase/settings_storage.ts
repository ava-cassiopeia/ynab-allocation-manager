import {computed, Injectable, resource, inject} from "@angular/core";
import {doc, getDoc, setDoc} from "firebase/firestore";

import {db} from "./app";
import {AuthStorage} from "./auth_storage";
import {BudgetSummary} from "ynab";

@Injectable({providedIn: 'root'})
export class SettingsStorage {
  readonly settings = computed<Readonly<UserSettings>>(() => {
    const dbSettings = this.settingsResource.value();
    if (!dbSettings) {
      return {
        selectedBudgetId: null,
        timeRange: 2, // months
      };
    }

    return dbSettings as UserSettings;
  });

  private readonly settingsResource = resource({
    params: () => ({
      user: this.authStorage.currentUser(),
    }),

    loader: async ({params}) => {
      const {user} = params;
      if (!user) return null;

      const snapshot = await getDoc(doc(db, "settings", user.uid));
      if (!snapshot.exists()) return null;

      return snapshot.data();
    },
  });

  private readonly authStorage = inject(AuthStorage);

  async updateSettings(fn: (oldSettings: UserSettings) => void) {
    const user = this.authStorage.currentUser();
    if (user === null) return;

    const oldSettings = this.settings();
    fn(oldSettings);

    await setDoc(doc(db, "settings", user.uid), oldSettings);
  }

  async setSelectedBudget(budget: BudgetSummary) {
    await this.updateSettings((settings) => {
      settings.selectedBudgetId = budget.id;
    });
  }

  async setTimeRange(months: number) {
    await this.updateSettings((settings) => {
      settings.timeRange = months;
    });
  }

  reload() {
    this.settingsResource.reload();
  }
}

interface UserSettings {
  selectedBudgetId: string | null;
  timeRange: number;
}
