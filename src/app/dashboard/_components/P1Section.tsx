"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchP1Views } from "@/infrastructure/dashboard/dashboardApi";
import type { DateParams } from "@/infrastructure/dashboard/types";
import { MetricCard } from "./MetricCard";
import { TrendLineChart } from "./TrendLineChart";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorMessage } from "./ErrorMessage";
import {
  safePct,
  safeMs2s,
  safeNum,
  safeFloat2,
  toFiniteNumber,
  toChartPoints,
  yAxisSeconds,
} from "./dashboardFormat";

function useDashboardFetch<T>(fetcher: () => Promise<T>) {
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

function latest<T extends { report_date: string }>(rows: T[] | undefined): T | undefined {
  if (!rows || rows.length === 0) return undefined;
  return rows[rows.length - 1];
}

function toChartData<T extends { report_date: string }>(
  rows: T[] | undefined,
  valueKey: keyof T,
): { date: string; value: number }[] {
  return toChartPoints(rows, valueKey);
}

interface SegmentPivotRow {
  date: string;
  filtered: number;
  nonFiltered: number;
}

function pivotSegment<T extends { report_date: string; segment: string }>(
  rows: T[] | undefined,
  valueKey: string,
): SegmentPivotRow[] {
  if (!rows) return [];
  const map = new Map<string, SegmentPivotRow>();
  for (const r of rows) {
    if (!map.has(r.report_date)) {
      map.set(r.report_date, { date: r.report_date, filtered: 0, nonFiltered: 0 });
    }
    const entry = map.get(r.report_date)!;
    const val = toFiniteNumber((r as Record<string, unknown>)[valueKey]) ?? 0;
    if (r.segment === "Filtered") entry.filtered = val;
    else entry.nonFiltered = val;
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

interface P1SectionProps {
  dateParams: DateParams;
}

export function P1Section({ dateParams }: P1SectionProps) {
  const fetcher = useCallback(() => fetchP1Views(dateParams), [dateParams]);
  const { data, error, loading, retry } = useDashboardFetch(fetcher);

  if (loading) return <LoadingSkeleton count={9} />;
  if (error || !data) return <ErrorMessage message={error ?? undefined} onRetry={retry} />;

  const metrics: {
    key: string;
    title: string;
    value: string;
    subtitle?: string;
    data: { date: string; value: number }[];
    error: string | null;
    color?: string;
  }[] = [
    {
      key: "pv",
      title: "탐색 진입 수 (PV)",
      value: latest(data.pv.data?.rows) ? safeNum(latest(data.pv.data?.rows)!.pv) : "-",
      data: toChartData(data.pv.data?.rows, "pv"),
      error: data.pv.error,
    },
    {
      key: "dcr",
      title: "P1 전환율 (탐색→상세)",
      value: latest(data.dcr.data?.rows) ? safePct(latest(data.dcr.data?.rows)!.dcr) : "-",
      data: toChartData(data.dcr.data?.rows, "dcr"),
      error: data.dcr.error,
      color: "var(--color-secondary)",
    },
    {
      key: "fsr",
      title: "필터 선택률",
      value: latest(data.fsr.data?.rows) ? safePct(latest(data.fsr.data?.rows)!.fsr) : "-",
      data: toChartData(data.fsr.data?.rows, "fsr"),
      error: data.fsr.error,
    },
    {
      key: "far",
      title: "필터 적용률",
      value: latest(data.far.data?.rows) ? safePct(latest(data.far.data?.rows)!.far) : "-",
      data: toChartData(data.far.data?.rows, "far"),
      error: data.far.error,
    },
    {
      key: "tft",
      title: "첫 필터 선택 소요시간",
      value: latest(data.tft.data?.rows) ? safeMs2s(latest(data.tft.data?.rows)!.avg_tft_ms) : "-",
      data: toChartData(data.tft.data?.rows, "avg_tft_ms"),
      error: data.tft.error,
    },
    {
      key: "tfa",
      title: "첫 필터 적용 소요시간",
      value: latest(data.tfa.data?.rows) ? safeMs2s(latest(data.tfa.data?.rows)!.avg_tfa_ms) : "-",
      data: toChartData(data.tfa.data?.rows, "avg_tfa_ms"),
      error: data.tfa.error,
    },
    {
      key: "ttd",
      title: "상세 도달 소요시간",
      value: latest(data.ttd.data?.rows) ? safeMs2s(latest(data.ttd.data?.rows)!.avg_ttd_ms) : "-",
      data: toChartData(data.ttd.data?.rows, "avg_ttd_ms"),
      error: data.ttd.error,
    },
    {
      key: "timeOnPage",
      title: "평균 체류시간",
      value: latest(data.timeOnPage.data?.rows)
        ? safeMs2s(latest(data.timeOnPage.data?.rows)!.avg_time_on_page_ms)
        : "-",
      data: toChartData(data.timeOnPage.data?.rows, "avg_time_on_page_ms"),
      error: data.timeOnPage.error,
    },
    {
      key: "fuc",
      title: "세션당 필터 사용 횟수",
      value: latest(data.fuc.data?.rows) ? safeFloat2(latest(data.fuc.data?.rows)!.avg_fuc) : "-",
      data: toChartData(data.fuc.data?.rows, "avg_fuc"),
      error: data.fuc.error,
    },
    {
      key: "rer",
      title: "탐색 반복률",
      value: latest(data.rer.data?.rows) ? safePct(latest(data.rer.data?.rows)!.rer) : "-",
      data: toChartData(data.rer.data?.rows, "rer"),
      error: data.rer.error,
    },
    {
      key: "afa",
      title: "세션당 필터 적용 횟수",
      value: latest(data.afa.data?.rows) ? safeFloat2(latest(data.afa.data?.rows)!.avg_afa) : "-",
      data: toChartData(data.afa.data?.rows, "avg_afa"),
      error: data.afa.error,
    },
    {
      key: "sur",
      title: "검색 사용 세션율",
      value: latest(data.sur.data?.rows) ? safePct(latest(data.sur.data?.rows)!.sur) : "-",
      data: toChartData(data.sur.data?.rows, "sur"),
      error: data.sur.error,
    },
    {
      key: "scr",
      title: "정렬 변경률",
      value: latest(data.scr.data?.rows) ? safePct(latest(data.scr.data?.rows)!.scr) : "-",
      data: toChartData(data.scr.data?.rows, "scr"),
      error: data.scr.error,
    },
  ];

  const timeOnPageSeg = pivotSegment(data.timeOnPageSeg.data?.rows, "avg_time_on_page_ms");
  const ttdSeg = pivotSegment(data.ttdSeg.data?.rows, "avg_ttd_ms");

  return (
    <section>
      <h2 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
        <span className="w-2 h-5 bg-primary rounded-full inline-block" />
        P1 — 탐색 퍼널
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {metrics.map((m) => (
          <MetricCard
            key={m.key}
            title={m.title}
            value={m.value}
            subtitle={m.subtitle}
            data={m.data}
            color={m.color}
            error={m.error}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {!data.timeOnPageSeg.error && timeOnPageSeg.length > 0 && (
          <TrendLineChart
            title="체류시간 — Filtered vs Non Filtered"
            data={timeOnPageSeg}
            lines={[
              { dataKey: "filtered", name: "Filtered", color: "var(--color-secondary)" },
              { dataKey: "nonFiltered", name: "Non Filtered", color: "var(--color-primary)" },
            ]}
            yFormatter={yAxisSeconds}
          />
        )}
        {!data.ttdSeg.error && ttdSeg.length > 0 && (
          <TrendLineChart
            title="상세 도달 소요시간 — Filtered vs Non Filtered"
            data={ttdSeg}
            lines={[
              { dataKey: "filtered", name: "Filtered", color: "var(--color-secondary)" },
              { dataKey: "nonFiltered", name: "Non Filtered", color: "var(--color-primary)" },
            ]}
            yFormatter={yAxisSeconds}
          />
        )}
      </div>
    </section>
  );
}
