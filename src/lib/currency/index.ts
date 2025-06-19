import {CurrencyFormat} from "../firebase/settings_storage";

/**
 * Formats the provided milliunits value as a currency value based on the
 * provided ISO currency code and user currency format setting.
 */
export function formatCurrency(milliunits: number, isoCode: string, format: CurrencyFormat): string {
  if (milliunits === 0 && format === CurrencyFormat.FINANCE) return "-";

  let currencyAmount = milliunits / 1000.0;
  if (currencyAmount < 0 && format === CurrencyFormat.FINANCE) {
    currencyAmount = Math.abs(currencyAmount);
  }
  const intlFormat = Intl.NumberFormat('en-US', {
    style: "currency",
    currency: isoCode,
  }).format(currencyAmount);

  switch (format) {
    case CurrencyFormat.FINANCE:
      if (milliunits < 0) {
        return `(${intlFormat})`;
      } else {
        return intlFormat;
      }
    default:
      return intlFormat;
  }
}
