import { apiClient } from "./client";
import type { ApiSuccessResponse } from "../types/api";
import type {
  CreateTicketTypePayload,
  PaginatedPublicTicketTypes,
  PaginatedTicketTypes,
  PublicTicketType,
  TicketType,
  TicketListMeta,
  TicketTypeListParams,
  UpdateTicketTypePayload,
} from "../types/ticket";

/**
 * ASSUMPTION — confirm against the backend before relying on this file:
 *
 * Mirrors the Events convention (GET /events public + mapped to
 * PublicEvent, vs GET /events/manage admin-only + full Event):
 *
 *   GET /tickets/event/:eventId        -> public, mapped to
 *                                          PublicTicketType by the
 *                                          backend's ticket.mapper.ts
 *                                          (analogous to toPublicEvent)
 *   GET /tickets/manage/event/:eventId -> admin-only, full TicketType
 *                                          (capacity, soldQuantity,
 *                                          deletedAt included)
 *
 * If the backend does NOT yet have a /manage split for ticket types
 * (i.e. there's still only one GET /tickets/event/:eventId route
 * serving both admin and attendee callers), do not ship this file as
 *-is: the admin functions below will 404, and more importantly the
 * "public" function is only actually public-safe once the backend
 * mapper exists. Confirm the route split exists before wiring this
 * into useTicket.ts.
 */

/** Optional request cancellation, threaded through to axios. */
interface RequestOptions {
  signal?: AbortSignal;
}

// ---------------------------------------------------------------------
// Query keys
//
// Two levels per resource: a short "prefix" key (no params) used for
// cache invalidation, and a full key (prefix + params) used for the
// actual query. TanStack Query's invalidateQueries does a partial
// (prefix) match, so invalidating the short key clears every params
// variant cached under it — this is what the previous version got
// wrong: invalidating `event(eventId)` with an empty `{}` params
// object did NOT match a query cached with real params, because `{}`
// and `{ page: 1, limit: 20, status: 'ACTIVE' }` aren't equal. Keeping
// params out of the invalidation key entirely avoids that class of bug.
// ---------------------------------------------------------------------
export const TICKET_QUERY_KEYS = {
  all: ["tickets"] as const,
  details: () => [...TICKET_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TICKET_QUERY_KEYS.details(), id] as const,

  publicLists: () => [...TICKET_QUERY_KEYS.all, "public-list"] as const,
  /** Prefix only — use this to invalidate every params variant for an event. */
  publicEvent: (eventId: string) =>
    [...TICKET_QUERY_KEYS.publicLists(), eventId] as const,
  /** Full key — use this as the actual useQuery key. */
  publicEventList: (eventId: string, params?: TicketTypeListParams) =>
    [...TICKET_QUERY_KEYS.publicEvent(eventId), params ?? {}] as const,

  adminLists: () => [...TICKET_QUERY_KEYS.all, "admin-list"] as const,
  adminEvent: (eventId: string) =>
    [...TICKET_QUERY_KEYS.adminLists(), eventId] as const,
  adminEventList: (eventId: string, params?: TicketTypeListParams) =>
    [...TICKET_QUERY_KEYS.adminEvent(eventId), params ?? {}] as const,
};

// ---------------------------------------------------------------------
// Attendee-facing (public) reads
// ---------------------------------------------------------------------

/**
 * Retrieves a single ticket type as attendees are allowed to see it.
 *
 * GET /tickets/:id
 *
 * Public endpoint. Backend maps to PublicTicketType — no capacity,
 * soldQuantity, or deletedAt on this response.
 */
export async function getTicketById(
  id: string,
  options?: RequestOptions,
): Promise<PublicTicketType> {
  const response = await apiClient.get<ApiSuccessResponse<PublicTicketType>>(
    `/tickets/${id}`,
    { signal: options?.signal },
  );
  return response.data.data;
}

/**
 * Retrieves purchasable ticket types for an event.
 *
 * GET /tickets/event/:eventId
 *
 * Public endpoint. Backend is responsible for both the PublicTicketType
 * mapping and the "purchasable" filtering (sale window, active status,
 * remaining availability) — this must NOT be reconstructed client-side.
 * (Client-side re-filtering was the bug in AttendeeTicketsPage: it
 * desynced the returned pagination totals from what was actually shown.)
 */
