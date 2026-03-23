### 섹션 1 — 개요

- **서비스명**: 페스티벌스 (Festiverse)
- **퍼널 구조**: **Search**(탐색) → **Detail**(상세) → **Condition Check**(조건 확인) → **Intent**(예매 의사) → **Reuse**(재방문)
- **전환 지점**: P1(탐색→상세), P2(상세 내 정보 소비), P3(상세→예매 의사), P4(예매 의사→재방문)
- **기술 스택**:
    - FE: Next.js 16 (App Router) + React 19 + Jotai + TypeScript
    - BE: FastAPI + SQLAlchemy + MySQL 8.0 (헥사고날 아키텍처)
    - 라우트: `/` (탐색), `/performance/[id]` (상세)
- **이 명세서의 목적**: P1~P4 퍼널 전환율 및 세부 행동 지표를 수집하기 위한 이벤트 트래킹을 FE/BE에 구현한다. FE에서 `trackEvent(eventType, eventData)` 유틸 함수를 통해 이벤트를 발화하고, BE의 `POST /api/events` 엔드포인트를 통해 `event_logs` 테이블에 저장한다.

---

### 섹션 2 — event_logs 테이블 스키마

**DB**: MySQL 8.0 | **테이블명**: `event_logs`

| 컬럼명 | 타입 | 설명 |
| --- | --- | --- |
| `id` | CHAR(36) PK | 고유 식별자 (UUID, 애플리케이션에서 생성) |
| `anonymous_id` | VARCHAR(36) NOT NULL | 비로그인 사용자 식별자 (localStorage 기반) |
| `session_id` | VARCHAR(36) NOT NULL | 세션 식별자 (sessionStorage 기반) |
| `event_type` | VARCHAR(50) NOT NULL | 이벤트 유형 (snake_case) |
| `event_data` | JSON | 이벤트별 추가 데이터 |
| `page_url` | VARCHAR(500) | 이벤트 발생 페이지 경로 (예: `/`, `/performance/PF286798`) |
| `device_type` | VARCHAR(10) NOT NULL | 디바이스 유형 (`mobile` / `desktop`) |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | 이벤트 발생 시각 (서버 기준) |

**인덱스**:

```sql
CREATE INDEX idx_event_type ON event_logs(event_type);
CREATE INDEX idx_session_id ON event_logs(session_id);
CREATE INDEX idx_anonymous_id ON event_logs(anonymous_id);
CREATE INDEX idx_created_at ON event_logs(created_at);
CREATE INDEX idx_event_session ON event_logs(event_type, session_id);
```

**SQLAlchemy ORM 모델 위치** (헥사고날 아키텍처):

`app/domains/event_log/infrastructure/orm/event_log_model.py`

**CREATE TABLE 전문**:

```sql
CREATE TABLE event_logs (
  id CHAR(36) PRIMARY KEY,
  anonymous_id VARCHAR(36) NOT NULL,
  session_id VARCHAR(36) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSON,
  page_url VARCHAR(500),
  device_type VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_type (event_type),
  INDEX idx_session_id (session_id),
  INDEX idx_anonymous_id (anonymous_id),
  INDEX idx_created_at (created_at),
  INDEX idx_event_session (event_type, session_id)
);
```

---

### 섹션 3 — 세션/사용자 식별 규칙

#### anonymous_id (브라우저 단위 식별)

- **생성**: 최초 방문 시 `crypto.randomUUID()`로 생성
- **저장**: `localStorage` (키: `festiverse_anon_id`)
- **수명**: 영구 (사용자가 localStorage를 삭제하지 않는 한 유지)
- **한계**: 시크릿모드·기기 변경·브라우저 변경 시 새 ID 생성

#### session_id (방문 세션 단위 식별)

