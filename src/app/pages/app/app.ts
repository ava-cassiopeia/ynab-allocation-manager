import {Component, inject, ViewChild, ElementRef, effect, signal} from '@angular/core';

import {AccountList} from '../../components/accounts/account-list/account-list';
import {BudgetSelectorButton} from '../../components/budgets/budget-selector-button/budget-selector-button';
import {BudgetSelector} from '../../components/budgets/budget-selector/budget-selector';
import {CategoryList} from '../../components/categories/category-list/category-list';
import {YnabStorage, YnabStorageStatus} from '../../../lib/ynab/ynab_storage';
import {YnabTokenForm} from '../../components/auth/ynab-token-form/ynab-token-form';

@Component({
  selector: 'ya-app-page',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    AccountList,
    BudgetSelector,
    BudgetSelectorButton,
    CategoryList,
    YnabTokenForm,
  ],
})
export class AppPage {
  protected readonly ynabStorage = inject(YnabStorage);

  protected readonly fixedHeight = signal<string | null>(null);
  protected readonly YnabStorageStatus = YnabStorageStatus;

  @ViewChild('accountSidebar')
  private readonly accountSidebar!: ElementRef<HTMLElement>;


  constructor() {
    // TODO: #7 - This has a 1 to 2 frame jank because there's a frame between
    // when the Signal is updated (and this effect() is called), and the next
    // frame where the fixedHeight() Signal updates the DOM.
    // That should either be fixed or ripped out, whichever is easier.
    effect(() => {
      this.ynabStorage.accounts.value();
      const accountsLoading = this.ynabStorage.accounts.isLoading();

      const rect = this.accountSidebar?.nativeElement.getBoundingClientRect() ?? null;
      if (rect === null) return;

      if (accountsLoading) {
        requestAnimationFrame(() => {
          this.fixedHeight.set(`${rect.height}px`);
        });
      } else {
        setTimeout(() => {
          requestAnimationFrame(() => {
            this.fixedHeight.set(null);
          });
        }, 1000);
      }
    });
  }
}
