export interface PerformanceSummaryDto {
  mt20id: string;
  prfnm: string;
  prfpdfrom: string;
  prfpdto: string;
  fcltynm: string;
  poster: string;
  genrenm: string;
  prfstate: string;
  area: string;
}

export interface FestivalSummaryDto extends PerformanceSummaryDto {
  festival: string;
}

export interface VenueDto {
  mt10id: string;
  fcltynm: string;
  seatscale: number;
  telno: string;
  relateurl: string;
  adres: string;
  la: number;
  lo: number;
  parkinglot: string;
  restaurant: string;
  cafe: string;
  store: string;
  disability: string;
}

export interface RelatedLinkDto {
  name: string;
  url: string;
}

export interface DiscountInfoDto {
  seat_type: string;
  price: number;
  vendor_name: string;
}

export interface PerformanceDetailDto {
  mt20id: string;
  prfnm: string;
  prfpdfrom: string;
  prfpdto: string;
  fcltynm: string;
  prfcast: string;
  prfcrew: string;
  prfruntime: string;
  prfage: string;
  pcseguidance: string;
  poster: string;
  genrenm: string;
  prfstate: string;
  openrun: string;
  styurls: string[];
  relates: RelatedLinkDto[];
  dtguidance: string;
  area: string;
  sty: string;
  venue: VenueDto | null;
  discounts: DiscountInfoDto[];
}

export interface BlogReviewDto {
  title: string;
  link: string;
  description: string;
  bloggername: string;
  postdate: string;
}

export interface TicketPriceDto {
  seat_type: string;
  price: number;
  discounted: boolean;
}

export interface TicketInfoDto {
  mt20id: string;
  vendor_name: string;
  vendor_url: string;
  lineup: string[];
  prices: TicketPriceDto[];
  booking_status: string;
  ticket_open_at: string;
  notices: string[];
  crawled_at: string | null;
}
