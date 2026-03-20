"use client";

import { useEffect } from "react";
import { useAtomValue, useStore } from "jotai";
import { filterAtom, performanceListAtom } from "../atoms/performanceAtoms";
import { loadPerformanceList } from "../commands/performanceCommands";

export function usePerformanceList() {
  const store = useStore();
  const filters = useAtomValue(filterAtom);
  const listState = useAtomValue(performanceListAtom);

  useEffect(() => {
    loadPerformanceList(store.set, filters);
  }, [store, filters]);

  return listState;
}
