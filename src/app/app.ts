import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';

import {BudgetSelector} from './components/budgets/budget-selector/budget-selector';
import {CategoryList} from './components/categories/category-list/category-list';
import {YnabStorage} from '../lib/ynab/ynab_storage';
import {YnabTokenForm} from './components/auth/ynab-token-form/ynab-token-form';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    BudgetSelector,
    CategoryList,
    RouterOutlet,
    YnabTokenForm,
  ],
})
export class App {
  protected readonly ynabStorage = inject(YnabStorage);
}
