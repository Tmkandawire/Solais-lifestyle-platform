import { apiClient } from "./client";
import type { ApiSuccessResponse } from "../types/api";
import type {
  AttendeeIssuedTicket,
  AttendeeTicketListParams,
  PaginatedAttendeeTickets,
  StaffCheckInResult,
} from "../types/issued-ticket";

interface RequestOptions {
  signal?: AbortSignal;
}

interface AttendeeTicketListResponse {
  tickets: AttendeeIssuedTicket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ISSUED_TICKET_QUERY_KEYS = {
  all: ["issued-tickets"] as const,
  mine: () => [...ISSUED_TICKET_QUERY_KEYS.all, "mine"] as const,
  myTickets: (params?: AttendeeTicketListParams) =>
    [...ISSUED_TICKET_QUERY_KEYS.mine(), params ?? {}] as const,
};

/**
 * Retrieves the authenticated attendee's issued tickets.
 *
 * GET /issued-tickets/me
 *
 * The backend scopes this endpoint to the authenticated account.
 */
export async function getMyIssuedTickets(
  params?: AttendeeTicketListParams,
  options?: RequestOptions,
): Promise<PaginatedAttendeeTickets> {
  const response = await apiClient.get<
    ApiSuccessResponse<AttendeeTicketListResponse>
  >("/issued-tickets/me", {
    params,
    signal: options?.signal,
  });

  const data = response.data.data;

  return {
    tickets: data.tickets,
    meta: {
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
    },
  };
}

export interface IssuedTicketQrCredential {
  ticketId: string;
  qrCredential: string;
}

export async function getIssuedTicketQrCredential(
  ticketId: string,
  options?: RequestOptions,
): Promise<IssuedTicketQrCredential> {
  const response = await apiClient.get<
    ApiSuccessResponse<IssuedTicketQrCredential>
  >(`/issued-tickets/${ticketId}/qr-credential`, {
    signal: options?.signal,
  });

  return response.data.data;
}

export async function checkInIssuedTicket(
  qrPayload: string,
  eventId: string,
  options?: RequestOptions,
): Promise<StaffCheckInResult> {
  const response = await apiClient.post<ApiSuccessResponse<StaffCheckInResult>>(
    "/issued-tickets/check-in",
    {
      qrPayload,
      eventId,
    },
    {
      signal: options?.signal,
    },
  );

  return response.data.data;
}
