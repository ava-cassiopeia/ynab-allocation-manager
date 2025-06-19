import {Component, input, computed, inject} from '@angular/core';

import {YnabStorage} from '../../../../lib/ynab/ynab_storage';
import {SettingsStorage, CurrencyFormat} from '../../../../lib/firebase/settings_storage';
import {formatCurrency} from '../../../../lib/currency';

/**
 * Renders milliunit currency values as USD values.
 */
@Component({
  selector: 'ya-currency',
  templateUrl: './currency.html',
  styleUrl: './currency.scss'
})
export class Currency {
  readonly milliunits = input.required<number>();
  readonly currencyOverride = input<string | null>(null);

  protected readonly value = computed<string>(() => {
    const settingsFormat = this.settingsStorage.settings().currencyFormat ?? CurrencyFormat.STANDARD;
    let currency: string;
    if (this.currencyOverride() !== null) {
      currency = this.currencyOverride()!;
    } else {
      currency = this.ynabStorage.selectedBudget()?.currency_format?.iso_code ?? 'USD';
    }

    return formatCurrency(this.milliunits(), currency, settingsFormat);
  });

  private readonly ynabStorage = inject(YnabStorage);
  private readonly settingsStorage = inject(SettingsStorage);
}
