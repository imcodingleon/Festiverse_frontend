export interface PerformanceSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  venueName: string;
  posterUrl: string;
  genre: string;
  state: string;
  area: string;
}

export interface FestivalSummary extends PerformanceSummary {
  festival: string;
}

export interface RelatedLink {
  name: string;
  url: string;
}

export interface Venue {
  id: string;
  name: string;
  seatScale: number;
  phone: string;
  websiteUrl: string;
  address: string;
  latitude: number;
  longitude: number;
  parking: string;
  restaurant: string;
  cafe: string;
  store: string;
  disability: string;
}

export interface DiscountInfo {
  seatType: string;
  price: number;
  vendorName: string;
}

export interface PerformanceDetail {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  venueName: string;
  cast: string;
  crew: string;
  runtime: string;
  ageRating: string;
  priceGuide: string;
  posterUrl: string;
  genre: string;
  state: string;
  openRun: string;
  styleUrls: string[];
  relatedLinks: RelatedLink[];
  timeGuide: string;
  area: string;
  story: string;
  venue: Venue | null;
  discounts: DiscountInfo[];
}
