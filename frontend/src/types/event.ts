import type { EventStatus } from "./event-status";
import type { PaginationMeta } from "./pagination";

export interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  city: string;
  startDate: string;
  endDate: string;
  bannerImageUrl: string | null;
  capacity: number | null;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Full event representation returned by authenticated/admin event management
 * endpoints.
 *
 * Extends the public Event representation with fields that are intentionally
 * not exposed through the public event mapper.
 */
export interface AdminEvent extends Event {
  createdById: string;
  deletedAt: string | null;
}

export type EventListMeta = PaginationMeta;
export type AdminEventListMeta = PaginationMeta;

export interface GetEventsParams {
  page?: number;
  limit?: number;
  city?: string;
}

export interface AdminEventListParams {
  page?: number;
  limit?: number;
  status?: EventStatus;
  city?: string;
}

export interface AdminEventList {
  events: AdminEvent[];
  meta: AdminEventListMeta;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  venue: string;
  city: string;
  startDate: string;
  endDate: string;
  bannerImageUrl?: string | null;
  capacity?: number | null;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  venue?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  bannerImageUrl?: string | null;
  capacity?: number | null;
}
