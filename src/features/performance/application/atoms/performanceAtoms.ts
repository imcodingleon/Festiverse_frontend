import { atom } from "jotai";
import type { FilterState } from "@/features/performance/domain/state/filterState";
import { initialFilterState } from "@/features/performance/domain/state/filterState";
import type { PerformanceListState } from "@/features/performance/domain/state/performanceListState";
import type { PerformanceDetailState } from "@/features/performance/domain/state/performanceDetailState";
import type { BlogReviewState } from "@/features/performance/domain/state/blogReviewState";
import type { TicketInfoState } from "@/features/performance/domain/state/ticketInfoState";

export const filterAtom = atom<FilterState>(initialFilterState);

export const performanceListAtom = atom<PerformanceListState>({ status: "IDLE" });

export const performanceDetailAtom = atom<PerformanceDetailState>({ status: "IDLE" });

export const blogReviewsAtom = atom<BlogReviewState>({ status: "IDLE" });

export const ticketInfoAtom = atom<TicketInfoState>({ status: "IDLE" });
