export function calculateDday(startDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(startDate.replace(/\./g, "-"));
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDday(startDate: string): string {
  const d = calculateDday(startDate);
  if (d > 0) return `D-${d}`;
  if (d === 0) return "D-DAY";
  return `D+${Math.abs(d)}`;
}

export function isDdayPast(startDate: string): boolean {
  return calculateDday(startDate) < 0;
}

export function formatDateRange(start: string, end: string): string {
  return `${start} - ${end.slice(5)}`;
}

export function toApiDate(dotDate: string): string {
  return dotDate.replace(/\./g, "");
}

export function toDotDate(apiDate: string): string {
  if (apiDate.length !== 8) return apiDate;
  return `${apiDate.slice(0, 4)}.${apiDate.slice(4, 6)}.${apiDate.slice(6, 8)}`;
}
