"use client";

import { useState, useMemo } from "react";
import type { PerformanceListState } from "@/features/performance/domain/state/performanceListState";
import type { PerformanceSummary } from "@/features/performance/domain/model/performance";
import { PerformanceCard } from "./PerformanceCard";
import { PerformanceCardSkeleton } from "./PerformanceCardSkeleton";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { Icon } from "@/ui/components/Icon";
import { useSearchPageTracking } from "@/infrastructure/tracking/useSearchPageTracking";

interface PerformanceListProps {
  state: PerformanceListState;
  selectedDate?: string;
  hasActiveFilters?: boolean;
  calendarMonth?: number;
  onReset?: () => void;
}

function formatSelectedDateTitle(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return "페스티벌 목록";
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  return `${month}월 ${day}일 페스티벌`;
}

function toSortableDate(dateStr: string): number {
  return new Date(dateStr.replace(/\./g, "-")).getTime();
}

function sortPerformances(
  data: PerformanceSummary[],
  sort: "latest" | "oldest",
): PerformanceSummary[] {
  const sorted = [...data].sort((a, b) => {
    const da = toSortableDate(a.startDate);
    const db = toSortableDate(b.startDate);
    return sort === "latest" ? da - db : db - da;
  });
  return sorted;
}

export function PerformanceList({ state, selectedDate, hasActiveFilters, calendarMonth, onReset }: PerformanceListProps) {
  const { trackSortChanged } = useSearchPageTracking();
  const [sort, setSort] = useState<"latest" | "oldest">("latest");

  const title = selectedDate
    ? formatSelectedDateTitle(selectedDate)
    : calendarMonth != null && hasActiveFilters
      ? `${calendarMonth + 1}월 페스티벌 목록`
      : "전체 페스티벌 목록";

  const sortLabel = sort === "latest" ? "최신순" : "오래된순";

  const sortedData = useMemo(() => {
    if (state.status !== "LOADED") return [];
    return sortPerformances(state.data, sort);
  }, [state, sort]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold font-display text-text-main">
          {title}{" "}
          {state.status === "LOADED" && (
            <span className="text-primary">({state.data.length}건)</span>
          )}
        </h3>
        <div className="flex items-center gap-3">
          {hasActiveFilters && onReset && (
            <button
              onClick={() => {
                onReset();
                setSort("latest");
              }}
              className="text-xs text-subtext flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            >
              <Icon name="refresh" className="text-sm" /> 초기화
            </button>
          )}
          <button
            onClick={() => {
              const prev = sort;
              const next = prev === "latest" ? "oldest" : "latest";
              trackSortChanged(next, prev);
              setSort(next);
            }}
            className="text-xs text-subtext flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            {sortLabel} <Icon name="swap_vert" className="text-sm" />
          </button>
        </div>
      </div>
      <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-5 lg:space-y-0">
        {state.status === "LOADING" && (
          <>
            <PerformanceCardSkeleton />
            <PerformanceCardSkeleton />
            <PerformanceCardSkeleton />
          </>
        )}
        {state.status === "LOADED" &&
          sortedData.map((p, i) => <PerformanceCard key={p.id} performance={p} index={i} />)}
        {state.status === "EMPTY" && <EmptyState />}
        {state.status === "ERROR" && <ErrorState message={state.message} />}
      </div>
    </section>
  );
}
