const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Returns a label like "Jul - Aug" for the `count` amount of months from today,
 * inclusive.
 */
export function getMonthsLabel(count: number, today = new Date()): string {
  const currentMonth = today.getMonth();
  if (count <= 1) {
    return MONTH_LABELS[currentMonth];
  } else {
    const currentYear = today.getFullYear();
    const finalDate = new Date(today.getFullYear(), currentMonth + (count - 1), today.getDate());
    const finalMonth = finalDate.getMonth();
    const finalYear = finalDate.getFullYear();
    const isNextYear = finalYear !== currentYear;

    return MONTH_LABELS[currentMonth] + " - " + MONTH_LABELS[finalMonth] + (isNextYear ? ' ' + finalYear : '');
  }
}

export function parseMonth(monthStr: string): Date {
  const parts = monthStr.split("-");
  if (parts.length !== 3) {
    throw new Error(`Can't parse month: ${monthStr} is not a  correctly formatted month.`);
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // only months are 0-indexed (ugh)
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

export function monthToApiMonth(month: Date): string {
  const adjustedMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  return adjustedMonth.toISOString().split('T')[0];
}

/**
 * Returns the latest month from the provided months that is after the provided
 * month. Otherwise returns the provided month.
 *
 * Runs in linear time. `months` can be unordered.
 */
export function latestMonth(month: Date, months: Date[], maxDistance?: number): Date {
  if (months.length < 1) return month;
  if (maxDistance !== undefined && maxDistance < 1) return month;

  let bestMonth = month;
  for (const candidateMonth of months) {
    const distance = monthDistance(month, candidateMonth);
    if (distance <= 0) continue;
    if (maxDistance !== undefined && distance > maxDistance) continue;

    const bestDistance = monthDistance(bestMonth, candidateMonth);
    if (bestDistance > 0) {
      bestMonth = candidateMonth;
    }
  }
  return bestMonth;
}

export function monthDistance(date1: Date, date2: Date) {
  const yearDistance = date2.getFullYear() - date1.getFullYear();
  return (date2.getMonth() - date1.getMonth()) + (yearDistance * 12);
}
