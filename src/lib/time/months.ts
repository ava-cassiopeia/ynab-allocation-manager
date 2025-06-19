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
