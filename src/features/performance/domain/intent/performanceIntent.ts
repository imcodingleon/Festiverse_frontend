export type PerformanceIntent =
  | { type: "SEARCH"; keyword: string }
  | { type: "FILTER_BY_REGION"; region: string }
  | { type: "FILTER_BY_DATE"; startDate: string; endDate: string }
  | { type: "VIEW_DETAIL"; id: string }
  | { type: "SORT"; sortBy: string }
  | { type: "LOAD_MORE" }
  | { type: "REFRESH" };
