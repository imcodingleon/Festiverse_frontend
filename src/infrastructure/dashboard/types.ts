export interface DashboardResponse<T> {
  view_name: string;
  rows: T[];
  total: number;
}

export interface DateParams {
  dateFrom?: string;
  dateTo?: string;
}

// --- P1 Row Types ---

export interface P1PvRow {
  report_date: string;
  pv: number;
}

export interface P1FsrRow {
  report_date: string;
  fsr: number;
}

export interface P1FarRow {
  report_date: string;
  far: number;
}

export interface P1DcrRow {
  report_date: string;
  dcr: number;
}

export interface P1TftRow {
  report_date: string;
  avg_tft_ms: number;
}

export interface P1TfaRow {
  report_date: string;
  avg_tfa_ms: number;
}

export interface P1TtdRow {
  report_date: string;
  avg_ttd_ms: number;
}

export interface P1TimeOnPageRow {
  report_date: string;
  avg_time_on_page_ms: number;
}

export interface P1FucRow {
  report_date: string;
  avg_fuc: number;
}

export interface P1RerRow {
  report_date: string;
  rer: number;
}

export interface P1AfaRow {
  report_date: string;
  avg_afa: number;
}

export interface P1SurRow {
  report_date: string;
  sur: number;
}

export interface P1ScrRow {
  report_date: string;
  scr: number;
}

export interface SegmentRow {
  report_date: string;
  segment: "Filtered" | "Non Filtered";
}

export interface P1TimeOnPageSegRow extends SegmentRow {
  avg_time_on_page_ms: number;
}

export interface P1TtdSegRow extends SegmentRow {
  avg_ttd_ms: number;
}

// --- P2 Row Types ---

export interface P2SectionReachRow {
  report_date: string;
  section_name: string;
  reach_rate: number;
}

export interface P2BlogClickRow {
  report_date: string;
  blog_click_rate: number;
}

export interface P2ImmediateBounceRow {
  report_date: string;
  immediate_bounce_rate: number;
}

export interface P2ReviewPositionRow {
  report_date: string;
  review_index: number;
  click_share: number;
}

export interface P2BlogReturnRow {
  report_date: string;
  return_rate: number;
}

export interface P2ShareRow {
  report_date: string;
  share_rate: number;
}

// --- P3 Row Types ---

export interface P3ConversionRow {
  report_date: string;
  p3_rate: number;
}

export interface P3ReviewToTicketRow {
  report_date: string;
  review_to_ticket_rate: number;
}

export interface P3NoReviewTicketRow {
  report_date: string;
  no_review_ticket_rate: number | null;
}

export interface P3ReviewCountConvRow {
  report_date: string;
  review_count: number;
  conversion_rate: number;
}

export interface P3SectionXTicketRow {
  report_date: string;
  section_name: string;
  reached_ticket_rate: number | null;
  not_reached_ticket_rate: number | null;
}

// --- P4 Row Types ---

export interface P4IntentUserRow {
  report_date: string;
  anonymous_id: string;
  anchor_time: string;
}

export interface P4ReuseBroadRow {
  report_date: string;
  intent_users: number;
  reuse_users_broad: number;
}

export interface P4ReuseStrictRow {
  report_date: string;
  intent_users: number;
  reuse_users_strict: number;
}

export interface P4ConversionRow {
  report_date: string;
  intent_users: number;
  reuse_broad: number;
  reuse_strict: number;
  p4_broad_rate: number;
  p4_strict_rate: number;
}
