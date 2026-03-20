"use client";

import { useAtom } from "jotai";
import { useCallback } from "react";
import { filterAtom } from "../atoms/performanceAtoms";
import { initialFilterState } from "../../domain/state/filterState";

export function useFilter() {
  const [filters, setFilters] = useAtom(filterAtom);

  const setKeyword = useCallback(
    (keyword: string) =>
      setFilters((prev) => ({
        ...prev,
        keyword,
        startDate: "",
        endDate: "",
        selectedDate: "",
        page: 1,
      })),
    [setFilters],
  );

  const setRegion = useCallback(
    (region: string) => setFilters((prev) => ({ ...prev, region, page: 1 })),
    [setFilters],
  );

  const setDateRange = useCallback(
    (startDate: string, endDate: string) =>
      setFilters((prev) => ({ ...prev, startDate, endDate, page: 1 })),
    [setFilters],
  );

  const setGenre = useCallback(
    (genre: string) => setFilters((prev) => ({ ...prev, genre, page: 1 })),
    [setFilters],
  );

  const setSelectedDate = useCallback(
    (selectedDate: string) =>
      setFilters((prev) => ({ ...prev, selectedDate, page: 1 })),
    [setFilters],
  );

  const setMonthRange = useCallback(
    (startDate: string, endDate: string) =>
      setFilters((prev) => ({ ...prev, startDate, endDate, selectedDate: "", page: 1 })),
    [setFilters],
  );

  const setCalendarMonth = useCallback(
    (year: number, month: number) => {
      const start = `${year}.${String(month + 1).padStart(2, "0")}.01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const end = `${year}.${String(month + 1).padStart(2, "0")}.${String(lastDay).padStart(2, "0")}`;
      setFilters((prev) => ({
        ...prev,
        calendarYear: year,
        calendarMonth: month,
        startDate: start,
        endDate: end,
        selectedDate: "",
        page: 1,
      }));
    },
    [setFilters],
  );

  const resetAllFilters = useCallback(() => {
    const now = new Date();
    setFilters({
      ...initialFilterState,
      calendarYear: now.getFullYear(),
      calendarMonth: now.getMonth(),
    });
  }, [setFilters]);

  const applyFilters = useCallback(
    (updates: Partial<{ keyword: string; region: string; genre: string }>) =>
      setFilters((prev) => {
        const next = { ...prev, ...updates, page: 1 };
        // keyword가 있으면 날짜 범위 해제
        if (next.keyword) {
          next.startDate = "";
          next.endDate = "";
          next.selectedDate = "";
        }
        return next;
      }),
    [setFilters],
  );

  return { filters, setKeyword, setRegion, setDateRange, setGenre, setSelectedDate, setMonthRange, setCalendarMonth, resetAllFilters, applyFilters };
}
