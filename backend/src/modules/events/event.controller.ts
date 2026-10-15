import type { Request, Response } from 'express';

import {
  cancelEvent,
  completeEvent,
  createNewEvent,
  deleteEvent,
  getEventById,
  getPublishedEventById,
  listEvents,
  listPublishedEvents,
  publishEvent,
  updateExistingEvent,
} from '../../services/event.service.js';
import { successResponse } from '../../shared/responses/api-response.js';

import type {
  CreateEventInput,
  EventIdInput,
  EventListQueryInput,
  UpdateEventInput,
} from './event.schemas.js';

type EventIdRequest = Request<EventIdInput>;
type CreateEventRequest = Request<Record<string, never>, unknown, CreateEventInput>;
type UpdateEventRequest = Request<EventIdInput, unknown, UpdateEventInput>;

/**
 * Narrows request.user from optional to required for handlers that only run
 * after the authenticate middleware. Throws only if that invariant is broken
 * (e.g. a route wired without authenticate) — should be unreachable in practice.
 */
function requireUser(request: Request) {
  if (!request.user) {
    throw new Error('Authenticated route handler reached without request.user.');
  }
  return request.user;
}

/**
 * Creates a new event.
 */
export async function createEvent(request: CreateEventRequest, response: Response): Promise<void> {
  const event = await createNewEvent(
    {
      title: request.body.title,
      description: request.body.description,
      venue: request.body.venue,
      city: request.body.city,
      startDate: request.body.startDate,
      endDate: request.body.endDate,
      ...(request.body.bannerImageUrl !== undefined
        ? { bannerImageUrl: request.body.bannerImageUrl }
        : {}),
      ...(request.body.capacity !== undefined ? { capacity: request.body.capacity } : {}),
    },
    requireUser(request),
  );

  response.status(201).json(successResponse('Event created successfully.', event));
}

/**
 * Retrieves a single published event for public discovery.
 */
export async function getEvent(request: EventIdRequest, response: Response): Promise<void> {
  const event = await getPublishedEventById(request.params.id);

  response.status(200).json(successResponse('Event retrieved successfully.', event));
}

/**
 * Retrieves a single event for authenticated event managers.
 *
 * Unlike the public event endpoint, this can return any non-deleted
 * event regardless of lifecycle status.
 */
export async function getManagedEvent(request: EventIdRequest, response: Response): Promise<void> {
  const event = await getEventById(request.params.id);

  response.status(200).json(successResponse('Event retrieved successfully.', event));
}

/**
 * Retrieves published events for public discovery.
 */
export async function getPublishedEvents(request: Request, response: Response): Promise<void> {
  const query = response.locals.validatedQuery as EventListQueryInput;

  const result = await listPublishedEvents({
    page: query.page,
    limit: query.limit,
    ...(query.status !== undefined ? { status: query.status } : {}),
    ...(query.city !== undefined ? { city: query.city } : {}),
  });

  response.status(200).json(successResponse('Published events retrieved successfully.', result));
}

/**
 * Retrieves events for authenticated event managers.
 */
export async function getEvents(request: Request, response: Response): Promise<void> {
  const query = response.locals.validatedQuery as EventListQueryInput;

  const result = await listEvents(
    {
      page: query.page,
      limit: query.limit,
      ...(query.status !== undefined ? { status: query.status } : {}),
      ...(query.city !== undefined ? { city: query.city } : {}),
    },
    requireUser(request),
  );

  response.status(200).json(successResponse('Events retrieved successfully.', result));
}

/**
 * Updates an existing event.
 */
export async function updateEvent(request: UpdateEventRequest, response: Response): Promise<void> {
  const event = await updateExistingEvent(
    request.params.id,
    {
      ...(request.body.title !== undefined ? { title: request.body.title } : {}),
      ...(request.body.description !== undefined ? { description: request.body.description } : {}),
      ...(request.body.venue !== undefined ? { venue: request.body.venue } : {}),
      ...(request.body.city !== undefined ? { city: request.body.city } : {}),
      ...(request.body.startDate !== undefined ? { startDate: request.body.startDate } : {}),
      ...(request.body.endDate !== undefined ? { endDate: request.body.endDate } : {}),
      ...(request.body.bannerImageUrl !== undefined
        ? { bannerImageUrl: request.body.bannerImageUrl }
        : {}),
      ...(request.body.capacity !== undefined ? { capacity: request.body.capacity } : {}),
    },
    requireUser(request),
  );

  response.status(200).json(successResponse('Event updated successfully.', event));
}

/**
 * Publishes an existing event.
 */
export async function publishExistingEvent(
  request: EventIdRequest,
  response: Response,
): Promise<void> {
  const event = await publishEvent(request.params.id, requireUser(request));

  response.status(200).json(successResponse('Event published successfully.', event));
}

/**
 * Cancels an existing event.
 */
export async function cancelExistingEvent(
  request: EventIdRequest,
  response: Response,
): Promise<void> {
  const event = await cancelEvent(request.params.id, requireUser(request));

  response.status(200).json(successResponse('Event cancelled successfully.', event));
}

/**
 * Completes an existing event.
 */
export async function completeExistingEvent(
  request: EventIdRequest,
  response: Response,
): Promise<void> {
  const event = await completeEvent(request.params.id, requireUser(request));

  response.status(200).json(successResponse('Event completed successfully.', event));
}

/**
 * Soft-deletes an existing event.
 */
export async function deleteExistingEvent(
  request: EventIdRequest,
  response: Response,
): Promise<void> {
  const event = await deleteEvent(request.params.id, requireUser(request));

  response.status(200).json(successResponse('Event deleted successfully.', event));
}
