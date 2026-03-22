import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

/** IntersectionObserver: observe 시 다음 마이크로태스크에서 교차 콜백 실행 (section_viewed 테스트용) */
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {}
  observe = vi.fn((el: Element) => {
    queueMicrotask(() => {
      this.callback(
        [
          {
            isIntersecting: true,
            target: el,
            intersectionRatio: 1,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          } as IntersectionObserverEntry,
        ],
        this,
      );
    });
  });
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = (): IntersectionObserverEntry[] => [];
}

globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;
