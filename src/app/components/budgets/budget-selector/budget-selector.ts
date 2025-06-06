import {Component, input, inject} from '@angular/core';
import {BudgetSummary} from 'ynab';

import {YnabStorage} from '../../../../lib/ynab/ynab_storage';

@Component({
  selector: 'ya-budget-selector',
  templateUrl: './budget-selector.html',
  styleUrl: './budget-selector.scss'
})
export class BudgetSelector {
  protected readonly ynabStorage = inject(YnabStorage);

  protected selectBudget(budget: BudgetSummary) {
    this.ynabStorage.selectedBudget.set(budget);
  }
}
