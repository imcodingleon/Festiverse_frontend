/** BE 응답이 number | string | null 일 때 안전하게 숫자로 해석 */
export function toFiniteNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export function safePct(v: unknown, fallback = "N/A"): string {
  const n = toFiniteNumber(v);
  if (n === null) return fallback;
  return `${(n * 100).toFixed(1)}%`;
}

export function safeMs2s(v: unknown, fallback = "N/A"): string {
  const n = toFiniteNumber(v);
  if (n === null) return fallback;
  return `${(n / 1000).toFixed(1)}s`;
}

export function safeNum(v: unknown, fallback = "N/A"): string {
  const n = toFiniteNumber(v);
  if (n === null) return fallback;
  return n.toLocaleString();
}

export function safeFloat2(v: unknown, fallback = "N/A"): string {
  const n = toFiniteNumber(v);
  if (n === null) return fallback;
  return n.toFixed(2);
}

/** YAxis / Tooltip — Recharts가 넘기는 값이 NaN·undefined일 수 있음 */
export function yAxisSeconds(v: number | string | undefined): string {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "N/A";
  return `${(n / 1000).toFixed(0)}s`;
}

export function yAxisPct0(v: number | string | undefined): string {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "N/A";
  return `${(n * 100).toFixed(0)}%`;
}

export function formatTooltipNumber(v: unknown): string {
  const n = toFiniteNumber(v);
  return n === null ? "N/A" : n.toLocaleString();
}

/** MetricCard / 라인차트용 시계열 포인트 (비숫자는 0으로) */
export function toChartPoints<T extends { report_date: string }>(
  rows: T[] | undefined,
  valueKey: keyof T,
): { date: string; value: number }[] {
  if (!rows) return [];
  return rows.map((r) => ({
    date: r.report_date,
    value: toFiniteNumber(r[valueKey]) ?? 0,
  }));
}
