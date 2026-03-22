"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchP2Views } from "@/infrastructure/dashboard/dashboardApi";
import type { DateParams } from "@/infrastructure/dashboard/types";
import { MetricCard } from "./MetricCard";
import { GroupedBarChart } from "./GroupedBarChart";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorMessage } from "./ErrorMessage";
import { safePct, toChartPoints, yAxisPct0 } from "./dashboardFormat";

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

const SECTION_ORDER = ["hero", "basic_info", "lineup", "ticket_price", "ticket_booking", "blog_review"];
const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  basic_info: "Basic Info",
  lineup: "Lineup",
  ticket_price: "Ticket Price",
  ticket_booking: "Ticket Booking",
  blog_review: "Blog Review",
};

interface P2SectionProps {
  dateParams: DateParams;
}

export function P2Section({ dateParams }: P2SectionProps) {
  const fetcher = useCallback(() => fetchP2Views(dateParams), [dateParams]);
  const { data, error, loading, retry } = useDashboardFetch(fetcher);

  if (loading) return <LoadingSkeleton count={6} />;
  if (error || !data) return <ErrorMessage message={error ?? undefined} onRetry={retry} />;

  const sectionReachLatest = (() => {
    const rows = data.sectionReach.data?.rows;
    if (!rows || rows.length === 0) return [];
    const latestDate = rows[rows.length - 1].report_date;
    return SECTION_ORDER.map((name) => {
      const row = rows.find((r) => r.report_date === latestDate && r.section_name === name);
      return { section: SECTION_LABELS[name] || name, reach_rate: row?.reach_rate ?? 0 };
    });
  })();

  const reviewPositionLatest = (() => {
    const rows = data.reviewPosition.data?.rows;
    if (!rows || rows.length === 0) return [];
    const latestDate = rows[rows.length - 1].report_date;
    return rows
      .filter((r) => r.report_date === latestDate)
      .sort((a, b) => a.review_index - b.review_index)
      .map((r) => ({ position: `#${r.review_index}`, click_share: r.click_share }));
  })();

  return (
    <section>
      <h2 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
        <span className="w-2 h-5 bg-accent-green rounded-full inline-block" />
        P2 — 상세 페이지
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="블로그 클릭율"
          value={latest(data.blogClick.data?.rows) ? safePct(latest(data.blogClick.data?.rows)!.blog_click_rate) : "-"}
          data={toChartData(data.blogClick.data?.rows, "blog_click_rate")}
          error={data.blogClick.error}
          color="var(--color-accent-green)"
        />
        <MetricCard
          title="즉시 이탈율"
          value={latest(data.immediateBounce.data?.rows) ? safePct(latest(data.immediateBounce.data?.rows)!.immediate_bounce_rate) : "-"}
          data={toChartData(data.immediateBounce.data?.rows, "immediate_bounce_rate")}
          error={data.immediateBounce.error}
          color="var(--color-secondary)"
        />
        <MetricCard
          title="블로그 클릭 후 복귀율"
          value={latest(data.blogReturn.data?.rows) ? safePct(latest(data.blogReturn.data?.rows)!.return_rate) : "-"}
          data={toChartData(data.blogReturn.data?.rows, "return_rate")}
          error={data.blogReturn.error}
        />
        <MetricCard
          title="공유 버튼 클릭율"
          value={latest(data.share.data?.rows) ? safePct(latest(data.share.data?.rows)!.share_rate) : "-"}
          data={toChartData(data.share.data?.rows, "share_rate")}
          error={data.share.error}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sectionReachLatest.length > 0 && (
          <GroupedBarChart
            title="섹션별 도달율"
            data={sectionReachLatest}
            xKey="section"
            bars={[{ dataKey: "reach_rate", name: "도달율", color: "var(--color-primary)" }]}
            yFormatter={yAxisPct0}
          />
        )}
        {reviewPositionLatest.length > 0 && (
          <GroupedBarChart
            title="리뷰 포지션별 클릭 분포"
            data={reviewPositionLatest}
            xKey="position"
            bars={[{ dataKey: "click_share", name: "클릭 점유율", color: "var(--color-accent-green)" }]}
            yFormatter={yAxisPct0}
          />
        )}
      </div>
    </section>
  );
}