- **생성**: 탭 열 때 `crypto.randomUUID()`로 생성
- **저장**: `sessionStorage` (키: `festiverse_session_id`)
- **수명**: 탭 닫으면 소멸 (동일 탭 내에서는 페이지 이동해도 유지)
- **세션 타임아웃**: 추가로 30분 미활동 시 새 session_id를 생성한다. `localStorage`에 마지막 이벤트 발생 시각(`festiverse_last_activity`)을 저장하고, 이벤트 발화 시 현재 시각과 비교하여 30분 초과 시 sessionStorage의 session_id를 갱신한다.

#### device_type (디바이스 식별)

- **판별**: 화면 너비 기준 (`window.innerWidth`), 서비스 CSS 브레이크포인트(1024px)와 동일하게 2단계 분류
- **값**: `"mobile"` (width < 1024) | `"desktop"` (width ≥ 1024)
- 모든 이벤트에 자동 첨부 (event_logs 테이블의 `device_type` 컬럼)

#### 재방문 판정용 추가 저장 (P4)

- `localStorage` 키 `festiverse_last_visit_date`: 마지막 방문 날짜 (YYYY-MM-DD)
- 세션 시작 시 현재 날짜와 비교하여 `is_return_user`와 `days_since_last_visit` 산출
- 세션 시작 후 해당 값을 현재 날짜로 갱신

#### FE 유틸 함수 구조 (권장)

```tsx
// src/infrastructure/tracking/trackingUtils.ts
export function getOrCreateAnonymousId(): string { /* localStorage */ }
export function getOrCreateSessionId(): string { /* sessionStorage + 30분 타임아웃 */ }
export function getDeviceType(): 'mobile' | 'desktop' { /* innerWidth < 1024 → mobile, ≥ 1024 → desktop */ }

// src/infrastructure/tracking/trackEvent.ts
export function trackEvent(eventType: string, eventData: Record<string, unknown>): void {
  const payload = {
    id: crypto.randomUUID(),
    anonymous_id: getOrCreateAnonymousId(),
    session_id: getOrCreateSessionId(),
    event_type: eventType,
    event_data: eventData,
    page_url: window.location.pathname,
    device_type: getDeviceType(),
  };
  console.log('[TrackEvent]', payload); // Phase 1: 로그 확인
  // Phase 2: fetch('POST /api/events', { body: JSON.stringify(payload) })
}
```

---

### 섹션 4 — 퍼널별 이벤트 정의

**이벤트 총 16종**: 공통 2 + P1 9 + P2 5 + P3 1 (P4는 app_session_started 재활용)

<aside>
⚠️

**FE 세션 레벨 상태 관리 필수**: 일부 이벤트의 event_data에는 세션 내 누적 정보가 포함된다 (예: `sections_viewed_in_session`, `review_clicked_in_session`, `is_filtered_session`). 이를 위해 FE에서 `useRef`로 세션 레벨 상태를 관리해야 한다.

