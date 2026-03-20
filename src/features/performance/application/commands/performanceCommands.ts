import type { Setter } from "jotai";
import type { FilterState } from "@/features/performance/domain/state/filterState";
import {
  performanceListAtom,
  performanceDetailAtom,
  blogReviewsAtom,
  ticketInfoAtom,
} from "../atoms/performanceAtoms";
import {
  fetchPerformances,
  fetchDetail,
  fetchBlogReviews,
  fetchTicketInfo,
} from "@/features/performance/infrastructure/api/performanceApi";

export async function loadPerformanceList(
  set: Setter,
  filters: FilterState,
) {
  set(performanceListAtom, { status: "LOADING" });
  try {
    const { all, filtered } = await fetchPerformances(filters);
    if (filtered.length === 0) {
      set(performanceListAtom, { status: "EMPTY" });
    } else {
      set(performanceListAtom, { status: "LOADED", data: filtered, allData: all });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "알 수 없는 오류";
    set(performanceListAtom, { status: "ERROR", message });
  }
}

export async function loadPerformanceDetail(set: Setter, id: string) {
  set(performanceDetailAtom, { status: "LOADING" });
  set(blogReviewsAtom, { status: "LOADING" });
  set(ticketInfoAtom, { status: "LOADING" });

  const detailPromise = fetchDetail(id)
    .then((data) => set(performanceDetailAtom, { status: "LOADED", data }))
    .catch((e) => {
      const message = e instanceof Error ? e.message : "상세 정보 로드 실패";
      set(performanceDetailAtom, { status: "ERROR", message });
    });

  const blogPromise = fetchBlogReviews(id)
    .then((data) => set(blogReviewsAtom, { status: "LOADED", data }))
    .catch((e) => {
      const message = e instanceof Error ? e.message : "블로그 리뷰 로드 실패";
      set(blogReviewsAtom, { status: "ERROR", message });
    });

  const ticketPromise = fetchTicketInfo(id)
    .then((data) => set(ticketInfoAtom, { status: "LOADED", data }))
    .catch((e) => {
      const message = e instanceof Error ? e.message : "티켓 정보 로드 실패";
      set(ticketInfoAtom, { status: "ERROR", message });
    });

  await Promise.all([detailPromise, blogPromise, ticketPromise]);
}
