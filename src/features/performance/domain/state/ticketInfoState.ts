import type { TicketInfo } from "@/features/performance/domain/model/ticketInfo";

export type TicketInfoState =
  | { status: "IDLE" }
  | { status: "LOADING" }
  | { status: "LOADED"; data: TicketInfo[] }
  | { status: "ERROR"; message: string };
