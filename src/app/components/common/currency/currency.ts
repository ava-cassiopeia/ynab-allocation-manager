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
  readonly currency = input<string>('USD');

  protected readonly value = computed<string>(() => {
    if (this.milliunits() === 0) return '-';

    const currencyAmount = this.milliunits() / 1000.0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency(),
    }).format(currencyAmount);
  });
}
