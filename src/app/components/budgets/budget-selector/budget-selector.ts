import {Component, input, inject} from '@angular/core';
import {BudgetSummary} from 'ynab';

import {FirestoreStorage} from '../../../../lib/firestore/firestore_storage';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';
import {SettingsStorage} from '../../../../lib/firebase/settings_storage';

@Component({
  selector: 'ya-budget-selector',
  templateUrl: './budget-selector.html',
  styleUrl: './budget-selector.scss'
})
export class BudgetSelector {
  protected readonly firestoreStorage = inject(FirestoreStorage);
  protected readonly ynabStorage = inject(YnabStorage);

  private readonly settingsStorage = inject(SettingsStorage);

  protected selectBudget(budget: BudgetSummary) {
    this.settingsStorage.setSelectedBudget(budget);
  }
}
