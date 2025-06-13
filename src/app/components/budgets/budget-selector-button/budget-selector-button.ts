import {BudgetSummary} from 'ynab';
import {Component, inject, ViewChild, computed} from '@angular/core';

import {YnabStorage} from '../../../../lib/ynab/ynab_storage';
import {DropdownButton, DropdownMenuItem} from '../../common/dropdown-button/dropdown-button';

@Component({
  selector: 'ya-budget-selector-button',
  templateUrl: './budget-selector-button.html',
  styleUrl: './budget-selector-button.scss',
  imports: [DropdownButton],
})
export class BudgetSelectorButton {
  protected readonly ynabStorage = inject(YnabStorage);

  @ViewChild(DropdownButton)
  private readonly dropdownButton!: DropdownButton<BudgetSummary>;

  protected readonly menuItems = computed<DropdownMenuItem<BudgetSummary>[]>(() => {
    const budgets = this.ynabStorage.budgets.value();
    const selectedBudget = this.ynabStorage.selectedBudget();
    if (!budgets) return [];

    return budgets.map((b) => ({
      label: b.name,
      icon: selectedBudget === b ? 'done' : 'account_balance_wallet',
      value: b,
      action: (value: BudgetSummary) => {
        this.selectBudget(value);
      },
    }));
  });

  protected selectBudget(budget: BudgetSummary) {
    this.ynabStorage.selectedBudget.set(budget);
    this.dropdownButton.close();
  }
}
