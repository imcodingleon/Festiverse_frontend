import { API_BASE_URL } from "@/infrastructure/config/env";
import type {
  DashboardResponse,
  DateParams,
  P1PvRow,
  P1FsrRow,
  P1FarRow,
  P1DcrRow,
  P1TftRow,
  P1TfaRow,
  P1TtdRow,
  P1TimeOnPageRow,
  P1FucRow,
  P1RerRow,
  P1AfaRow,
  P1SurRow,
  P1ScrRow,
  P1TimeOnPageSegRow,
  P1TtdSegRow,
  P2SectionReachRow,
  P2BlogClickRow,
  P2ImmediateBounceRow,
  P2ReviewPositionRow,
  P2BlogReturnRow,
  P2ShareRow,
  P3ConversionRow,
  P3ReviewToTicketRow,
  P3NoReviewTicketRow,
  P3ReviewCountConvRow,
  P3SectionXTicketRow,
  P4IntentUserRow,
  P4ReuseBroadRow,
  P4ReuseStrictRow,
  P4ConversionRow,
} from "./types";

async function fetchView<T>(
  viewName: string,
  params?: DateParams,
): Promise<DashboardResponse<T>> {
  const url = new URL(`/api/dashboard/${viewName}`, typeof window !== "undefined" ? window.location.origin : API_BASE_URL);
  if (params?.dateFrom) url.searchParams.set("date_from", params.dateFrom);
  if (params?.dateTo) url.searchParams.set("date_to", params.dateTo);
  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Dashboard API ${res.status}: ${viewName}`);
    return await res.json();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(msg.includes("Dashboard API") ? msg : `Dashboard API fetch failed: ${viewName} (${msg})`);
  }
}

type SettledResult<T> = { data: DashboardResponse<T> | null; error: string | null };

function settle<T>(promise: Promise<DashboardResponse<T>>): Promise<SettledResult<T>> {
  return promise
    .then((data) => ({ data, error: null }))
    .catch((err: Error) => ({ data: null, error: err.message }));
}

export interface P1Data {
  pv: SettledResult<P1PvRow>;
  fsr: SettledResult<P1FsrRow>;
  far: SettledResult<P1FarRow>;
  dcr: SettledResult<P1DcrRow>;
  tft: SettledResult<P1TftRow>;
  tfa: SettledResult<P1TfaRow>;
  ttd: SettledResult<P1TtdRow>;
  timeOnPage: SettledResult<P1TimeOnPageRow>;
  fuc: SettledResult<P1FucRow>;
  rer: SettledResult<P1RerRow>;
  afa: SettledResult<P1AfaRow>;
  sur: SettledResult<P1SurRow>;
  scr: SettledResult<P1ScrRow>;
  timeOnPageSeg: SettledResult<P1TimeOnPageSegRow>;
  ttdSeg: SettledResult<P1TtdSegRow>;
}

export async function fetchP1Views(params?: DateParams): Promise<P1Data> {
  const [pv, fsr, far, dcr, tft, tfa, ttd, timeOnPage, fuc, rer, afa, sur, scr, timeOnPageSeg, ttdSeg] =
    await Promise.all([
      settle(fetchView<P1PvRow>("v_p1_pv", params)),
      settle(fetchView<P1FsrRow>("v_p1_fsr", params)),
      settle(fetchView<P1FarRow>("v_p1_far", params)),
      settle(fetchView<P1DcrRow>("v_p1_dcr", params)),
      settle(fetchView<P1TftRow>("v_p1_tft", params)),
      settle(fetchView<P1TfaRow>("v_p1_tfa", params)),
      settle(fetchView<P1TtdRow>("v_p1_ttd", params)),
      settle(fetchView<P1TimeOnPageRow>("v_p1_time_on_page", params)),
      settle(fetchView<P1FucRow>("v_p1_fuc", params)),
      settle(fetchView<P1RerRow>("v_p1_rer", params)),
      settle(fetchView<P1AfaRow>("v_p1_afa", params)),
      settle(fetchView<P1SurRow>("v_p1_sur", params)),
      settle(fetchView<P1ScrRow>("v_p1_scr", params)),
      settle(fetchView<P1TimeOnPageSegRow>("v_p1_time_on_page_seg", params)),
      settle(fetchView<P1TtdSegRow>("v_p1_ttd_seg", params)),
    ]);
  return { pv, fsr, far, dcr, tft, tfa, ttd, timeOnPage, fuc, rer, afa, sur, scr, timeOnPageSeg, ttdSeg };
}

export interface P2Data {
  sectionReach: SettledResult<P2SectionReachRow>;
  blogClick: SettledResult<P2BlogClickRow>;
  immediateBounce: SettledResult<P2ImmediateBounceRow>;
  reviewPosition: SettledResult<P2ReviewPositionRow>;
  blogReturn: SettledResult<P2BlogReturnRow>;
  share: SettledResult<P2ShareRow>;
}

export async function fetchP2Views(params?: DateParams): Promise<P2Data> {
  const [sectionReach, blogClick, immediateBounce, reviewPosition, blogReturn, share] =
    await Promise.all([
      settle(fetchView<P2SectionReachRow>("v_p2_section_reach", params)),
      settle(fetchView<P2BlogClickRow>("v_p2_blog_click", params)),
      settle(fetchView<P2ImmediateBounceRow>("v_p2_immediate_bounce", params)),
      settle(fetchView<P2ReviewPositionRow>("v_p2_review_position", params)),
      settle(fetchView<P2BlogReturnRow>("v_p2_blog_return", params)),
      settle(fetchView<P2ShareRow>("v_p2_share", params)),
    ]);
  return { sectionReach, blogClick, immediateBounce, reviewPosition, blogReturn, share };
}

export interface P3Data {
  conversion: SettledResult<P3ConversionRow>;
  reviewToTicket: SettledResult<P3ReviewToTicketRow>;
  noReviewTicket: SettledResult<P3NoReviewTicketRow>;
  reviewCountConv: SettledResult<P3ReviewCountConvRow>;
  sectionXTicket: SettledResult<P3SectionXTicketRow>;
}

export async function fetchP3Views(params?: DateParams): Promise<P3Data> {
  const [conversion, reviewToTicket, noReviewTicket, reviewCountConv, sectionXTicket] =
    await Promise.all([
      settle(fetchView<P3ConversionRow>("v_p3_conversion", params)),
      settle(fetchView<P3ReviewToTicketRow>("v_p3_review_to_ticket", params)),
      settle(fetchView<P3NoReviewTicketRow>("v_p3_no_review_ticket", params)),
      settle(fetchView<P3ReviewCountConvRow>("v_p3_review_count_conv", params)),
      settle(fetchView<P3SectionXTicketRow>("v_p3_section_x_ticket", params)),
    ]);
  return { conversion, reviewToTicket, noReviewTicket, reviewCountConv, sectionXTicket };
}

export interface P4Data {
  intentUsers: SettledResult<P4IntentUserRow>;
  reuseBroad: SettledResult<P4ReuseBroadRow>;
  reuseStrict: SettledResult<P4ReuseStrictRow>;
  conversion: SettledResult<P4ConversionRow>;
}

export async function fetchP4Views(dateTo: string): Promise<P4Data> {
  const params: DateParams = { dateTo };
  const [intentUsers, reuseBroad, reuseStrict, conversion] = await Promise.all([
    settle(fetchView<P4IntentUserRow>("v_p4_intent_users", params)),
    settle(fetchView<P4ReuseBroadRow>("v_p4_reuse_broad", params)),
    settle(fetchView<P4ReuseStrictRow>("v_p4_reuse_strict", params)),
    settle(fetchView<P4ConversionRow>("v_p4_conversion", params)),
  ]);
  return { intentUsers, reuseBroad, reuseStrict, conversion };
}
