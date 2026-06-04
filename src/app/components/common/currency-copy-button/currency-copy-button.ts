import {Component, input, inject, signal} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatIcon} from '@angular/material/icon';

import {Currency} from '../currency/currency';

/**
 * Renders a currency value as a clickable button that the user can click to
 * get that value copied to their clipboard for easy transfer to a banking app
 * or similar.
 */
@Component({
  selector: 'ya-currency-copy-button',
  templateUrl: './currency-copy-button.html',
  styleUrl: './currency-copy-button.scss',
  imports: [Currency, MatIcon],
})
export class CurrencyCopyButton {
  readonly milliunits = input.required<number>();

  protected readonly copied = signal<boolean>(false);

  private timeoutId: number | null = null;
  private readonly clipboard = inject(Clipboard);

  protected copyValue() {
    const currencyValue = String(Math.floor(this.milliunits() / 10.0) / 100.0);
    this.clipboard.copy(currencyValue);
    this.copied.set(true);

    // Make the copied state dissapear after a couple seconds
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.timeoutId = setTimeout(() => {
      this.copied.set(false);
    }, 2000);
  }
}
