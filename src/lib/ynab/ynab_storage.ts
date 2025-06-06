import {Injectable, signal} from "@angular/core";
import {BudgetSummary, CategoryGroupWithCategories} from "ynab";

/**
 * Stores cached YNAB data for the application.
 */
@Injectable({providedIn: 'root'})
export class YnabStorage {
  readonly apiKey = signal<string | null>(null);

  /**
   * All of the user's budgets.
   */
  readonly budgets = signal<BudgetSummary[]>([]);

  /**
   * The budget the user has selected to work on. Null if the user hasn't
   * selected a budget yet.
   */
  readonly selectedBudget = signal<BudgetSummary | null>(null);

  /**
   * All of the categories for the user's selected budget. Empty if no budget
   * has been selected yet.
   */
  readonly categories = signal<CategoryGroupWithCategories[]>([]);

  reset() {
    this.budgets.set([]);
    this.selectedBudget.set(null);
  }
}
