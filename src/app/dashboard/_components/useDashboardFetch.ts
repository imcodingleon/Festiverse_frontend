"use client";

import { useEffect, useState, useCallback } from "react";
import { toChartPoints } from "./dashboardFormat";

export function useDashboardFetch<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e: Error) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [fetcher, fetchKey]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setData(null);
    setFetchKey((k) => k + 1);
  }, []);

  return { data, error, loading, retry };
}

export function latest<T extends { report_date: string }>(rows: T[] | undefined): T | undefined {
  if (!rows || rows.length === 0) return undefined;
  return rows[rows.length - 1];
}

export function toChartData<T extends { report_date: string }>(
  rows: T[] | undefined,
  valueKey: keyof T,
): { date: string; value: number }[] {
  return toChartPoints(rows, valueKey);
}
