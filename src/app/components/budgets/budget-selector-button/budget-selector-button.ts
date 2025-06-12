import {BudgetSummary} from 'ynab';
import {Component, inject, ViewChild} from '@angular/core';

import {YnabStorage} from '../../../../lib/ynab/ynab_storage';
import {DropdownButton} from '../../common/dropdown-button/dropdown-button';

@Component({
  selector: 'ya-budget-selector-button',
  templateUrl: './budget-selector-button.html',
  styleUrl: './budget-selector-button.scss',
  imports: [DropdownButton],
})
export class BudgetSelectorButton {
  protected readonly ynabStorage = inject(YnabStorage);

  @ViewChild(DropdownButton)
  private readonly dropdownButton!: DropdownButton;

  protected selectBudget(budget: BudgetSummary) {
    this.ynabStorage.selectedBudget.set(budget);
    this.dropdownButton.close();
  }
}
