import {Component, inject, ChangeDetectionStrategy} from '@angular/core';

import {DropdownButton} from '../../common/dropdown-button/dropdown-button';
import {YnabStorage} from '../../../../lib/ynab/ynab_storage';

@Component({
  selector: 'ya-months-info-button',
  templateUrl: './months-info-button.html',
  styleUrl: './months-info-button.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DropdownButton],
})
export class MonthsInfoButton {
  protected readonly ynabStorage = inject(YnabStorage);
}
