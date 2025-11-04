import {BudgetSummary} from 'ynab';
import {Component, inject, ElementRef, signal, effect, computed} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

import {AccountData} from '../../../lib/accounts/account_data';
import {AccountList} from '../../components/accounts/account-list/account-list';
import {AccountsSummary} from '../../components/accounts/accounts-summary/accounts-summary';
import {AllocationCountButton} from '../../components/allocations/allocation-count-button/allocation-count-button';
import {BetaInfoButton} from '../../components/common/beta-info-button/beta-info-button';
import {BudgetSelectorButton} from '../../components/budgets/budget-selector-button/budget-selector-button';
import {CategoryList} from '../../components/categories/category-list/category-list';
import {ClearAllocationsButton} from "../../components/allocations/clear-allocations-button/clear-allocations-button";
import {LoadingIcon} from '../../components/auth/loading-icon/loading-icon';
import {LogoutButton} from '../../components/auth/logout-button/logout-button';
import {MonthsInfoButton} from '../../components/time/months-info-button/months-info-button';
import {SettingsButton} from '../../components/settings/settings-button/settings-button';
import {SettingsStorage} from '../../../lib/firebase/settings_storage';
import {YnabStorage, YnabStorageStatus} from '../../../lib/ynab/ynab_storage';

@Component({
  selector: 'ya-app-page',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    AccountList,
    AccountsSummary,
    AllocationCountButton,
    BetaInfoButton,
    BudgetSelectorButton,
    CategoryList,
    ClearAllocationsButton,
    LoadingIcon,
    LogoutButton,
    MatIcon,
    MonthsInfoButton,
    SettingsButton,
  ],
})
export class AppPage {
  protected readonly ynabStorage = inject(YnabStorage);
  protected readonly settingsStorage = inject(SettingsStorage);
  protected readonly accountData = inject(AccountData);

  protected readonly loading = signal<boolean>(false);
  // Only relevant on mobile screens
  protected readonly showAccounts = signal<boolean>(false);
  protected readonly YnabStorageStatus = YnabStorageStatus;

  protected readonly budgetIsSelected = computed<boolean>(() => {
    return this.ynabStorage.status() === YnabStorageStatus.READY && this.ynabStorage.selectedBudget() !== null;
  });

  protected readonly contentClass = computed<string | null>(() => {
    if (this.loading()) return 'loading';
    if (!this.budgetIsSelected()) return 'no-budget';

    return null;
  });

  constructor(private readonly el: ElementRef) {
    effect(() => {
      const status = this.ynabStorage.status();
      if (status === YnabStorageStatus.LOADING_BUDGET_DETAILS || status === YnabStorageStatus.LOADING_BUDGET_LIST) {
        this.setLoading();
      } else {
        this.clearLoading();
      }
    });
  }

  protected async selectNewBudget(budget: BudgetSummary) {
    await this.setLoading();
    // A weird workaround for some animation quirks I haven't figured out yet
    await this.sleep(1000);
    this.settingsStorage.setSelectedBudget(budget);
  }

  private async setLoading() {
    this.loading.set(true);
  }

  private async clearLoading() {
    await this.sleep(300);
    this.loading.set(false);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
}
