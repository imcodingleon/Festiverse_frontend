export interface TicketPrice {
  seatType: string;
  price: number;
  discounted: boolean;
}

export interface TicketInfo {
  performanceId: string;
  vendorName: string;
  vendorUrl: string;
  lineup: string[];
  prices: TicketPrice[];
  bookingStatus: string;
  ticketOpenAt: string;
  notices: string[];
  crawledAt: string | null;
}
