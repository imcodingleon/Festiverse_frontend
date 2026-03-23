"use client";

import { useMemo } from "react";
import { Icon } from "@/ui/components/Icon";
import type { PerformanceSummary } from "@/features/performance/domain/model/performance";
import { useSearchPageTracking } from "@/infrastructure/tracking/useSearchPageTracking";

interface StreakCalendarProps {
  performances: PerformanceSummary[];
  selectedDate?: string;
  calendarYear: number;
  calendarMonth: number;
  onSelectDate?: (dateStr: string) => void;
  onMonthChange?: (year: number, month: number) => void;
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function StreakCalendar({
  performances,
  selectedDate,
  calendarYear: year,
  calendarMonth: month,
  onSelectDate,
  onMonthChange,
}: StreakCalendarProps) {
  const { trackCalendarDateClicked, trackCalendarPeriodNavigated } = useSearchPageTracking();
  const monthLabel = `${year}년 ${month + 1}월`;

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const performanceDates = useMemo(() => {
    const set = new Set<string>();
    const addRange = (startStr: string, endStr: string) => {
      const start = new Date(startStr.replace(/\./g, "-"));
      const end = new Date(endStr.replace(/\./g, "-"));
      const cur = new Date(start);
      while (cur <= end) {
        set.add(
          `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`,
        );
        cur.setDate(cur.getDate() + 1);
      }
    };
    for (const p of performances) {
      if (p.dateRanges) {
        for (const range of p.dateRanges.split(",")) {
          const [rs, re] = range.trim().split("~");
          if (rs && re) addRange(rs.trim(), re.trim());
        }
      } else {
        addRange(p.startDate, p.endDate);
      }
    }
    return set;
  }, [performances]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const cells: { day: number; inMonth: boolean; dateStr: string }[] = [];
  for (let i = 0; i < firstDow; i++) {
    const d = prevMonthDays - firstDow + 1 + i;
    cells.push({ day: d, inMonth: false, dateStr: "" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, inMonth: true, dateStr });
  }

  const handlePrev = () => {
    const prevDate = new Date(year, month - 1, 1);
    const fromYM = `${year}-${String(month + 1).padStart(2, "0")}`;
    const toYM = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
    trackCalendarPeriodNavigated("prev", fromYM, toYM);
    onMonthChange?.(prevDate.getFullYear(), prevDate.getMonth());
  };

  const handleNext = () => {
    const nextDate = new Date(year, month + 1, 1);
    const fromYM = `${year}-${String(month + 1).padStart(2, "0")}`;
    const toYM = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
    trackCalendarPeriodNavigated("next", fromYM, toYM);
    onMonthChange?.(nextDate.getFullYear(), nextDate.getMonth());
  };

  const handleDayClick = (dateStr: string) => {
    if (!onSelectDate) return;
    const clickedDate = selectedDate === dateStr ? "" : dateStr;
    if (clickedDate) {
      trackCalendarDateClicked(clickedDate, year, month + 1);
    }
    onSelectDate(clickedDate);
  };

  return (
    <section className="bg-card-light rounded-lg p-4 lg:p-6 lg:pb-10 border border-card-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold font-display text-accent-green text-base lg:text-lg">{monthLabel}</h4>
        <div className="flex gap-2">
          <button onClick={handlePrev}>
            <Icon name="chevron_left" className="text-sm cursor-pointer text-subtext" />
          </button>
          <button onClick={handleNext}>
            <Icon name="chevron_right" className="text-sm cursor-pointer text-subtext" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-4 lg:gap-y-6 text-center">
        {DAYS.map((d) => (
          <div key={d} className="text-[10px] lg:text-xs font-bold text-subtext/60">
            {d}
          </div>
        ))}
        {cells.map((cell, i) => {
          const isToday = cell.dateStr === todayStr;
          const isSelected = cell.dateStr === selectedDate;
          const hasPerformance = cell.inMonth && performanceDates.has(cell.dateStr);
          return (
            <button
              key={i}
              type="button"
              disabled={!cell.inMonth}
              onClick={() => cell.inMonth && handleDayClick(cell.dateStr)}
              className={`text-xs lg:text-sm py-1 lg:py-2 relative cursor-pointer transition-colors rounded ${
                !cell.inMonth
                  ? "text-subtext/30 cursor-default"
                  : isSelected
                    ? "font-bold text-white bg-secondary shadow-sm shadow-secondary/30"
                    : isToday
                      ? "font-bold text-white bg-primary shadow-sm shadow-primary/30"
                      : "text-text-main hover:bg-surface"
              }`}
            >
              {cell.day}
              {hasPerformance && !isToday && !isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary/60 rounded-full mx-1" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
