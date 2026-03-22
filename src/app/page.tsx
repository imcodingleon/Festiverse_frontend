"use client";

import { AppLayout } from "@/ui/layout/AppLayout";
import { Header } from "@/ui/layout/Header";
import { FilterSection } from "@/features/performance/ui/components/FilterSection";
import { StreakCalendar } from "@/features/performance/ui/components/StreakCalendar";
import { PerformanceList } from "@/features/performance/ui/components/PerformanceList";
import { usePerformanceList } from "@/features/performance/application/hooks/usePerformanceList";
import { useFilter } from "@/features/performance/application/hooks/useFilter";
import { useSearchPageLifecycle } from "@/infrastructure/tracking/useSearchPageTracking";

export default function HomePage() {
  useSearchPageLifecycle();
  const listState = usePerformanceList();
  const { filters, setSelectedDate, setCalendarMonth, resetAllFilters } = useFilter();

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
        <PerformanceList
          state={listState}
          selectedDate={filters.selectedDate}
          hasActiveFilters={hasActiveFilters}
          calendarMonth={filters.startDate ? filters.calendarMonth : undefined}
          onReset={resetAllFilters}
        />
      </main>
    </AppLayout>
  );
}
