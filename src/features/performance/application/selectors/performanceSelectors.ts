import { atom } from "jotai";
import { performanceListAtom, performanceDetailAtom } from "../atoms/performanceAtoms";

export const isListLoadingAtom = atom(
  (get) => get(performanceListAtom).status === "LOADING",
);

export const performanceListDataAtom = atom((get) => {
  const state = get(performanceListAtom);
  return state.status === "LOADED" ? state.data : [];
});

export const isDetailLoadingAtom = atom(
  (get) => get(performanceDetailAtom).status === "LOADING",
);

export const performanceDetailDataAtom = atom((get) => {
  const state = get(performanceDetailAtom);
  return state.status === "LOADED" ? state.data : null;
});
