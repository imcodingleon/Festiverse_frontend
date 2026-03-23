import type { PerformanceSummary, PerformanceDetail, Venue } from "@/features/performance/domain/model/performance";
import type { BlogReview } from "@/features/performance/domain/model/blogReview";
import type { TicketInfo } from "@/features/performance/domain/model/ticketInfo";
import type {
  PerformanceSummaryDto,
  PerformanceDetailDto,
  VenueDto,
  BlogReviewDto,
  TicketInfoDto,
} from "./dto";
import { toDotDate } from "@/features/performance/domain/model/utils";

export function toPerformanceSummary(dto: PerformanceSummaryDto): PerformanceSummary {
  return {
    id: dto.mt20id,
    name: dto.prfnm,
    startDate: dto.prfpdfrom,
    endDate: dto.prfpdto,
    venueName: dto.fcltynm,
    posterUrl: dto.poster,
    genre: dto.genrenm,
    state: dto.prfstate,
    area: dto.area,
    dateRanges: dto.dtguidance || undefined,
  };
}

function toVenue(dto: VenueDto): Venue {
  return {
    id: dto.mt10id,
    name: dto.fcltynm,
    seatScale: dto.seatscale,
    phone: dto.telno,
    websiteUrl: dto.relateurl,
    address: dto.adres,
    latitude: dto.la,
    longitude: dto.lo,
    parking: dto.parkinglot,
    restaurant: dto.restaurant,
    cafe: dto.cafe,
    store: dto.store,
    disability: dto.disability,
  };
}

export function toPerformanceDetail(dto: PerformanceDetailDto): PerformanceDetail {
  return {
    id: dto.mt20id,
    name: dto.prfnm,
    startDate: dto.prfpdfrom,
    endDate: dto.prfpdto,
    venueName: dto.fcltynm,
    cast: dto.prfcast,
    crew: dto.prfcrew,
    runtime: dto.prfruntime,
    ageRating: dto.prfage,
    priceGuide: dto.pcseguidance,
    posterUrl: dto.poster,
    genre: dto.genrenm,
    state: dto.prfstate,
    openRun: dto.openrun,
    styleUrls: dto.styurls ?? [],
    relatedLinks: dto.relates ?? [],
    timeGuide: dto.dtguidance,
    area: dto.area,
    story: dto.sty,
    venue: dto.venue ? toVenue(dto.venue) : null,
    discounts: (dto.discounts ?? []).map((d) => ({
      seatType: d.seat_type,
      price: d.price,
      vendorName: d.vendor_name,
    })),
  };
}

export function toBlogReview(dto: BlogReviewDto): BlogReview {
  const raw = dto.postdate;
  const formatted =
    raw && raw.length === 8 ? toDotDate(raw) : raw;
  return {
    title: dto.title,
    link: dto.link,
    description: dto.description,
    bloggerName: dto.bloggername,
    postDate: formatted,
  };
}

export function toTicketInfo(dto: TicketInfoDto): TicketInfo {
  return {
    performanceId: dto.mt20id,
    vendorName: dto.vendor_name,
    vendorUrl: dto.vendor_url,
    lineup: dto.lineup ?? [],
    prices: (dto.prices ?? []).map((p) => ({
      seatType: p.seat_type,
      price: p.price,
      discounted: p.discounted,
    })),
    bookingStatus: dto.booking_status,
    ticketOpenAt: dto.ticket_open_at,
    notices: dto.notices ?? [],
    crawledAt: dto.crawled_at,
  };
}
