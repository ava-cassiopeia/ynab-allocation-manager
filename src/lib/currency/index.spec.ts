import {formatCurrency} from ".";
import {CurrencyFormat} from "../firebase/settings_storage";

describe("formatCurrency()", () => {
  describe("STANDARD format", () => {
    it("renders 0", () => {
      const formatted = formatCurrency(0, "USD", CurrencyFormat.STANDARD);
      expect(formatted).toEqual("$0.00");
    });

    it("renders positive numbers", () => {
      const formatted = formatCurrency(12345, "USD", CurrencyFormat.STANDARD);
      expect(formatted).toEqual("$12.35");
    });

    it("renders negative numbers", () => {
      const formatted = formatCurrency(-12345, "USD", CurrencyFormat.STANDARD);
      expect(formatted).toEqual("-$12.35");
    });
  });

  describe("FINANCE format", () => {
    it("renders 0", () => {
      const formatted = formatCurrency(0, "USD", CurrencyFormat.FINANCE);
      expect(formatted).toEqual("-");
    });

    it("renders positive numbers", () => {
      const formatted = formatCurrency(12345, "USD", CurrencyFormat.FINANCE);
      expect(formatted).toEqual("$12.35");
    });

    it("renders negative numbers", () => {
      const formatted = formatCurrency(-12345, "USD", CurrencyFormat.FINANCE);
      expect(formatted).toEqual("($12.35)");
    });
  });
});
