"use client";

import { useEffect } from "react";
import { useAtomValue, useStore } from "jotai";
import {
  performanceDetailAtom,
  blogReviewsAtom,
  ticketInfoAtom,
} from "../atoms/performanceAtoms";
import { loadPerformanceDetail } from "../commands/performanceCommands";

export function usePerformanceDetail(id: string) {
  const store = useStore();
  const detailState = useAtomValue(performanceDetailAtom);
  const blogState = useAtomValue(blogReviewsAtom);
  const ticketState = useAtomValue(ticketInfoAtom);

  useEffect(() => {
    loadPerformanceDetail(store.set, id);
  }, [store, id]);

  return { detailState, blogState, ticketState };
}
