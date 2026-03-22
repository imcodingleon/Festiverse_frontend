import { describe, it, expect, beforeEach, vi } from "vitest";
import { trackEvent, sendBeaconEvent } from "../trackEvent";
import { EVENT_TYPES } from "../constants";
import { clearTrackingStorage, resetTrackingModules } from "./testUtils";

describe("검증 6 — trackEvent / sendBeaconEvent", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    clearTrackingStorage();
    resetTrackingModules();
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    logSpy.mockClear();
  });

  it("trackEvent: payload에 id, anonymous_id, session_id, event_type, event_data, page_url, device_type 포함", () => {
    trackEvent(EVENT_TYPES.SEARCH_QUERY_SUBMITTED, { query_text: "a", results_count: 1, source: "header" });
    const payload = logSpy.mock.calls.find((c) => c[0] === "[TrackEvent]")?.[1] as Record<
      string,
      unknown
    >;
    expect(payload).toBeDefined();
    expect(payload?.event_type).toBe(EVENT_TYPES.SEARCH_QUERY_SUBMITTED);
    expect(typeof payload?.id).toBe("string");
    expect(typeof payload?.anonymous_id).toBe("string");
    expect(typeof payload?.session_id).toBe("string");
    expect(payload?.event_data).toEqual({
      query_text: "a",
      results_count: 1,
      source: "header",
    });
    expect(typeof payload?.page_url).toBe("string");
    expect((payload?.page_url as string).length).toBeGreaterThan(0);
    expect(["mobile", "desktop"]).toContain(payload?.device_type);
  });

  it("trackEvent: 세 번째 인자 pageUrlOverride 시 page_url 오버라이드 (구현은 string 인자)", () => {
    trackEvent(EVENT_TYPES.SORT_CHANGED, { sort_value: "a", previous_sort_value: "b" }, "/custom");
    const payload = logSpy.mock.calls.find((c) => c[0] === "[TrackEvent]")?.[1] as Record<
      string,
      unknown
    >;
    expect(payload?.page_url).toBe("/custom");
  });

  it("sendBeaconEvent: console에 동일 형태 + page_url override", () => {
    sendBeaconEvent(EVENT_TYPES.SEARCH_PAGE_EXITED, { time_on_page_ms: 100 }, "/");
    const payload = logSpy.mock.calls.find((c) => c[0] === "[TrackEvent:beacon]")?.[1] as Record<
      string,
      unknown
    >;
    expect(payload?.event_type).toBe(EVENT_TYPES.SEARCH_PAGE_EXITED);
    expect(payload?.page_url).toBe("/");
    expect(payload?.event_data).toEqual({ time_on_page_ms: 100 });
  });
});
