import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, render } from "@testing-library/react";
import { useDetailPageLifecycle, useDetailPageTracking } from "../useDetailPageTracking";
import { EVENT_TYPES } from "../constants";
import {
  getCurrentDetailFestivalId,
  resetDetailPageState,
  resetIsFilteredSession,
  markReviewClicked,
  addSectionViewed,
  getReviewClicked,
  getReviewClickCount,
} from "../trackingState";
import { clearTrackingStorage, resetTrackingModules } from "./testUtils";

describe("검증 4 — useDetailPageTracking", () => {
  beforeEach(() => {
    clearTrackingStorage();
    resetTrackingModules();
    resetIsFilteredSession();
  });

  describe("4-A lifecycle", () => {
    it("마운트 시 detail_page_entered + festival_id / festival_name", async () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      renderHook(() => useDetailPageLifecycle("PF001", "페스티벌"));
      await waitFor(() => {
        const p = logSpy.mock.calls.find(
          (c) =>
            (c[1] as Record<string, unknown> | undefined)?.event_type ===
            EVENT_TYPES.DETAIL_PAGE_ENTERED,
        )?.[1] as Record<string, unknown>;
        expect(p?.event_data).toEqual({ festival_id: "PF001", festival_name: "페스티벌" });
        expect(p?.page_url).toBe(window.location.pathname);
      });
      expect(getCurrentDetailFestivalId()).toBe("PF001");
      logSpy.mockRestore();
    });

    it("resetDetailPageState: sections 비우기 + id 변경 시 재발화", async () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const { rerender } = renderHook(
        ({ id, name }: { id: string; name?: string }) => useDetailPageLifecycle(id, name),
        { initialProps: { id: "PF001", name: "A" } },
      );
      await waitFor(() => expect(getCurrentDetailFestivalId()).toBe("PF001"));
      rerender({ id: "PF002", name: "B" });
      await waitFor(() => expect(getCurrentDetailFestivalId()).toBe("PF002"));
      const enters = logSpy.mock.calls.filter(
        (c) =>
          (c[1] as Record<string, unknown> | undefined)?.event_type ===
          EVENT_TYPES.DETAIL_PAGE_ENTERED,
      );
      expect(enters.length).toBeGreaterThanOrEqual(2);
      logSpy.mockRestore();
    });

    it("cleanup 시 detail_page_exited + pageUrlOverride", async () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const { unmount } = renderHook(() => useDetailPageLifecycle("PF1"));
      unmount();
      await waitFor(() => {
        const exit = logSpy.mock.calls.find(
          (c) =>
            c[0] === "[TrackEvent:beacon]" &&
            (c[1] as Record<string, unknown>)?.event_type === EVENT_TYPES.DETAIL_PAGE_EXITED,
        );
        expect(exit).toBeDefined();
        expect((exit?.[1] as Record<string, unknown>)?.page_url).toBe(window.location.pathname);
        const ed = (exit?.[1] as Record<string, unknown>)?.event_data as Record<string, unknown>;
        expect(ed?.festival_id).toBe("PF1");
        expect(typeof ed?.time_on_page_ms).toBe("number");
        expect(Array.isArray(ed?.sections_viewed_list)).toBe(true);
      });
      logSpy.mockRestore();
    });

    it("createSectionRef: ref 부착 가능", () => {
      const {
        result: { current },
      } = renderHook(() => useDetailPageLifecycle("PF1"));
      const cb = current.createSectionRef("hero");
      const div = document.createElement("div");
      cb(div);
      expect(div.dataset.trackSection).toBe("hero");
    });
  });

  describe("4-B section_viewed (IntersectionObserver)", () => {
    it("노출 시 section_viewed 1회, 동일 섹션 중복 없음", async () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      function Host({ fid }: { fid: string }) {
        const { createSectionRef } = useDetailPageLifecycle(fid);
        return (
          <div key={fid} ref={createSectionRef("hero")}>
            h
          </div>
        );
      }
      render(<Host fid="PF1" />);
      await waitFor(() => {
        const sectionEvents = logSpy.mock.calls.filter(
          (c) =>
            (c[1] as Record<string, unknown> | undefined)?.event_type === EVENT_TYPES.SECTION_VIEWED,
        );
        expect(sectionEvents.length).toBeGreaterThanOrEqual(1);
      });
      const sectionEvents = logSpy.mock.calls.filter(
        (c) =>
          (c[1] as Record<string, unknown> | undefined)?.event_type === EVENT_TYPES.SECTION_VIEWED,
      );
      expect(sectionEvents.length).toBe(1);
      logSpy.mockRestore();
    });
  });

  describe("4-C 핸들러", () => {
    it("trackBlogReviewClicked + review 상태 증가", () => {
      resetDetailPageState("PF1");
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const { result } = renderHook(() => useDetailPageTracking());
      result.current.trackBlogReviewClicked(1, "t", "https://x");
      result.current.trackBlogReviewClicked(2, "t2", "https://y");
      expect(getReviewClicked()).toBe(true);
      expect(getReviewClickCount()).toBe(2);
      logSpy.mockRestore();
    });

    it("trackShareButtonClicked", () => {
      resetDetailPageState("PF1");
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const { result } = renderHook(() => useDetailPageTracking());
      result.current.trackShareButtonClicked();
      const p = logSpy.mock.calls.at(-1)?.[1] as Record<string, unknown>;
      expect(p?.event_type).toBe(EVENT_TYPES.SHARE_BUTTON_CLICKED);
      logSpy.mockRestore();
    });

    it("trackTicketButtonClicked 필드 + trackFavoriteToggled re-export", () => {
      resetDetailPageState("PF1");
      addSectionViewed("hero");
      addSectionViewed("basic_info");
      addSectionViewed("lineup");
      markReviewClicked();
      markReviewClicked();
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const { result } = renderHook(() => useDetailPageTracking());
      result.current.trackTicketButtonClicked("melon");
      const p = logSpy.mock.calls.find(
        (c) =>
          (c[1] as Record<string, unknown> | undefined)?.event_type ===
          EVENT_TYPES.TICKET_BUTTON_CLICKED,
      )?.[1] as Record<string, unknown>;
      const ed = p?.event_data as Record<string, unknown>;
      expect(ed?.ticket_provider).toBe("melon");
      expect(ed?.review_clicked_in_session).toBe(true);
      expect(ed?.review_click_count_in_session).toBe(2);
      expect(ed?.sections_viewed_count_in_session).toBe(3);
      expect(ed?.sections_viewed_in_session).toEqual(["hero", "basic_info", "lineup"]);

      result.current.trackFavoriteToggled("PF1", true, "detail");
      const fav = logSpy.mock.calls.find(
        (c) =>
          (c[1] as Record<string, unknown> | undefined)?.event_type === EVENT_TYPES.FAVORITE_TOGGLED,
      );
      expect(fav).toBeDefined();
      logSpy.mockRestore();
    });
  });
});