export async function getTicketsByEvent(
  eventId: string,
  params?: TicketTypeListParams,
  options?: RequestOptions,
): Promise<PaginatedPublicTicketTypes> {
  const response = await apiClient.get<
    ApiSuccessResponse<{
      ticketTypes: PublicTicketType[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>
  >(`/tickets/event/${eventId}`, {
    params,
    signal: options?.signal,
  });
  const data = response.data.data;
  return {
    ticketTypes: data.ticketTypes,
    meta: {
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
    } satisfies TicketListMeta,
  };
}

// ---------------------------------------------------------------------
// Admin-facing reads
// ---------------------------------------------------------------------

/**
 * Retrieves the full ticket type record (capacity, soldQuantity,
 * deletedAt included).
 *
 * GET /tickets/manage/:id
 *
 * Admin only (SUPER_ADMIN, ADMIN — mirrors requireEventManager /
 * canManageEvents from the Events module). NOT safe to call from
 * attendee-facing pages.
 */
export async function getManagedTicketById(
  id: string,
  options?: RequestOptions,
): Promise<TicketType> {
  const response = await apiClient.get<ApiSuccessResponse<TicketType>>(
    `/tickets/manage/${id}`,
    { signal: options?.signal },
  );
  return response.data.data;
}

/**
 * Retrieves all ticket types for an event, including inactive/sold-out
 * ones and raw inventory numbers, for admin management screens.
 *
 * GET /tickets/manage/event/:eventId
 *
 * Admin only (SUPER_ADMIN, ADMIN).
 */
export async function getManagedTicketsByEvent(
  eventId: string,
  params?: TicketTypeListParams,
  options?: RequestOptions,
): Promise<PaginatedTicketTypes> {
  const response = await apiClient.get<
    ApiSuccessResponse<{
      ticketTypes: TicketType[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>
  >(`/tickets/manage/event/${eventId}`, {
    params,
    signal: options?.signal,
  });
  const data = response.data.data;
  return {
    ticketTypes: data.ticketTypes,
    meta: {
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
    } satisfies TicketListMeta,
  };
}

// ---------------------------------------------------------------------
// Admin-facing writes
// ---------------------------------------------------------------------

/**
 * Creates a ticket type.
 *
 * POST /tickets
 *
 * Admin only (SUPER_ADMIN, ADMIN).
 */
export async function createTicketType(
  payload: CreateTicketTypePayload,
): Promise<TicketType> {
  const response = await apiClient.post<ApiSuccessResponse<TicketType>>(
    "/tickets",
    payload,
  );
  return response.data.data;
}

/**
 * Updates a ticket type's mutable metadata.
 *
 * PATCH /tickets/:id
 *
 * Admin only (SUPER_ADMIN, ADMIN). Lifecycle status changes go through
 * the dedicated activate/deactivate endpoints below, not this one —
 * matches the Events convention of publish/cancel as distinct
 * operations rather than folding state transitions into a generic
 * update.
 */
export async function updateTicketType(
  id: string,
  payload: UpdateTicketTypePayload,
): Promise<TicketType> {
  const response = await apiClient.patch<ApiSuccessResponse<TicketType>>(
    `/tickets/${id}`,
    payload,
  );
  return response.data.data;
}

/**
 * Activates a ticket type, making it purchasable.
 *
 * POST /tickets/:id/activate
 *
 * Admin only (SUPER_ADMIN, ADMIN).
 */
export async function activateTicketType(id: string): Promise<TicketType> {
  const response = await apiClient.post<ApiSuccessResponse<TicketType>>(
    `/tickets/${id}/activate`,
  );
  return response.data.data;
}

/**
 * Deactivates a ticket type, removing it from sale without deleting it.
 *
 * POST /tickets/:id/deactivate
 *
 * Admin only (SUPER_ADMIN, ADMIN).
 */
export async function deactivateTicketType(id: string): Promise<TicketType> {
  const response = await apiClient.post<ApiSuccessResponse<TicketType>>(
    `/tickets/${id}/deactivate`,
  );
  return response.data.data;
}

/**
 * Soft-deletes a ticket type.
 *
 * DELETE /tickets/:id
 *
 * Admin only (SUPER_ADMIN, ADMIN). Backend returns the deleted ticket
 * type rather than an empty response — confirm this matches
 * event.api.ts's delete precedent; if events return void/204 instead,
 * this should be changed to match rather than diverge.
 */
export async function deleteTicketType(id: string): Promise<TicketType> {
  const response = await apiClient.delete<ApiSuccessResponse<TicketType>>(
    `/tickets/${id}`,
  );
  return response.data.data;
}

/**
 * NOTE: no `reserve` function in this file.
 *
 * Reserving inventory is order-scoped (it should create a hold with
 * its own id/expiry, not mutate and return the TicketType itself), so
 * it belongs in order.api.ts as part of order creation — not here.
 * `ReserveTicketPayload` in types/ticket.ts is now dead code and
 * should be removed or moved to types/order.ts when that file is built.
 */
