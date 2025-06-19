import {BudgetSummary} from 'ynab';
import {Component, inject, ElementRef, signal, effect} from '@angular/core';

import {AccountData} from '../../../lib/accounts/account_data';
import {AccountList} from '../../components/accounts/account-list/account-list';
import {BetaInfoButton} from '../../components/common/beta-info-button/beta-info-button';
import {BudgetSelectorButton} from '../../components/budgets/budget-selector-button/budget-selector-button';
import {CategoryList} from '../../components/categories/category-list/category-list';
import {ClearAllocationsButton} from "../../components/allocations/clear-allocations-button/clear-allocations-button";
import {LogoutButton} from '../../components/auth/logout-button/logout-button';
import {MonthSelector} from "../../components/common/month-selector/month-selector";
import {SettingsButton} from '../../components/settings/settings-button/settings-button';
import {SettingsStorage} from '../../../lib/firebase/settings_storage';
import {TotalAllocationsButton} from "../../components/allocations/total-allocations-button/total-allocations-button";
import {YnabStorage, YnabStorageStatus} from '../../../lib/ynab/ynab_storage';

@Component({
  selector: 'ya-app-page',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    AccountList,
    BetaInfoButton,
    BudgetSelectorButton,
    CategoryList,
    ClearAllocationsButton,
    LogoutButton,
    MonthSelector,
    SettingsButton,
    TotalAllocationsButton,
  ],
})
export class AppPage {
  protected readonly ynabStorage = inject(YnabStorage);
  protected readonly settingsStorage = inject(SettingsStorage);
  protected readonly accountData = inject(AccountData);

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
    this.settingsStorage.setSelectedBudget(budget);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
}
