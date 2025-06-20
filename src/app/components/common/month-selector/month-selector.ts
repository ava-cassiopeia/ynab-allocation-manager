import {Component, inject, computed, effect} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

import {DropdownButton, DropdownMenuItem} from "../dropdown-button/dropdown-button";
import {getMonthsLabel} from '../../../../lib/time/months';
import {SettingsStorage} from '../../../../lib/firebase/settings_storage';

@Component({
  selector: 'ya-month-selector',
  templateUrl: './month-selector.html',
  styleUrl: './month-selector.scss',
  imports: [
    DropdownButton,
    ReactiveFormsModule,
  ],
})
export class MonthSelector {

  protected readonly months = computed<number>(() => {
    const months = this.settingsStorage.settings().timeRange;
    return months || 2;
  });

  protected readonly monthsLabel = computed<string>(() => {
    return getMonthsLabel(this.months());
  });

  protected readonly menuItems = computed<DropdownMenuItem<number>[]>(() => {
    return [
      {
        label: `This month (${getMonthsLabel(1)})`,
        action: () => this.setMonths(1),
        value: 1,
        icon: this.months() === 1 ? 'done' : 'calendar_today',
      },
      {
        label: `Next 2 months (${getMonthsLabel(2)})`,
        action: () => this.setMonths(2),
        value: 2,
        icon: this.months() === 2 ? 'done' : 'calendar_today',
      },
      {
        label: `Next 3 months (${getMonthsLabel(3)})`,
        action: () => this.setMonths(3),
        value: 3,
        icon: this.months() === 3 ? 'done' : 'calendar_today',
      },
      {
        label: `Next 6 months (${getMonthsLabel(6)})`,
        action: () => this.setMonths(6),
        value: 6,
        icon: this.months() === 6 ? 'done' : 'calendar_today',
      },
    ];
  });

  protected readonly monthsInputControl = new FormControl<number>(0);

  private readonly settingsStorage = inject(SettingsStorage);

  constructor() {
    // Update the value of the input to match the state of the user's settings.
    effect(() => {
      const months = this.settingsStorage.settings().timeRange;
      this.monthsInputControl.setValue(months);
    });
  }

  protected setMonths(months: number) {
    this.settingsStorage.setTimeRange(months);
  }

  protected updateMonthsFromForm(event: Event) {
    event.preventDefault();
    const newValue = this.monthsInputControl.value;
    if (!newValue || newValue < 1) return;

    this.setMonths(newValue);
  }
}
