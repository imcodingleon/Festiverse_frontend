/**
 * E2E 이벤트 트래킹 정합성 테스트
 *
 * 실제 브라우저에서 사용자 시나리오를 수행하고:
 * 1. FE가 올바른 이벤트를 POST /api/events로 전송하는지 검증
 * 2. BE 대시보드 API가 올바른 지표를 산출하는지 검증
 *
 * 사전 조건:
 * - BE 서버 실행 중 (port 8000)
 * - FE 서버 실행 중 (port 4000)
 * - MySQL Docker 실행 중
 */
import { test, expect, type Page, type Request } from "@playwright/test";

const BE_URL = "http://localhost:8000";

// ---- 헬퍼 ----

interface CapturedEvent {
  event_type: string;
  event_data: Record<string, unknown>;
  session_id: string;
  anonymous_id: string;
  page_url: string;
  device_type: string;
}

/** POST /api/events 요청을 가로채서 수집 */
function captureEvents(page: Page): CapturedEvent[] {
  const events: CapturedEvent[] = [];

  page.on("request", (req: Request) => {
    if (req.method() === "POST" && req.url().includes("/api/events")) {
      try {
        const body = req.postDataJSON();
        if (body && body.event_type) {
          events.push(body as CapturedEvent);
        }
      } catch {
        // sendBeacon은 postDataJSON 불가 — 무시
      }
    }
  });

  return events;
}

/** 대시보드 API 직접 호출 */
async function getDashboard(
  viewName: string,
  dateFrom: string,
  dateTo: string,
): Promise<{ rows: Record<string, unknown>[]; total: number }> {
  const res = await fetch(
    `${BE_URL}/api/dashboard/${viewName}?date_from=${dateFrom}&date_to=${dateTo}`,
  );
  return res.json();
}

/** 오늘 날짜 (YYYY-MM-DD) */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---- 테스트 시작 전: 오늘 날짜 기존 데이터 정리 ----

test.beforeAll(async () => {
  // 오늘 날짜의 e2e 세션 데이터만 삭제 (다른 데이터에 영향 없음)
  const res = await fetch(`${BE_URL}/api/events`, { method: "HEAD" }).catch(
    () => null,
  );
  if (!res) {
    throw new Error("BE 서버(port 8000)에 연결할 수 없습니다. 먼저 실행해주세요.");
  }
});

// ============================================================
// 테스트 1: 탐색 페이지 이벤트 트래킹 검증
// ============================================================

