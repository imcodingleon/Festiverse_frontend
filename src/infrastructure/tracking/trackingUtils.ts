"use client";

import { resetIsFilteredSession } from "./trackingState";

const ANON_ID_KEY = "festiverse_anon_id";
const SESSION_ID_KEY = "festiverse_session_id";
const LAST_ACTIVITY_KEY = "festiverse_last_activity";
const LAST_VISIT_DATE_KEY = "festiverse_last_visit_date";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  const now = Date.now();
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  const existingSessionId = sessionStorage.getItem(SESSION_ID_KEY);

  const isTimedOut =
    !!lastActivity && now - Number(lastActivity) > SESSION_TIMEOUT_MS;

  // 최초 세션 생성: isFilteredSession 유지 (같은 핸들러에서 mark 후 trackEvent 시 덮어쓰지 않음)
  if (!existingSessionId) {
    const newId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, newId);
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    return newId;
  }

  if (isTimedOut) {
    const newId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, newId);
    resetIsFilteredSession();
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    return newId;
  }

  localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
  return existingSessionId;
}

export function getDeviceType(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  return window.innerWidth < 1024 ? "mobile" : "desktop";
}

export function getReturnVisitInfo(): {
  is_return_user: boolean;
  days_since_last_visit: number | null;
} {
  if (typeof window === "undefined") {
    return { is_return_user: false, days_since_last_visit: null };
  }

  const lastVisitStr = localStorage.getItem(LAST_VISIT_DATE_KEY);
  if (!lastVisitStr) {
    return { is_return_user: false, days_since_last_visit: null };
  }

  const lastVisit = new Date(lastVisitStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastVisit.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - lastVisit.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return {
    is_return_user: true,
    days_since_last_visit: diffDays,
  };
}

export function updateLastVisitDate(): void {
  if (typeof window === "undefined") return;
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  localStorage.setItem(LAST_VISIT_DATE_KEY, dateStr);
}
