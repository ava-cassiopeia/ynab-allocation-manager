import {Component, ChangeDetectionStrategy} from '@angular/core';

import {DropdownButton} from '../dropdown-button/dropdown-button';
import {version} from '../../../../lib/version';

@Component({
  selector: 'ya-beta-info-button',
  templateUrl: './beta-info-button.html',
  styleUrl: './beta-info-button.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DropdownButton],
})
export class BetaInfoButton {
  // Mirror for access in the template
  protected readonly version = version;
}
