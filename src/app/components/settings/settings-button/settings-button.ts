import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';

import {SettingsDialog} from '../settings-dialog/settings-dialog';

@Component({
  selector: 'ya-settings-button',
  templateUrl: './settings-button.html',
  styleUrl: './settings-button.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIcon],
})
export class SettingsButton {
  private readonly dialog = inject(MatDialog);

  protected showDialog() {
    this.dialog.open(SettingsDialog);
  }
}
