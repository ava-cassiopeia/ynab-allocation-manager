import {BudgetSummary} from 'ynab';
import {Component, inject, ElementRef, signal, effect} from '@angular/core';

import {AccountList} from '../../components/accounts/account-list/account-list';
import {BudgetSelectorButton} from '../../components/budgets/budget-selector-button/budget-selector-button';
import {CategoryList} from '../../components/categories/category-list/category-list';
import {ClearAllocationsButton} from "../../components/allocations/clear-allocations-button/clear-allocations-button";
import {LogoutButton} from '../../components/auth/logout-button/logout-button';
import {YnabStorage, YnabStorageStatus} from '../../../lib/ynab/ynab_storage';

@Component({
  selector: 'ya-app-page',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    AccountList,
    BudgetSelectorButton,
    CategoryList,
    ClearAllocationsButton,
    LogoutButton,
  ],
})
export class AppPage {
  protected readonly ynabStorage = inject(YnabStorage);

  protected readonly loading = signal<boolean>(false);
  protected readonly YnabStorageStatus = YnabStorageStatus;

  constructor(private readonly el: ElementRef) {
    effect(() => {
      if (this.ynabStorage.status() === YnabStorageStatus.READY) {
        setTimeout(() => {
          this.loading.set(false);
        }, 300);
      }
    });
  }

  protected async selectNewBudget(budget: BudgetSummary) {
    this.loading.set(true);
    await this.sleep(1000);
    this.ynabStorage.selectedBudget.set(budget);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
}
