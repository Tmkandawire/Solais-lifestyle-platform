import { apiClient } from "./client";

import type {
  AdminEvent,
  AdminEventList,
  AdminEventListParams,
  CreateEventPayload,
  Event,
  EventListMeta,
  GetEventsParams,
  UpdateEventPayload,
} from "../types/event";
import type { ApiSuccessResponse } from "../types/api";

interface EventsData {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type EventsResponse = ApiSuccessResponse<EventsData>;

interface AdminEventsData {
  events: AdminEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type AdminEventsResponse = ApiSuccessResponse<AdminEventsData>;

export async function getEvents(params?: GetEventsParams): Promise<{
  events: Event[];
  meta: EventListMeta;
}> {
  const response = await apiClient.get<EventsResponse>("/events", {
    params,
  });

  return {
    events: response.data.data.events,
    meta: {
      total: response.data.data.total,
      page: response.data.data.page,
      limit: response.data.data.limit,
      totalPages: response.data.data.totalPages,
    },
  };
}

export async function getAdminEvents(
  params?: AdminEventListParams,
): Promise<AdminEventList> {
  const response = await apiClient.get<AdminEventsResponse>("/events/manage", {
    params,
  });

  return {
    events: response.data.data.events,
    meta: {
      total: response.data.data.total,
      page: response.data.data.page,
      limit: response.data.data.limit,
      totalPages: response.data.data.totalPages,
    },
  };
}

export async function getEventById(id: string): Promise<Event> {
  const response = await apiClient.get<ApiSuccessResponse<Event>>(
    `/events/${id}`,
  );

  return response.data.data;
}

export async function getAdminEventById(id: string): Promise<AdminEvent> {
  const response = await apiClient.get<ApiSuccessResponse<AdminEvent>>(
    `/events/manage/${id}`,
  );

  return response.data.data;
}

export async function createEvent(
  payload: CreateEventPayload,
): Promise<AdminEvent> {
  const response = await apiClient.post<ApiSuccessResponse<AdminEvent>>(
    "/events",
    payload,
  );

  return response.data.data;
}

export async function updateEvent(
  id: string,
  payload: UpdateEventPayload,
): Promise<AdminEvent> {
  const response = await apiClient.patch<ApiSuccessResponse<AdminEvent>>(
    `/events/${id}`,
    payload,
  );

  return response.data.data;
}

export async function publishEvent(id: string): Promise<AdminEvent> {
  const response = await apiClient.post<ApiSuccessResponse<AdminEvent>>(
    `/events/${id}/publish`,
  );

  return response.data.data;
}

export async function cancelEvent(id: string): Promise<AdminEvent> {
  const response = await apiClient.post<ApiSuccessResponse<AdminEvent>>(
    `/events/${id}/cancel`,
  );

  return response.data.data;
}

export async function completeEvent(id: string): Promise<AdminEvent> {
  const response = await apiClient.post<ApiSuccessResponse<AdminEvent>>(
    `/events/${id}/complete`,
  );

  return response.data.data;
}

export async function deleteEvent(id: string): Promise<AdminEvent> {
  const response = await apiClient.delete<ApiSuccessResponse<AdminEvent>>(
    `/events/${id}`,
  );

  return response.data.data;
}
