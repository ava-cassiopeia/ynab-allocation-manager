import {getMonthsLabel, latestMonth, monthDistance} from "./months";

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

describe("latestMonth()", () => {
  it("returns the latest month", () => {
    const month = m(2025, 2);
    const latest = latestMonth(month, [
      m(2025, 1),
      m(2025, 2),
      m(2025, 3),
      m(2025, 4),
    ], 5);
    expectMonthEquals(latest, 2025, 4);
  });

  it("returns the latest month even if the months are disjoint", () => {
    const month = m(2025, 2);
    const latest = latestMonth(month, [
      m(2025, 1),
      m(2025, 2),
      m(2025, 5),
    ], 5);
    expectMonthEquals(latest, 2025, 5);
  });

  it("returns the latest month even if the months are out of order", () => {
    const month = m(2025, 2);
    const latest = latestMonth(month, [
      m(2025, 5),
      m(2025, 1),
      m(2025, 2),
      m(2025, 4),
      m(2024, 9),
    ], 5);
    expectMonthEquals(latest, 2025, 5);
  });

  it("caps the latest month distance", () => {
    const month = m(2025, 2);
    const latest = latestMonth(month, [
      m(2025, 1),
      m(2025, 2),
      m(2025, 5),
      m(2026, 9),
    ], 5);
    expectMonthEquals(latest, 2025, 5);
  });

  it("returns the provided month if there are no better months", () => {
    const month = m(2025, 2);
    const latest = latestMonth(month, [
      m(2024, 1),
      m(2024, 2),
      m(2024, 5),
      m(2025, 1),
    ], 5);
    expectMonthEquals(latest, 2025, 2);
  });

  it("returns the provided month if there are no months", () => {
    const month = m(2025, 2);
    const latest = latestMonth(month, [], 5);
    expectMonthEquals(latest, 2025, 2);
  });

  it("returns the provided month if the max distance is illogical", () => {
    const month = m(2025, 2);
    const latest = latestMonth(month, [
      m(2024, 1),
      m(2024, 2),
      m(2024, 5),
      m(2025, 1),
    ], -2);
    expectMonthEquals(latest, 2025, 2);
  });
});

describe("monthDistance", () => {
  it("returns a good distance for forward in the same year", () => {
    expect(monthDistance(m(2025, 2), m(2025, 4))).toEqual(2);
  });

  it("returns a good distance for forward between years", () => {
    expect(monthDistance(m(2025, 7), m(2026, 2))).toEqual(7);
  });

  it("returns a good distance for backwards in the same year", () => {
    expect(monthDistance(m(2025, 7), m(2025, 2))).toEqual(-5);
  });

  it("returns a good distance for backwards between years", () => {
    expect(monthDistance(m(2026, 7), m(2025, 10))).toEqual(-9);
  });
});

function expectMonthEquals(month: Date, year: number, monthNum: number) {
  expect(month.getFullYear()).toEqual(year);
  expect(month.getMonth()).toEqual(monthNum);
}

function m(year: number, month: number): Date {
  return new Date(year, month, 1);
}
