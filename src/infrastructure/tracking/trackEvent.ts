"use client";

import type { EventType } from "./constants";
import {
  getOrCreateAnonymousId,
  getOrCreateSessionId,
  getDeviceType,
} from "./trackingUtils";
import { API_BASE_URL } from "@/infrastructure/config/env";

const __DEV__ = process.env.NODE_ENV !== "production";
const EVENTS_URL = `${API_BASE_URL}/api/events`;

function buildPayload(
  eventType: EventType,
  eventData: Record<string, unknown>,
  pageUrlOverride?: string,
) {
  return {
    id: crypto.randomUUID(),
    anonymous_id: getOrCreateAnonymousId(),
    session_id: getOrCreateSessionId(),
    event_type: eventType,
    event_data: eventData,
    page_url: pageUrlOverride ?? window.location.pathname,
    device_type: getDeviceType(),
  };
}

export function trackEvent(
  eventType: EventType,
  eventData: Record<string, unknown>,
  pageUrlOverride?: string,
): void {
  const payload = buildPayload(eventType, eventData, pageUrlOverride);
  if (__DEV__) console.log("[TrackEvent]", payload);
  fetch(EVENTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch((err) => console.error("[TrackEvent] fetch failed:", err));
}

export function sendBeaconEvent(
  eventType: EventType,
  eventData: Record<string, unknown>,
  pageUrlOverride?: string,
): void {
  const payload = buildPayload(eventType, eventData, pageUrlOverride);
  if (__DEV__) console.log("[TrackEvent:beacon]", payload);
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  if (typeof navigator !== "undefined" && navigator.sendBeacon?.(EVENTS_URL, blob)) return;
  fetch(EVENTS_URL, {
    method: "POST",
    body: blob,
    keepalive: true,
  }).catch((err) => console.error("[TrackEvent:beacon] fetch failed:", err));
}
