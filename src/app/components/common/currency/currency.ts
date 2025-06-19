import {Component, input, computed, inject} from '@angular/core';

import {YnabStorage} from '../../../../lib/ynab/ynab_storage';

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
    if (this.milliunits() === 0) return '-';
    let currency: string;
    if (this.currencyOverride() !== null) {
      currency = this.currencyOverride()!;
    } else {
      currency = this.ynabStorage.selectedBudget()?.currency_format?.iso_code ?? 'USD';
    }

    const currencyAmount = this.milliunits() / 1000.0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(currencyAmount);
  });

  private readonly ynabStorage = inject(YnabStorage);
}
