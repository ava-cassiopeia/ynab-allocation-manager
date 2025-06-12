import {Component, inject} from '@angular/core';

import {AccountList} from '../../components/accounts/account-list/account-list';
import {BudgetSelectorButton} from '../../components/budgets/budget-selector-button/budget-selector-button';
import {BudgetSelector} from '../../components/budgets/budget-selector/budget-selector';
import {CategoryList} from '../../components/categories/category-list/category-list';
import {YnabStorage} from '../../../lib/ynab/ynab_storage';
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
}