- `sectionsViewedRef` — 상세 페이지에서 본 섹션 Set (상세 페이지 마운트 시 초기화)
- `reviewClickedRef` — 블로그 리뷰 클릭 여부 boolean (상세 페이지 마운트 시 초기화)
- `reviewClickCountRef` — 블로그 리뷰 클릭 횟수 number (상세 페이지 마운트 시 초기화)
- `pageEnteredAtRef` — 페이지 진입 시각 [Date.now](http://Date.now)() (각 페이지 마운트 시 초기화)
- `isFilteredSessionRef` — 탐색 페이지에서 filter_apply_button_clicked 1회 이상 발생 여부 boolean (세션 시작 시 false, filter_apply_button_clicked 발화 시 true 설정. festival_item_clicked의 is_filtered_session 값으로 사용)
</aside>

<aside>
⏱️

**time_since_page_entered_ms 계산 패턴**: 페이지 진입 시점을 `useRef<number>(Date.now())`로 저장하고, 이벤트 발화 시 `Date.now() - pageEnteredAtRef.current`로 계산한다.

</aside>

---

#### 4-0. 공통 이벤트 (2종)

#### app_session_started

- **퍼널 단계**: 공통 (P4 재방문 판정에 핵심 사용)
- **트리거**: 앱 최초 로드 시 1회 발화 (Provider 또는 루트 레이아웃의 useEffect)
- **event_data**:

```json
{
  "is_return_user": true,
  "days_since_last_visit": 3,
  "referrer": "https://example.com"
}
```

- `is_return_user` (boolean) — localStorage `festiverse_last_visit_date` 존재 여부
- `days_since_last_visit` (number | null) — 마지막 방문 이후 경과 일수. 첫 방문이면 null
- `referrer` (string | null) — `document.referrer` 값
- **연결 지표**: P4 전환율 ReuseUsers broad 분자 (anchor_time 이후 14일 내 새 세션 판정), 재방문 세그먼트 분석
- **FE 구현 위치**: `src/app/providers.tsx` 또는 루트 레이아웃의 useEffect

#### favorite_toggled

- **퍼널 단계**: 공통 (탐색 + 상세 페이지)
- **트리거**: 탐색 페이지 카드 또는 상세 페이지 상단의 하트 아이콘 클릭 시
- **event_data**:

```json
{
  "festival_id": "PF286798",
  "is_favorited": true,
  "source": "search"
}
```

- `festival_id` (string) — 페스티벌 고유 ID (KOPIS mt20id)
- `is_favorited` (boolean) — 클릭 후 상태 (true=즐겨찾기 추가, false=해제)
- `source` (string) — `"search"` | `"detail"` — 발생 페이지
- **연결 지표**: 관심 신호 분석 (추가 분석용)
- **FE 구현 위치**: 탐색 — `PerformanceCard` 내 하트 아이콘 / 상세 — `DetailHeader` 내 하트 아이콘

---

#### 4-1. P1 — 탐색 페이지 이벤트 (9종)

#### search_page_entered

- **퍼널 단계**: P1
- **트리거**: 탐색 페이지(`/`) 컴포넌트 마운트 시 발화. 상세→탐색 복귀 시에도 재발화
- **event_data**:

```json
{}
```

- (추가 데이터 없음. 공통 컬럼만으로 충분)
- **연결 지표**: PV(분모), FSR·FAR·DCR·SUR·SCR·RER(공통 분모), TFT·TFA·TTD(시작 시점 기준), Time on page(시작 시점)
- **FE 구현 위치**: `src/app/page.tsx` (HomePage)
- **주의**: App Router의 클라이언트 캐시로 `router.back()` 시 컴포넌트가 리마운트되지 않을 수 있음. `usePathname()` 변경 감지 방식 권장

#### search_page_exited

- **퍼널 단계**: P1
- **트리거**: 탐색 페이지에서 이탈 시 (다른 페이지 이동, 탭 닫기, 브라우저 백그라운드)
- **event_data**:

```json
{
  "time_on_page_ms": 45000
}
```

- `time_on_page_ms` (number) — 탐색 페이지 누적 체류시간(ms). search_page_entered 시점부터 계산
- **연결 지표**: Time on page(값)
- **FE 구현 위치**: `src/app/page.tsx` — `useEffect` cleanup + `visibilitychange` 이벤트 리스너
- **주의**: 탭 닫기/백그라운드 전환 시 일반 fetch가 취소될 수 있으므로, `navigator.sendBeacon()` 또는 `keepalive: true` 옵션 사용

#### filter_option_toggled

- **퍼널 단계**: P1
- **트리거**: 탐색 페이지 "공연 필터" 영역에서 지역/장르 칩 클릭(선택 또는 해제) 시
- **event_data**:

```json
{
  "filter_type": "region",
  "filter_value": "서울",
  "is_selected": true,
  "time_since_page_entered_ms": 3200
}
```

- `filter_type` (string) — `"region"` | `"genre"`
- `filter_value` (string) — 선택/해제된 옵션명 (예: "서울", "EDM")
- `is_selected` (boolean) — 클릭 후 상태 (true=선택, false=해제)
- `time_since_page_entered_ms` (number) — search_page_entered 이후 경과 시간(ms)
- **연결 지표**: FSR(분자 — 세션 내 1회 이상 발생 시 해당 세션 카운트), TFT(세션 내 첫 발화의 time_since_page_entered_ms)
- **FE 구현 위치**: `FilterSection.tsx` — 지역/장르 칩 클릭 핸들러

#### filter_apply_button_clicked

- **퍼널 단계**: P1
- **트리거**: "필터 적용하기" 버튼 클릭 시
- **event_data**:

```json
{
  "applied_filters": {
    "region": ["서울", "경기"],
    "genre": ["EDM"]
  },
  "filter_count": 3,
  "time_since_page_entered_ms": 8500
}
```

- `applied_filters` (object) — 적용된 필터 옵션. `region` (string[]), `genre` (string[])
- `filter_count` (number) — 총 선택 옵션 수 (region + genre 합산)
- `time_since_page_entered_ms` (number) — search_page_entered 이후 경과 시간(ms)
- **연결 지표**: FAR(분자), AFA(세션당 카운트), FUC(카운트 일부 — 태그 필터), TFA(세션 내 첫 발화의 time_since_page_entered_ms)
- **FE 구현 위치**: `FilterSection.tsx` 25~31행 `handleApply` 함수 내부

#### calendar_date_clicked

- **퍼널 단계**: P1
- **트리거**: 좌측 캘린더 UI에서 날짜 셀 클릭 시 (즉시 반영, 적용 버튼 없음)
- **event_data**:

```json
{
  "selected_date": "2026-03-21",
  "calendar_year": 2026,
  "calendar_month": 3
}
```

- `selected_date` (string) — 선택된 날짜 (YYYY-MM-DD)
- `calendar_year` (number) — 캘린더 표시 연도
- `calendar_month` (number) — 캘린더 표시 월
- **연결 지표**: FUC(카운트 일부 — 캘린더 일자 클릭)
- **FE 구현 위치**: `StreakCalendar` 컴포넌트의 `onSelectDate` 콜백

#### calendar_period_navigated

- **퍼널 단계**: P1
- **트리거**: 캘린더 < > 화살표 클릭으로 월 이동 시
- **event_data**:

```json
{
  "direction": "next",
  "from_year_month": "2026-03",
  "to_year_month": "2026-04"
}
```

- `direction` (string) — `"next"` | `"prev"`
- `from_year_month` (string) — 이동 전 연월 (YYYY-MM)
- `to_year_month` (string) — 이동 후 연월 (YYYY-MM)
- **연결 지표**: FUC(카운트 일부 — 캘린더 월 이동)
- **FE 구현 위치**: `StreakCalendar` 컴포넌트의 `onMonthChange` 콜백

#### festival_item_clicked

- **퍼널 단계**: P1
- **트리거**: 탐색 페이지에서 페스티벌 카드 클릭 → 상세 페이지 진입 시
- **event_data**:

```json
{
  "festival_id": "PF286798",
  "festival_name": "제18회 서울재즈페스티벌",
  "list_position": 3,
  "active_filters": {
    "region": ["서울"],
    "genre": [],
    "selected_date": null,
    "keyword": ""
  },
  "is_filtered_session": true,
  "time_since_page_entered_ms": 12000
}
```

- `festival_id` (string) — KOPIS mt20id
- `festival_name` (string) — 페스티벌 이름
- `list_position` (number) — 카드의 목록 내 위치 (0부터 시작)
- `active_filters` (object) — 클릭 시점의 필터 상태. Jotai `filterAtom`에서 읽음
- `is_filtered_session` (boolean) — 이 세션에서 filter_apply_button_clicked가 1회 이상 발생했는지
- `time_since_page_entered_ms` (number) — search_page_entered 이후 경과 시간(ms)
- **연결 지표**: DCR(분자), TTD(세션 내 첫 발화의 time_since_page_entered_ms), Filtered/Non-Filtered 세그먼트 비교(is_filtered_session)
- **FE 구현 위치**: `PerformanceCard` 컴포넌트의 클릭 핸들러 (Link 또는 onClick)

#### search_query_submitted

- **퍼널 단계**: P1
- **트리거**: 검색바에서 Enter 또는 검색 실행 시
- **event_data**:

```json
{
  "query_text": "서울 재즈",
  "results_count": 5,
  "source": "header"
}
```

- `query_text` (string) — 입력된 검색어
- `results_count` (number | null) — 검색 결과 수 (API 응답 후 업데이트 가능하면 포함, 불가능하면 null)
- `source` (string) — `"header"` (PC 상단 검색바) | `"filter_section"` (모바일 필터 내 검색바)
- **연결 지표**: SUR(분자)
- **FE 구현 위치**: PC — `Header.tsx` 41행 `onSubmit` / 모바일 — `FilterSection.tsx` 50행 `onSubmit`. **두 곳 모두 이벤트 발화 필수**

#### sort_changed

- **퍼널 단계**: P1
- **트리거**: 정렬 드롭다운(최신순 등) 변경 시
- **event_data**:

```json
{
  "sort_value": "latest",
  "previous_sort_value": "popular"
}
```

- `sort_value` (string) — 변경 후 정렬 기준
- `previous_sort_value` (string) — 변경 전 정렬 기준
- **연결 지표**: SCR(분자)
- **FE 구현 위치**: 정렬 드롭다운 컴포넌트의 onChange 핸들러

---

#### 4-2. P2 — 상세 페이지 이벤트 (5종)

#### detail_page_entered

- **퍼널 단계**: P2
- **트리거**: 상세 페이지(`/performance/[id]`) 컴포넌트 마운트 시 발화
- **event_data**:

```json
{
  "festival_id": "PF286798",
  "festival_name": "제18회 서울재즈페스티벌"
}
```

- `festival_id` (string) — KOPIS mt20id. URL 파라미터 `[id]`에서 추출
- `festival_name` (string) — 페스티벌 이름. API 응답 데이터에서 추출
- **연결 지표**: DetailSessions(분모 — 섹션별 도달율, 블로그 클릭율, 즉시 이탈율, P3 전환율의 공통 분모), RER(분자 판정 — 동일 세션 내 search_page_entered 재발화 시), P4 ReuseUsers strict(재방문 시 상세 페이지 진입 판정)
- **FE 구현 위치**: `src/app/performance/[id]/page.tsx` (PerformanceDetailPage)
- **주의**: `useEffect`의 의존성 배열에 `id`를 포함하여, 같은 탭에서 다른 상세페이지로 이동 시에도 재발화되도록 한다. 마운트 시 세션 레벨 상태(`sectionsViewedRef`, `reviewClickedRef`) 초기화 필수

#### detail_page_exited

- **퍼널 단계**: P2
- **트리거**: 상세 페이지에서 이탈 시 (탐색 페이지 복귀, 탭 닫기, 브라우저 백그라운드)
- **event_data**:

```json
{
  "festival_id": "PF286798",
  "time_on_page_ms": 32000,
  "last_section_viewed": "ticket_price",
  "sections_viewed_list": ["hero", "basic_info", "lineup", "ticket_price"],
  "sections_viewed_count": 4
}
```

- `festival_id` (string) — KOPIS mt20id
- `time_on_page_ms` (number) — 상세 페이지 누적 체류시간(ms)
- `last_section_viewed` (string | null) — 마지막으로 본 섹션. section_viewed 미발생 시 null
- `sections_viewed_list` (string[]) — 이 세션에서 본 섹션 목록 (useRef로 누적)
- `sections_viewed_count` (number) — 본 섹션 수
- **연결 지표**: 상세 페이지 즉시 이탈율(sections_viewed_count === 0인 세션 비율), 블로그 클릭 후 복귀율(발생 여부로 복귀 판정)
- **FE 구현 위치**: `src/app/performance/[id]/page.tsx` — `useEffect` cleanup + `visibilitychange`
- **주의**: search_page_exited와 동일하게 `navigator.sendBeacon()` 또는 `keepalive: true` 사용

#### section_viewed

- **퍼널 단계**: P2
- **트리거**: 상세 페이지에서 특정 섹션이 뷰포트 50% 이상 노출 시. **동일 세션 내 동일 섹션은 최초 1회만 발화**
- **event_data**:

```json
{
  "festival_id": "PF286798",
  "section_name": "lineup",
  "section_index": 2,
  "time_since_page_entered_ms": 4200,
  "is_section_rendered": true
}
```

- `festival_id` (string) — KOPIS mt20id
- `section_name` (string) — 섹션 식별자. `"hero"` | `"basic_info"` | `"lineup"` | `"ticket_price"` | `"ticket_booking"` | `"blog_review"`
- `section_index` (number) — 섹션 순서 (0=hero, 1=basic_info, 2=lineup, 3=ticket_price, 4=ticket_booking, 5=blog_review)
- `time_since_page_entered_ms` (number) — detail_page_entered 이후 경과 시간(ms). 모바일 사용자의 스크롤 속도 분석에 핵심
- `is_section_rendered` (boolean) — 해당 섹션이 실제로 렌더링되었는지 (lineup, ticket_price 등은 데이터 없으면 렌더링 안 됨)
- **연결 지표**: 섹션별 도달율(분자), 상세 페이지 즉시 이탈율(미발생 시 즉시 이탈로 판정), 섹션 도달 × 예매 전환 교차 지표(도달 여부별 ticket_button_clicked 비율)
- **FE 구현 위치**: 각 섹션 컴포넌트에 `Intersection Observer` (threshold 0.5) 적용
    - 바로 적용 가능: `PosterImage`(hero), `InfoGrid`(basic_info), `TicketSection`(ticket_booking), `ReviewSection`(blog_review)
    - **추가 작업 필요**: `InfoGrid` 내부 `detail.cast` 블록(lineup), `detail.priceGuide` 블록(ticket_price) — 내부 ref 부착 또는 별도 컴포넌트 분리 필요
- **중복 발화 방지**: `useRef<Set<string>>(new Set())`로 이미 발화한 section_name을 추적. Set에 없을 때만 발화하고, 발화 후 Set에 추가

#### blog_review_clicked

- **퍼널 단계**: P2
- **트리거**: 상세 페이지 블로그 리뷰 섹션에서 리뷰 링크 클릭 시 (외부 사이트로 이동)
- **event_data**:

```json
{
  "festival_id": "PF286798",
  "review_index": 1,
  "review_title": "서울재즈페스티벌 후기",
  "review_url": "https://blog.naver.com/...",
  "time_since_page_entered_ms": 18000
}
```

- `festival_id` (string) — KOPIS mt20id
- `review_index` (number) — 클릭한 리뷰의 위치 (1부터 시작, 최대 3)
- `review_title` (string) — 블로그 리뷰 제목
- `review_url` (string) — 블로그 리뷰 URL
- `time_since_page_entered_ms` (number) — detail_page_entered 이후 경과 시간(ms)
- **연결 지표**: 블로그 리뷰 링크 클릭율(분자), 리뷰 포지션별 클릭 분포(review_index별 분포), 블로그 클릭 후 복귀율(발생 여부), 리뷰 클릭 후 예매처 전환율(조건부 분자), 리뷰 클릭 개수별 예매처 전환율(review_index별)
- **FE 구현 위치**: `ReviewSection` 내 `BlogReviewItem` 컴포넌트의 링크 클릭 핸들러
- **세션 레벨 상태 업데이트**: 발화 시 `reviewClickedRef.current = true`, `reviewClickCountRef.current += 1` (ticket_button_clicked 이벤트에서 사용)

#### share_button_clicked

- **퍼널 단계**: P2
- **트리거**: 상세 페이지 상단 공유 아이콘 클릭 시
- **event_data**:

```json
{
  "festival_id": "PF286798",
  "festival_name": "제18회 서울재즈페스티벌"
}
```

- `festival_id` (string) — KOPIS mt20id
- `festival_name` (string) — 페스티벌 이름
- **연결 지표**: 공유 버튼 클릭율(분자), P3 전환과의 관계 분석(공유 클릭 세션의 ticket_button_clicked 비율 vs 미클릭 세션)
- **FE 구현 위치**: `DetailHeader` 컴포넌트의 공유 아이콘 클릭 핸들러

---

#### 4-3. P3 — 전환 이벤트 (1종)

#### ticket_button_clicked

- **퍼널 단계**: P3 (Detail → Intent)
- **트리거**: 상세 페이지에서 "예매하기" 버튼 클릭 시 (외부 예매처로 이동)
- **event_data**:

```json
{
  "festival_id": "PF286798",
  "festival_name": "제18회 서울재즈페스티벌",
  "ticket_provider": "melon",
  "review_clicked_in_session": true,
  "review_click_count_in_session": 2,
  "sections_viewed_in_session": ["hero", "basic_info", "lineup", "ticket_price", "ticket_booking", "blog_review"],
  "sections_viewed_count_in_session": 6,
  "time_since_page_entered_ms": 45000
}
```

- `festival_id` (string) — KOPIS mt20id
- `festival_name` (string) — 페스티벌 이름
- `ticket_provider` (string) — 예매처 식별자 (현재 `"melon"`, 확장 대비)
- `review_clicked_in_session` (boolean) — 이 세션에서 blog_review_clicked 발생 여부 (`reviewClickedRef.current`)
- `review_click_count_in_session` (number) — 이 세션에서 blog_review_clicked 발생 횟수 (`reviewClickCountRef.current`)
- `sections_viewed_in_session` (string[]) — 이 세션에서 본 섹션 목록 (`sectionsViewedRef.current`)
- `sections_viewed_count_in_session` (number) — 본 섹션 수
- `time_since_page_entered_ms` (number) — detail_page_entered 이후 경과 시간(ms)
- **연결 지표**:
    - P3 전환율(분자 — IntentSessions / DetailSessions)
    - 리뷰 클릭 후 예매처 전환율(review_clicked_in_session=true인 세션의 비율)
    - 리뷰 미클릭 세션의 예매처 전환율(review_clicked_in_session=false인 세션의 비율)
    - 리뷰 클릭 개수별 예매처 전환율(review_click_count_in_session별 분리)
    - 섹션 도달 × 예매 전환 교차 지표(sections_viewed_in_session으로 도달 여부 판정)
    - P4 IntentUsers 분모(이 이벤트 발생 사용자 = Intent 사용자)
- **FE 구현 위치**: `TicketSection` 컴포넌트의 "예매하기" 버튼 클릭 핸들러
- **주의**: 이 이벤트는 외부 사이트(예매처)로 이동시키므로, `window.open` 또는 `<a target="_blank">` 직전에 발화해야 한다. 비동기 이벤트 전송 시 외부 이동이 이벤트보다 먼저 실행될 수 있으므로, `navigator.sendBeacon()` 또는 동기 전송 권장

---

#### 4-4. P4 — 재방문 이벤트

<aside>
ℹ️

P4는 별도 이벤트 없이 기존 이벤트를 재활용한다.

- **ReuseUsers (broad)**: `app_session_started` 이벤트로 판정. Intent 사용자의 anchor_time 이후 14일 이내에 새 세션이 시작되었는지 확인
- **ReuseUsers (strict)**: `search_page_entered` 또는 `detail_page_entered` 이벤트로 판정. Intent 사용자의 anchor_time 이후 14일 이내에 탐색 또는 상세 페이지에 1회 이상 진입했는지 확인
- **IntentUsers**: `ticket_button_clicked` 이벤트로 판정. Intent 윈도우(7일) 내 1회 이상 발생한 고유 anonymous_id
</aside>

---