"use client";

import { useEffect, useRef, useCallback } from "react";
import { EVENT_TYPES, SECTION_INDEX, type SectionName } from "./constants";
import { trackEvent, sendBeaconEvent } from "./trackEvent";
import { trackFavoriteToggled } from "./useAppTracking";
import {
  resetDetailPageState,
  setDetailFestivalName,
  getCurrentDetailFestivalId,
  getCurrentDetailFestivalName,
  getDetailTimeOnPage,
  getTimeSinceDetailPageEntered,
  pauseDetailTimer,
  resumeDetailTimer,
  isDetailExitSent,
  markDetailExitSent,
  resetDetailExitSent,
  getSectionsViewedList,
  getSectionsViewed,
  addSectionViewed,
  getReviewClicked,
  getReviewClickCount,
  markReviewClicked,
} from "./trackingState";

function buildDetailExitData() {
  const viewedList = getSectionsViewedList();
  return {
    festival_id: getCurrentDetailFestivalId(),
    time_on_page_ms: getDetailTimeOnPage(),
    last_section_viewed: viewedList[viewedList.length - 1] ?? null,
    sections_viewed_list: viewedList,
    sections_viewed_count: viewedList.length,
  };
}

export function useDetailPageLifecycle(id: string, festivalName?: string) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  /** ref 콜백이 useEffect(observer 생성)보다 먼저 실행되므로, 노드를 모아두었다가 observer 준비 후 observe */
  const sectionNodesRef = useRef(new Set<HTMLElement>());
  const festivalNameRef = useRef(festivalName);

  useEffect(() => {
    festivalNameRef.current = festivalName;
    if (festivalName) {
      setDetailFestivalName(festivalName);
    }
  }, [festivalName]);

  useEffect(() => {
    const capturedPath = window.location.pathname;
    resetDetailPageState(id);
    trackEvent(EVENT_TYPES.DETAIL_PAGE_ENTERED, {
      festival_id: id,
      festival_name: festivalNameRef.current ?? "",
    }, capturedPath);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const sectionName = el.dataset.trackSection;
          const sectionIndex = el.dataset.trackIndex;
          const isRendered = el.dataset.trackRendered !== "false";
          if (!sectionName) continue;

          const isNew = addSectionViewed(sectionName);
          if (isNew) {
            trackEvent(EVENT_TYPES.SECTION_VIEWED, {
              festival_id: getCurrentDetailFestivalId(),
              section_name: sectionName,
              section_index: sectionIndex ? Number(sectionIndex) : 0,
              time_since_page_entered_ms: getTimeSinceDetailPageEntered(),
              is_section_rendered: isRendered,
            });
          }
        }
      },
      { threshold: 0.5 },
    );

    sectionNodesRef.current.forEach((node) => {
      observerRef.current?.observe(node);
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (!isDetailExitSent()) {
          pauseDetailTimer();
          sendBeaconEvent(EVENT_TYPES.DETAIL_PAGE_EXITED, buildDetailExitData(), capturedPath);
          markDetailExitSent();
        }
      } else {
        resumeDetailTimer();
        resetDetailExitSent();
      }
    };

    const handlePageHide = () => {
      if (!isDetailExitSent()) {
        sendBeaconEvent(EVENT_TYPES.DETAIL_PAGE_EXITED, buildDetailExitData(), capturedPath);
        markDetailExitSent();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      observerRef.current?.disconnect();
      observerRef.current = null;
      sectionNodesRef.current.clear();

      if (!isDetailExitSent()) {
        sendBeaconEvent(EVENT_TYPES.DETAIL_PAGE_EXITED, buildDetailExitData(), capturedPath);
      }
    };
  }, [id]);

  const createSectionRef = useCallback(
    (sectionName: SectionName, isRendered = true) => {
      return (node: HTMLElement | null) => {
        if (!node) return;
        node.dataset.trackSection = sectionName;
        node.dataset.trackIndex = String(SECTION_INDEX[sectionName]);
        node.dataset.trackRendered = String(isRendered);
        sectionNodesRef.current.add(node);
        observerRef.current?.observe(node);
      };
    },
    [],
  );

  return { createSectionRef, setDetailFestivalName };
}

export function useDetailPageTracking() {
  const trackBlogReviewClicked = useCallback(
    (
      reviewIndex: number,
      reviewTitle: string,
      reviewUrl: string,
    ) => {
      markReviewClicked();
      trackEvent(EVENT_TYPES.BLOG_REVIEW_CLICKED, {
        festival_id: getCurrentDetailFestivalId(),
        review_index: reviewIndex,
        review_title: reviewTitle,
        review_url: reviewUrl,
        time_since_page_entered_ms: getTimeSinceDetailPageEntered(),
      });
    },
    [],
  );

  const trackShareButtonClicked = useCallback(() => {
    trackEvent(EVENT_TYPES.SHARE_BUTTON_CLICKED, {
      festival_id: getCurrentDetailFestivalId(),
      festival_name: getCurrentDetailFestivalName(),
    });
  }, []);

  const trackTicketButtonClicked = useCallback(
    (ticketProvider: string) => {
      trackEvent(EVENT_TYPES.TICKET_BUTTON_CLICKED, {
        festival_id: getCurrentDetailFestivalId(),
        festival_name: getCurrentDetailFestivalName(),
        ticket_provider: ticketProvider,
        review_clicked_in_session: getReviewClicked(),
        review_click_count_in_session: getReviewClickCount(),
        sections_viewed_in_session: getSectionsViewedList(),
        sections_viewed_count_in_session: getSectionsViewed().size,
        time_since_page_entered_ms: getTimeSinceDetailPageEntered(),
      });
    },
    [],
  );

  return {
    trackBlogReviewClicked,
    trackShareButtonClicked,
    trackTicketButtonClicked,
    trackFavoriteToggled,
  };
}
