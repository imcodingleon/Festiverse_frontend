import type { EventType } from "./constants";

export interface TrackingPayload {
  id: string;
  anonymous_id: string;
  session_id: string;
  event_type: EventType;
  event_data: Record<string, unknown>;
  page_url: string;
  device_type: "mobile" | "desktop";
}

export interface AppSessionStartedData {
  is_return_user: boolean;
  days_since_last_visit: number | null;
  referrer: string | null;
}

export interface FavoriteToggledData {
  festival_id: string;
  is_favorited: boolean;
  source: "search" | "detail";
}

export interface SearchPageExitedData {
  time_on_page_ms: number;
}

export interface FilterOptionToggledData {
  filter_type: "region" | "genre";
  filter_value: string;
  is_selected: boolean;
  time_since_page_entered_ms: number;
}

export interface FilterApplyButtonClickedData {
  applied_filters: {
    region: string[];
    genre: string[];
  };
  filter_count: number;
  time_since_page_entered_ms: number;
}

export interface CalendarDateClickedData {
  selected_date: string;
  calendar_year: number;
  calendar_month: number;
}

export interface CalendarPeriodNavigatedData {
  direction: "next" | "prev";
  from_year_month: string;
  to_year_month: string;
}

export interface FestivalItemClickedData {
  festival_id: string;
  festival_name: string;
  list_position: number;
  active_filters: {
    region: string[];
    genre: string[];
    selected_date: string | null;
    keyword: string;
  };
  is_filtered_session: boolean;
  time_since_page_entered_ms: number;
}

export interface SearchQuerySubmittedData {
  query_text: string;
  results_count: number | null;
  source: "header" | "filter_section";
}

export interface SortChangedData {
  sort_value: string;
  previous_sort_value: string;
}

export interface DetailPageEnteredData {
  festival_id: string;
  festival_name: string;
}

export interface DetailPageExitedData {
  festival_id: string;
  time_on_page_ms: number;
  last_section_viewed: string | null;
  sections_viewed_list: string[];
  sections_viewed_count: number;
}

export interface SectionViewedData {
  festival_id: string;
  section_name: string;
  section_index: number;
  time_since_page_entered_ms: number;
  is_section_rendered: boolean;
}

export interface BlogReviewClickedData {
  festival_id: string;
  review_index: number;
  review_title: string;
  review_url: string;
  time_since_page_entered_ms: number;
}

export interface ShareButtonClickedData {
  festival_id: string;
  festival_name: string;
}

export interface TicketButtonClickedData {
  festival_id: string;
  festival_name: string;
  ticket_provider: string;
  review_clicked_in_session: boolean;
  review_click_count_in_session: number;
  sections_viewed_in_session: string[];
  sections_viewed_count_in_session: number;
  time_since_page_entered_ms: number;
}
