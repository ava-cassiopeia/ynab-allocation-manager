import {getMonthsLabel} from "./months";

describe("getMonthsLabel()", () => {
  it("returns a good label for one month", () => {
    expect(getMonthsLabel(1, new Date("2025-01-15"))).toEqual("Jan");
  });

  it("returns a good label for two months", () => {
    expect(getMonthsLabel(2, new Date("2025-01-15"))).toEqual("Jan - Feb");
  });

  it("returns a good label for three months", () => {
    expect(getMonthsLabel(3, new Date("2025-01-15"))).toEqual("Jan - Mar");
  });

  it("returns a good label for six months", () => {
    expect(getMonthsLabel(6, new Date("2025-01-15"))).toEqual("Jan - Jun");
  });

  it("appends a year if relevant", () => {
    expect(getMonthsLabel(8, new Date("2025-07-15"))).toEqual("Jul - Feb 2026");
  });
});
