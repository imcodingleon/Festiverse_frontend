"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AppLayout } from "@/ui/layout/AppLayout";
import { Header } from "@/ui/layout/Header";
import { FilterSection } from "@/features/performance/ui/components/FilterSection";
import { StreakCalendar } from "@/features/performance/ui/components/StreakCalendar";
import { PerformanceList } from "@/features/performance/ui/components/PerformanceList";
import { usePerformanceList } from "@/features/performance/application/hooks/usePerformanceList";
import { useFilter } from "@/features/performance/application/hooks/useFilter";
import { useSearchPageLifecycle } from "@/infrastructure/tracking/useSearchPageTracking";
import { getABGroup } from "@/infrastructure/ab/abGroup";
import { ActiveFilterBanner } from "@/features/performance/ui/components/ActiveFilterBanner";

export default function HomePage() {
  useSearchPageLifecycle();
  const listState = usePerformanceList();
  const { filters, setSelectedDate, setCalendarMonth, resetAllFilters, applyFilters } = useFilter();

  // A/B 테스트: B그룹에게 서울 + 락/인디 필터 자동 적용 (트래킹 없이)
  const abApplied = useRef(false);
  useEffect(() => {
    if (abApplied.current) return;
    abApplied.current = true;
    if (getABGroup() === "B") {
      applyFilters({ region: "서울", genre: "락/인디" });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 배너 닫기 상태 — 필터가 변경되면 다시 표시
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const prevFilterKey = useRef("");
  const filterKey = `${filters.region}|${filters.genre}`;
  if (filterKey !== prevFilterKey.current) {
    prevFilterKey.current = filterKey;
    if (bannerDismissed) setBannerDismissed(false);
  }

  const hasFilterTags = filters.region !== "" || filters.genre !== "";
  const showBanner = hasFilterTags && !bannerDismissed;

  const handleRemoveFilter = useCallback(
    (type: "region" | "genre") => {
      applyFilters({ [type]: "" });
    },
    [applyFilters],
  );

  const handleDismissBanner = useCallback(() => {
    setBannerDismissed(true);
  }, []);

  // 캘린더에는 날짜 필터링 전 전체 데이터를 사용 (selectedDate로 필터링해도 캘린더 표시 유지)
  const calendarPerformances =
    listState.status === "LOADED" ? listState.allData : [];

  const hasActiveFilters =
    filters.keyword !== "" ||
    filters.region !== "" ||
    filters.genre !== "" ||
    filters.selectedDate !== "" ||
    filters.startDate !== "";

  return (
    <AppLayout>
      <Header />
      <main className="px-4 space-y-6 lg:space-y-0 lg:grid lg:grid-cols-[450px_1fr] lg:gap-8 lg:max-w-[1600px] lg:mx-auto lg:px-0 lg:py-6">
        {/* 모바일 전용 필터 */}
        <div className="lg:hidden">
          <FilterSection />
        </div>

        {/* PC 사이드바 */}
        <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start space-y-6">
          <StreakCalendar
            performances={calendarPerformances}
            selectedDate={filters.selectedDate}
            calendarYear={filters.calendarYear}
            calendarMonth={filters.calendarMonth}
            onSelectDate={setSelectedDate}
            onMonthChange={setCalendarMonth}
          />
          <FilterSection />
        </aside>

        {/* 모바일 전용 캘린더 */}
        <div className="lg:hidden">
          <StreakCalendar
            performances={calendarPerformances}
            selectedDate={filters.selectedDate}
            calendarYear={filters.calendarYear}
            calendarMonth={filters.calendarMonth}
            onSelectDate={setSelectedDate}
            onMonthChange={setCalendarMonth}
          />
        </div>

        {/* 공연 목록 */}
        <div className="space-y-4">
          {showBanner && (
            <ActiveFilterBanner
              region={filters.region}
              genre={filters.genre}
              onRemoveFilter={handleRemoveFilter}
              onDismiss={handleDismissBanner}
            />
          )}
          <PerformanceList
            state={listState}
            selectedDate={filters.selectedDate}
            hasActiveFilters={hasActiveFilters}
            calendarMonth={filters.startDate ? filters.calendarMonth : undefined}
            onReset={resetAllFilters}
          />
        </div>
      </main>
    </AppLayout>
  );
}
