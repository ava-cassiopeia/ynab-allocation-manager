import {Component, input, computed} from '@angular/core';

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

  protected readonly value = computed<string>(() => {
    if (this.milliunits() === 0) return '-';

    const currencyAmount = Math.round(this.milliunits() / 10.0) / 100.0;
    return `$${currencyAmount.toLocaleString()}`;
  });
}