test.describe("탐색 페이지 이벤트 트래킹", () => {
  test("페이지 진입 시 app_session_started + search_page_entered 발화", async ({
    page,
  }) => {
    const events = captureEvents(page);

    await page.goto("/");
    await page.waitForTimeout(2000);

    const sessionStarted = events.find(
      (e) => e.event_type === "app_session_started",
    );
    const searchEntered = events.find(
      (e) => e.event_type === "search_page_entered",
    );

    expect(sessionStarted).toBeTruthy();
    expect(sessionStarted!.event_data).toHaveProperty("is_return_user");
    expect(sessionStarted!.anonymous_id).toBeTruthy();
    expect(sessionStarted!.session_id).toBeTruthy();

    expect(searchEntered).toBeTruthy();
  });

  test("필터 선택 + 적용 이벤트 발화", async ({ page }) => {
    const events = captureEvents(page);

    await page.goto("/");
    await page.waitForTimeout(1500);

    // 지역 필터 선택 (데스크톱 사이드바)
    const regionChip = page.locator("aside button", { hasText: "서울" });
    await regionChip.click();
    await page.waitForTimeout(500);

    // 필터 적용 버튼 클릭
    const applyBtn = page.locator("aside button", { hasText: "필터 적용하기" });
    await applyBtn.click();
    await page.waitForTimeout(1000);

    const filterToggled = events.find(
      (e) => e.event_type === "filter_option_toggled",
    );
    expect(filterToggled).toBeTruthy();
    expect(filterToggled!.event_data.filter_type).toBe("region");
    expect(filterToggled!.event_data.filter_value).toBeTruthy();

    const filterApplied = events.find(
      (e) => e.event_type === "filter_apply_button_clicked",
    );
    expect(filterApplied).toBeTruthy();
    expect(filterApplied!.event_data).toHaveProperty("applied_filters");
    expect(filterApplied!.event_data).toHaveProperty("filter_count");
    expect(filterApplied!.event_data).toHaveProperty(
      "time_since_page_entered_ms",
    );
  });

  test("페스티벌 카드 클릭 → festival_item_clicked 발화", async ({ page }) => {
    const events = captureEvents(page);

    await page.goto("/");
    // 페스티벌 목록 로드 대기
    await page.waitForSelector('a[href^="/performance/"]', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // 첫 번째 페스티벌 카드 클릭
    const firstCard = page.locator('a[href^="/performance/"]').first();
    const href = await firstCard.getAttribute("href");
    await firstCard.click();

    // 상세 페이지 로드 대기
    await page.waitForURL(/\/performance\//);
    await page.waitForTimeout(1500);

    const itemClicked = events.find(
      (e) => e.event_type === "festival_item_clicked",
    );
    expect(itemClicked).toBeTruthy();
    expect(itemClicked!.event_data).toHaveProperty("festival_id");
    expect(itemClicked!.event_data).toHaveProperty("festival_name");
    expect(itemClicked!.event_data).toHaveProperty("list_position");
    expect(itemClicked!.event_data).toHaveProperty("time_since_page_entered_ms");
  });
});

// ============================================================
// 테스트 2: 상세 페이지 이벤트 트래킹 검증
// ============================================================

test.describe("상세 페이지 이벤트 트래킹", () => {
  test("상세 진입 시 detail_page_entered + section_viewed 발화", async ({
    page,
  }) => {
    const events = captureEvents(page);

    // 탐색 → 상세 이동
    await page.goto("/");
    await page.waitForSelector('a[href^="/performance/"]', { timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.locator('a[href^="/performance/"]').first().click();
    await page.waitForURL(/\/performance\//);
    await page.waitForTimeout(3000);

    const detailEntered = events.find(
      (e) => e.event_type === "detail_page_entered",
    );
    expect(detailEntered).toBeTruthy();
    expect(detailEntered!.event_data).toHaveProperty("festival_id");
    expect(detailEntered!.event_data).toHaveProperty("festival_name");

    // IntersectionObserver로 자동 발화되는 section_viewed
    const sectionViews = events.filter(
      (e) => e.event_type === "section_viewed",
    );
    expect(sectionViews.length).toBeGreaterThan(0);

    // hero 섹션은 최소한 보여야 함
    const heroView = sectionViews.find(
      (e) => e.event_data.section_name === "hero",
    );
    expect(heroView).toBeTruthy();
  });

  test("블로그 리뷰 클릭 → blog_review_clicked 발화", async ({ page }) => {
    const events = captureEvents(page);

    await page.goto("/");
    await page.waitForSelector('a[href^="/performance/"]', { timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.locator('a[href^="/performance/"]').first().click();
    await page.waitForURL(/\/performance\//);
    await page.waitForTimeout(2000);

    // 블로그 리뷰 섹션까지 스크롤
    const blogSection = page.locator('[data-trackSection="blog_review"]');
    if (await blogSection.isVisible()) {
      await blogSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500);

      // 블로그 리뷰 아이템 클릭 (새 탭 방지)
      const reviewLink = page.locator('a[target="_blank"]').first();
      if (await reviewLink.isVisible()) {
        // 새 탭 열림 방지 — 클릭 이벤트만 발생시킴
        await reviewLink.evaluate((el: HTMLAnchorElement) => {
          el.removeAttribute("target");
          el.addEventListener("click", (e) => e.preventDefault(), {
            once: true,
          });
        });
        await reviewLink.click();
        await page.waitForTimeout(1000);

        const blogClicked = events.find(
          (e) => e.event_type === "blog_review_clicked",
        );
        expect(blogClicked).toBeTruthy();
        expect(blogClicked!.event_data).toHaveProperty("review_index");
        expect(blogClicked!.event_data).toHaveProperty("review_title");
        expect(blogClicked!.event_data).toHaveProperty("review_url");
      }
    }
  });

  test("티켓 예매 버튼 클릭 → ticket_button_clicked 발화", async ({ page }) => {
    const events = captureEvents(page);

    await page.goto("/");
    await page.waitForSelector('a[href^="/performance/"]', { timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.locator('a[href^="/performance/"]').first().click();
    await page.waitForURL(/\/performance\//);
    await page.waitForTimeout(2000);

    // 티켓 섹션까지 스크롤
    const ticketSection = page.locator('[data-trackSection="ticket_booking"]');
    if (await ticketSection.isVisible()) {
      await ticketSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);

      const ticketBtn = page.locator('a:has-text("예매하기")').first();
      if (await ticketBtn.isVisible()) {
        // 새 탭 방지
        await ticketBtn.evaluate((el: HTMLAnchorElement) => {
          el.removeAttribute("target");
          el.addEventListener("click", (e) => e.preventDefault(), {
            once: true,
          });
        });
        await ticketBtn.click();
        await page.waitForTimeout(1000);

        const ticketClicked = events.find(
          (e) => e.event_type === "ticket_button_clicked",
        );
        expect(ticketClicked).toBeTruthy();
        expect(ticketClicked!.event_data).toHaveProperty("festival_id");
        expect(ticketClicked!.event_data).toHaveProperty("ticket_provider");
        expect(ticketClicked!.event_data).toHaveProperty(
          "review_clicked_in_session",
        );
        expect(ticketClicked!.event_data).toHaveProperty(
          "sections_viewed_in_session",
        );
      }
    }
  });
});

// ============================================================
// 테스트 3: 풀 퍼널 시나리오 → 대시보드 지표 정합성
// ============================================================

test.describe("풀 퍼널 → 대시보드 정합성", () => {
  test("필터→상세→스크롤→티켓 시나리오 후 대시보드 지표 검증", async ({
    page,
  }) => {
    const events = captureEvents(page);
    const d = today();

    // ---- Step 1: 탐색 페이지 ----
    await page.goto("/");
    await page.waitForSelector('a[href^="/performance/"]', { timeout: 10000 });
    await page.waitForTimeout(1500);

    // 지역 필터 선택 + 적용
    const regionChip = page.locator("aside button", { hasText: "서울" });
    if (await regionChip.isVisible()) {
      await regionChip.click();
      await page.waitForTimeout(300);
      await page.locator("aside button", { hasText: "필터 적용하기" }).click();
      await page.waitForTimeout(1500);
    }

    // ---- Step 2: 페스티벌 카드 클릭 ----
    await page.waitForSelector('a[href^="/performance/"]', { timeout: 10000 });
    const firstCard = page.locator('a[href^="/performance/"]').first();
    await firstCard.click();
    await page.waitForURL(/\/performance\//);
    await page.waitForTimeout(3000);

    // ---- Step 3: 섹션 스크롤 ----
    for (const section of ["basic_info", "ticket_booking", "blog_review"]) {
      const sectionEl = page.locator(`[data-trackSection="${section}"]`);
      if (await sectionEl.isVisible()) {
        await sectionEl.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
      }
    }

    // ---- Step 4: 티켓 클릭 (있으면) ----
    const ticketBtn = page.locator('a:has-text("예매하기")').first();
    if (await ticketBtn.isVisible().catch(() => false)) {
      await ticketBtn.evaluate((el: HTMLAnchorElement) => {
        el.removeAttribute("target");
        el.addEventListener("click", (e) => e.preventDefault(), {
          once: true,
        });
      });
      await ticketBtn.click();
      await page.waitForTimeout(1000);
    }

    // ---- Step 5: 수집된 이벤트 타입 검증 ----
    await page.waitForTimeout(2000);
    const eventTypes = events.map((e) => e.event_type);

    expect(eventTypes).toContain("app_session_started");
    expect(eventTypes).toContain("search_page_entered");
    expect(eventTypes).toContain("festival_item_clicked");
    expect(eventTypes).toContain("detail_page_entered");
    expect(eventTypes).toContain("section_viewed");

    // 모든 이벤트가 동일한 session_id를 가져야 함
    const sessionIds = new Set(events.map((e) => e.session_id));
    expect(sessionIds.size).toBe(1);

    // 모든 이벤트가 동일한 anonymous_id를 가져야 함
    const anonIds = new Set(events.map((e) => e.anonymous_id));
    expect(anonIds.size).toBe(1);

    // ---- Step 6: 대시보드 API 검증 ----
    const pvData = await getDashboard("v_p1_pv", d, d);
    expect(pvData.total).toBeGreaterThanOrEqual(1);
    expect(pvData.rows[0].pv).toBeGreaterThanOrEqual(1);

    const dcrData = await getDashboard("v_p1_dcr", d, d);
    expect(dcrData.total).toBeGreaterThanOrEqual(1);
    // DCR > 0 — 우리가 상세까지 갔으므로
    expect(Number(dcrData.rows[0].dcr)).toBeGreaterThan(0);
  });
});

// ============================================================
// 테스트 4: 이벤트 페이로드 스키마 검증
// ============================================================

test.describe("이벤트 페이로드 스키마 검증", () => {
  test("모든 이벤트에 필수 필드가 포함되어야 함", async ({ page }) => {
    const events = captureEvents(page);

    await page.goto("/");
    await page.waitForSelector('a[href^="/performance/"]', { timeout: 10000 });
    await page.waitForTimeout(1500);

    // 상세 페이지로 이동
    await page.locator('a[href^="/performance/"]').first().click();
    await page.waitForURL(/\/performance\//);
    await page.waitForTimeout(3000);

    // 최소 3개 이상의 이벤트가 수집되어야 함
    expect(events.length).toBeGreaterThanOrEqual(3);

    // 모든 이벤트의 필수 필드 검증
    for (const ev of events) {
      expect(ev.id).toBeTruthy();
      expect(ev.anonymous_id).toBeTruthy();
      expect(ev.session_id).toBeTruthy();
      expect(ev.event_type).toBeTruthy();
      expect(ev.page_url).toBeTruthy();
      expect(["mobile", "desktop"]).toContain(ev.device_type);
    }
  });
});
