"use client";

import { useCallback } from "react";
import { fetchP3Views } from "@/infrastructure/dashboard/dashboardApi";
import type { DateParams } from "@/infrastructure/dashboard/types";
import { MetricCard } from "./MetricCard";
import { GroupedBarChart } from "./GroupedBarChart";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorMessage } from "./ErrorMessage";
import { safePct, toFiniteNumber, yAxisPct0 } from "./dashboardFormat";
import { useDashboardFetch, latest, toChartData } from "./useDashboardFetch";

const SECTION_ORDER = ["hero", "basic_info", "lineup", "ticket_price", "ticket_booking", "blog_review"];
const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  basic_info: "Basic Info",
  lineup: "Lineup",
  ticket_price: "Ticket Price",
  ticket_booking: "Ticket Booking",
  blog_review: "Blog Review",
};

interface P3SectionProps {
  dateParams: DateParams;
}

export function P3Section({ dateParams }: P3SectionProps) {
  const fetcher = useCallback(() => fetchP3Views(dateParams), [dateParams]);
  const { data, error, loading, retry } = useDashboardFetch(fetcher);

  if (loading) return <LoadingSkeleton count={5} />;
  if (error || !data) return <ErrorMessage message={error ?? undefined} onRetry={retry} />;

  const reviewCountData = (() => {
    const rows = data.reviewCountConv.data?.rows;
    if (!rows || rows.length === 0) return [];
    const latestDate = rows[rows.length - 1].report_date;
    return rows
      .filter((r) => r.report_date === latestDate)
      .sort((a, b) => a.review_count - b.review_count)
      .map((r) => ({
        review_count: `${r.review_count}건`,
        conversion_rate: toFiniteNumber(r.conversion_rate) ?? 0,
      }));
  })();

  const sectionXTicketData = (() => {
    const rows = data.sectionXTicket.data?.rows;
    if (!rows || rows.length === 0) return [];
    const latestDate = rows[rows.length - 1].report_date;
    return SECTION_ORDER.map((name) => {
      const row = rows.find((r) => r.report_date === latestDate && r.section_name === name);
      return {
        section: SECTION_LABELS[name] || name,
        reached: row?.reached_ticket_rate ?? 0,
        not_reached: row?.not_reached_ticket_rate ?? 0,
      };
    });
  })();

  return (
    <section>
      <h2 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
        <span className="w-2 h-5 bg-secondary rounded-full inline-block" />
        P3 — 전환
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="P3 전환율 (상세→예매)"
          value={latest(data.conversion.data?.rows) ? safePct(latest(data.conversion.data?.rows)!.p3_rate) : "-"}
          data={toChartData(data.conversion.data?.rows, "p3_rate")}
          error={data.conversion.error}
          color="var(--color-secondary)"
        />
        <MetricCard
          title="리뷰 클릭 → 예매 전환율"
          value={latest(data.reviewToTicket.data?.rows) ? safePct(latest(data.reviewToTicket.data?.rows)!.review_to_ticket_rate) : "-"}
          data={toChartData(data.reviewToTicket.data?.rows, "review_to_ticket_rate")}
          error={data.reviewToTicket.error}
          color="var(--color-accent-green)"
        />
        <MetricCard
          title="리뷰 미클릭 예매 전환율"
          value={latest(data.noReviewTicket.data?.rows) ? safePct(latest(data.noReviewTicket.data?.rows)!.no_review_ticket_rate) : "-"}
          data={toChartData(data.noReviewTicket.data?.rows, "no_review_ticket_rate")}
          error={data.noReviewTicket.error}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reviewCountData.length > 0 && (
          <GroupedBarChart
            title="리뷰 클릭 개수별 예매 전환율"
            data={reviewCountData}
            xKey="review_count"
            bars={[
              { dataKey: "conversion_rate", name: "전환율", color: "var(--color-secondary)" },
            ]}
            yFormatter={yAxisPct0}
          />
        )}
        {sectionXTicketData.length > 0 && (
          <GroupedBarChart
            title="섹션 도달 x 예매 전환 교차"
            data={sectionXTicketData}
            xKey="section"
            bars={[
              { dataKey: "reached", name: "도달", color: "var(--color-primary)" },
              { dataKey: "not_reached", name: "미도달", color: "var(--color-subtext)" },
            ]}
            yFormatter={yAxisPct0}
          />
        )}
      </div>
    </section>
  );
}
