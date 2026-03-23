export const EVENT_TYPES = {
  APP_SESSION_STARTED: "app_session_started",
  FAVORITE_TOGGLED: "favorite_toggled",

  SEARCH_PAGE_ENTERED: "search_page_entered",
  SEARCH_PAGE_EXITED: "search_page_exited",
  FILTER_OPTION_TOGGLED: "filter_option_toggled",
  FILTER_APPLY_BUTTON_CLICKED: "filter_apply_button_clicked",
  CALENDAR_DATE_CLICKED: "calendar_date_clicked",
  CALENDAR_PERIOD_NAVIGATED: "calendar_period_navigated",
  FESTIVAL_ITEM_CLICKED: "festival_item_clicked",
  SEARCH_QUERY_SUBMITTED: "search_query_submitted",
  SORT_CHANGED: "sort_changed",

  DETAIL_PAGE_ENTERED: "detail_page_entered",
  DETAIL_PAGE_EXITED: "detail_page_exited",
  SECTION_VIEWED: "section_viewed",
  BLOG_REVIEW_CLICKED: "blog_review_clicked",
  SHARE_BUTTON_CLICKED: "share_button_clicked",

  TICKET_BUTTON_CLICKED: "ticket_button_clicked",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export const SECTION_NAMES = {
  HERO: "hero",
  BASIC_INFO: "basic_info",
  LINEUP: "lineup",
  TICKET_PRICE: "ticket_price",
  TICKET_BOOKING: "ticket_booking",
  BLOG_REVIEW: "blog_review",
} as const;

export type SectionName = (typeof SECTION_NAMES)[keyof typeof SECTION_NAMES];

export const SECTION_INDEX: Record<SectionName, number> = {
  hero: 0,
  basic_info: 1,
  lineup: 2,
  ticket_price: 3,
  ticket_booking: 4,
  blog_review: 5,
};
