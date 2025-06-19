import {Component, inject, computed} from '@angular/core';
import {
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatSlideToggle, MatSlideToggleChange} from '@angular/material/slide-toggle';

import {Currency} from "../../common/currency/currency";
import {CurrencyFormat, SettingsStorage} from '../../../../lib/firebase/settings_storage';

@Component({
  selector: 'ya-settings-dialog',
  templateUrl: './settings-dialog.html',
  styleUrl: './settings-dialog.scss',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatSlideToggle,
    Currency,
  ],
})
export class SettingsDialog {
  protected readonly isFinanceFormat = computed<boolean>(() => {
    const setting = this.settingsStorage.settings().currencyFormat;
    if (!setting) return false;

    return setting === CurrencyFormat.FINANCE;
  });

  private readonly settingsStorage = inject(SettingsStorage);

  protected updateCurrencyFormat(event: MatSlideToggleChange) {
    // in this case, `undefined` means "default value"
    const format = event.checked ? CurrencyFormat.FINANCE : undefined;
    this.settingsStorage.setCurrencyFormat(format);
  }
}
