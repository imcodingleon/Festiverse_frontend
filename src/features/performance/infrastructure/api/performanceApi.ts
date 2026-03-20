import { get } from "@/infrastructure/http/httpClient";
import type { FilterState } from "@/features/performance/domain/state/filterState";
import type { PerformanceSummary, PerformanceDetail } from "@/features/performance/domain/model/performance";
import type { BlogReview } from "@/features/performance/domain/model/blogReview";
import type { TicketInfo } from "@/features/performance/domain/model/ticketInfo";
import type {
  PerformanceSummaryDto,
  PerformanceDetailDto,
  BlogReviewDto,
  TicketInfoDto,
} from "./dto";
import {
  toPerformanceSummary,
  toPerformanceDetail,
  toBlogReview,
  toTicketInfo,
} from "./performanceMapper";
import { toApiDate } from "@/features/performance/domain/model/utils";

export interface FetchPerformancesResult {
  /** 날짜 필터링 전 전체 결과 (캘린더 표시용) */
  all: PerformanceSummary[];
  /** 날짜 필터링 후 결과 (목록 표시용) */
  filtered: PerformanceSummary[];
}

export async function fetchPerformances(
  filters: FilterState,
): Promise<FetchPerformancesResult> {
  const params: Record<string, string | number | undefined> = {
    page: filters.page,
    size: filters.size,
  };
  if (filters.keyword) params.keyword = filters.keyword.replace(/\s+/g, "");
  if (filters.region) params.region = filters.region;
  if (filters.genre) params.genre = filters.genre;

  // 날짜 필터는 백엔드 버그로 인해 프론트에서 처리
  const dtos = await get<PerformanceSummaryDto[]>("/api/performances", params);
  const all = dtos.map(toPerformanceSummary);

  // 프론트엔드 날짜 필터링
  let filtered = all;
  if (filters.selectedDate) {
    const selected = filters.selectedDate.replace(/-/g, ".");
    filtered = all.filter((p) => {
      return p.startDate <= selected && p.endDate >= selected;
    });
  } else if (filters.startDate && filters.endDate) {
    filtered = all.filter((p) => {
      return p.endDate >= filters.startDate && p.startDate <= filters.endDate;
    });
  }

  return { all, filtered };
}

export async function fetchDetail(id: string): Promise<PerformanceDetail> {
  const dto = await get<PerformanceDetailDto>(`/api/performances/${id}`);
  return toPerformanceDetail(dto);
}

export async function fetchBlogReviews(id: string): Promise<BlogReview[]> {
  const dtos = await get<BlogReviewDto[]>(`/api/performances/${id}/blogs`);
  return dtos.map(toBlogReview);
}

export async function fetchTicketInfo(id: string): Promise<TicketInfo[]> {
  const dtos = await get<TicketInfoDto[]>(`/api/tickets/${id}`);
  return dtos.map(toTicketInfo);
}
