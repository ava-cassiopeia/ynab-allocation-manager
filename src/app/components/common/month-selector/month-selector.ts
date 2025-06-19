import {Component, inject, computed} from '@angular/core';
import {DropdownButton, DropdownMenuItem} from "../dropdown-button/dropdown-button";

import {FirestoreStorage} from '../../../../lib/firestore/firestore_storage';

@Component({
  selector: 'ya-month-selector',
  templateUrl: './month-selector.html',
  styleUrl: './month-selector.scss',
  imports: [DropdownButton],
})
export class MonthSelector {

  protected readonly months = computed<number>(() => {
    const months = this.firestoreStorage.settings().timeRange;
    return months || 2;
  });

  protected readonly menuItems = computed<DropdownMenuItem<number>[]>(() => {
    return [
      {
        label: "This month",
        action: () => this.setMonths(1),
        value: 1,
        icon: this.months() === 1 ? 'done' : 'calendar_today',
      },
      {
        label: "Next two months",
        action: () => this.setMonths(2),
        value: 2,
        icon: this.months() === 2 ? 'done' : 'calendar_today',
      },
      {
        label: "Next three months",
        action: () => this.setMonths(3),
        value: 3,
        icon: this.months() === 3 ? 'done' : 'calendar_today',
      },
      {
        label: "Next four months",
        action: () => this.setMonths(4),
        value: 4,
        icon: this.months() === 4 ? 'done' : 'calendar_today',
      },
      {
        label: "Next five months",
        action: () => this.setMonths(5),
        value: 5,
        icon: this.months() === 5 ? 'done' : 'calendar_today',
      },
      {
        label: "Next six months",
        action: () => this.setMonths(6),
        value: 6,
        icon: this.months() === 6 ? 'done' : 'calendar_today',
      },
    ];
  });

  private readonly firestoreStorage = inject(FirestoreStorage);

  protected setMonths(months: number) {
    this.firestoreStorage.updateTimeRange(months);
  }
}
