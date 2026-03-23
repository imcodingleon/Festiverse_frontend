import { vi } from "vitest";
import {
  resetSearchPageState,
  resetDetailPageState,
  resetIsFilteredSession,
} from "../trackingState";

export function clearTrackingStorage(): void {
  localStorage.clear();
  sessionStorage.clear();
}

export function resetTrackingModules(): void {
  resetIsFilteredSession();
  resetSearchPageState();
  resetDetailPageState("test-reset");
}

export function getLastConsolePayload(
  mockLog: ReturnType<typeof vi.spyOn>,
  label: "[TrackEvent]" | "[TrackEvent:beacon]",
): Record<string, unknown> | undefined {
  const calls = mockLog.mock.calls;
  for (let i = calls.length - 1; i >= 0; i--) {
    const c = calls[i];
    if (c[0] === label && typeof c[1] === "object" && c[1] !== null) {
      return c[1] as Record<string, unknown>;
    }
  }
  return undefined;
}
