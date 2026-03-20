import type { BlogReview } from "@/features/performance/domain/model/blogReview";

export type BlogReviewState =
  | { status: "IDLE" }
  | { status: "LOADING" }
  | { status: "LOADED"; data: BlogReview[] }
  | { status: "ERROR"; message: string };
