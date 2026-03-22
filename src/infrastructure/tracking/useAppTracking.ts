"use client";

import { useEffect, useRef } from "react";
import { EVENT_TYPES } from "./constants";
import { trackEvent } from "./trackEvent";
import { getReturnVisitInfo, updateLastVisitDate } from "./trackingUtils";

export function useAppTracking(): void {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const { is_return_user, days_since_last_visit } = getReturnVisitInfo();

    trackEvent(EVENT_TYPES.APP_SESSION_STARTED, {
      is_return_user,
      days_since_last_visit,
      referrer: document.referrer || null,
    });

    updateLastVisitDate();
  }, []);
}

export function trackFavoriteToggled(
  festivalId: string,
  isFavorited: boolean,
  source: "search" | "detail",
): void {
  trackEvent(EVENT_TYPES.FAVORITE_TOGGLED, {
    festival_id: festivalId,
    is_favorited: isFavorited,
    source,
  });
}
