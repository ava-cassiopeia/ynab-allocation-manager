import {Component, inject} from '@angular/core';

import {BudgetSelector} from '../../components/budgets/budget-selector/budget-selector';
import {CategoryList} from '../../components/categories/category-list/category-list';
import {YnabTokenForm} from '../../components/auth/ynab-token-form/ynab-token-form';
import {YnabStorage} from '../../../lib/ynab/ynab_storage';
import {AccountList} from '../../components/accounts/account-list/account-list';

@Component({
  selector: 'ya-app-page',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    AccountList,
    BudgetSelector,
    CategoryList,
    YnabTokenForm,
  ],
})
export class AppPage {
  protected readonly ynabStorage = inject(YnabStorage);
}
