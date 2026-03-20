import type { PerformanceDetail } from "@/features/performance/domain/model/performance";

export type PerformanceDetailState =
  | { status: "IDLE" }
  | { status: "LOADING" }
  | { status: "LOADED"; data: PerformanceDetail }
  | { status: "ERROR"; message: string };
