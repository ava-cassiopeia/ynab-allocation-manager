import {Component} from '@angular/core';

import {DropdownButton} from '../dropdown-button/dropdown-button';

@Component({
  selector: 'ya-beta-info-button',
  templateUrl: './beta-info-button.html',
  styleUrl: './beta-info-button.scss',
  imports: [DropdownButton],
})
export class BetaInfoButton {}
