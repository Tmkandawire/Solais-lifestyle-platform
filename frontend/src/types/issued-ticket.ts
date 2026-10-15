import type { PaginationMeta } from "./pagination";

export type IssuedTicketStatus = "ISSUED" | "CHECKED_IN" | "CANCELLED";

export interface AttendeeIssuedTicket {
  id: string;
  ticketNumber: string;
  status: IssuedTicketStatus;
  createdAt: string;

  ticketType: {
    id: string;
    name: string;
    price: string;
  };

  order: {
    id: string;
  };

  event: {
    id: string;
    title: string;
    venue: string;
    city: string;
    startDate: string;
    endDate: string;
    bannerImageUrl: string | null;
  };
}

export interface PaginatedAttendeeTickets {
  tickets: AttendeeIssuedTicket[];
  meta: PaginationMeta;
}

export interface AttendeeTicketListParams {
  page?: number;
  limit?: number;
  status?: IssuedTicketStatus;
}

export interface StaffCheckInResult {
  id: string;
  ticketNumber: string;
  status: AttendeeIssuedTicket["status"];
  checkedInAt: string | null;
  ticketType: {
    id: string;
    name: string;
  };
  event: {
    id: string;
    title: string;
  };
}
