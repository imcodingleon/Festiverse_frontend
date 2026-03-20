import type { PerformanceSummary } from "@/features/performance/domain/model/performance";

export type PerformanceListState =
  | { status: "IDLE" }
  | { status: "LOADING" }
  | { status: "LOADED"; data: PerformanceSummary[]; allData: PerformanceSummary[] }
  | { status: "EMPTY" }
  | { status: "ERROR"; message: string };
