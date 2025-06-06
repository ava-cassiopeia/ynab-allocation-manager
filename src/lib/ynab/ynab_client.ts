import {Injectable, inject, effect} from "@angular/core";
import {API, BudgetSummary} from 'ynab';

import {YnabStorage} from "./ynab_storage";

@Injectable({providedIn: 'root'})
export class YnabClient {
  private api: API | null = null;

  private readonly ynabStorage = inject(YnabStorage);

  constructor() {
    // Refresh the API instance every time the API key is updated.
    effect(() => {
      const token = this.ynabStorage.apiKey();
      if (token === null) {
        this.api = null;
        return;
      }

      this.api = new API(token);
      this.reloadAllData();
    });
  }

  setApiKey(key: string) {
    this.ynabStorage.apiKey.set(key);
  }

  /**
   * Reloads all the user's data and stores it in memory for usage.
   */
  async reloadAllData() {
    const [budgets] = await Promise.all([
      this.getBudgets(),
    ]);

    this.ynabStorage.budgets.set(budgets);
  }

  async getBudgets(): Promise<BudgetSummary[]> {
    const response = await this.api?.budgets.getBudgets() ?? null;
    if (response === null) {
      throw new Error('Did not get a response for budgets!');
    }

    return response.data.budgets;
  }
}
