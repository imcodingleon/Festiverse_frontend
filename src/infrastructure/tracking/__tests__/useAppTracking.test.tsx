import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAppTracking, trackFavoriteToggled } from "../useAppTracking";
import { EVENT_TYPES } from "../constants";
import { clearTrackingStorage, resetTrackingModules } from "./testUtils";

describe("검증 2 — useAppTracking", () => {
  beforeEach(() => {
    clearTrackingStorage();
    resetTrackingModules();
  });

  it("app_session_started: 마운트 1회 + is_return_user, days_since_last_visit, referrer", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    renderHook(() => useAppTracking());
    await waitFor(() => {
      const payload = logSpy.mock.calls.find((c) => c[0] === "[TrackEvent]")?.[1] as Record<
        string,
        unknown
      >;
      expect(payload?.event_type).toBe(EVENT_TYPES.APP_SESSION_STARTED);
      const ed = payload?.event_data as Record<string, unknown>;
      expect(typeof ed?.is_return_user).toBe("boolean");
      expect(ed?.days_since_last_visit === null || typeof ed?.days_since_last_visit === "number").toBe(
        true,
      );
      expect(ed?.referrer === null || typeof ed?.referrer === "string").toBe(true);
    });
    logSpy.mockRestore();
  });

  it("app_session_started 이후 updateLastVisitDate로 localStorage 갱신", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    renderHook(() => useAppTracking());
    await waitFor(() => {
      expect(localStorage.getItem("festiverse_last_visit_date")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it("favorite_toggled: festival_id + is_favorited + source", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    logSpy.mockClear();
    trackFavoriteToggled("PF1", true, "search");
    const payload = logSpy.mock.calls.filter((c) => c[0] === "[TrackEvent]").at(-1)?.[1] as Record<
      string,
      unknown
    >;
    expect(payload?.event_type).toBe(EVENT_TYPES.FAVORITE_TOGGLED);
    expect(payload?.event_data).toEqual({
      festival_id: "PF1",
      is_favorited: true,
      source: "search",
    });
    logSpy.mockRestore();
  });
});
