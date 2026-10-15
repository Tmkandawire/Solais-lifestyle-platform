import { EventStatus, Role } from '../generated/prisma/enums.js';
import {
  createEvent,
  findEventById,
  findEvents,
  findPublishedEvents,
  softDeleteEvent,
  updateEvent,
  type CreateEventData,
  type FindEventsOptions,
  type PaginatedEvents,
  type UpdateEventData,
} from '../repositories/event.repository.js';
import {
  EventForbiddenError,
  EventInvalidStateError,
  EventNotFoundError,
} from '../shared/errors/event.errors.js';

import { toPublicEvent } from '../modules/events/event.mapper.js';
import type { PublicEvent, PublicEventList } from '../modules/events/event.types.js';

import { prisma } from '../lib/prisma.js';
import { createNotification } from '../repositories/notification.repository.js';
import { eventCancelledNotification } from '../shared/notifications/event-notification.messages.js';

export interface CreateEventServiceData {
  title: string;
  description: string;
  venue: string;
  city: string;
  startDate: Date;
  endDate: Date;
  bannerImageUrl?: string | null;
  capacity?: number | null;
}

export interface UpdateEventServiceData {
  title?: string;
  description?: string;
  venue?: string;
  city?: string;
  startDate?: Date;
  endDate?: Date;
  bannerImageUrl?: string | null;
  capacity?: number | null;
}

export interface EventActor {
  accountId: string;
  role: Role;
}

function canManageEvents(role: Role): boolean {
  return role === Role.SUPER_ADMIN || role === Role.ADMIN;
}

function requireEventManager(actor: EventActor): void {
  if (!canManageEvents(actor.role)) {
    throw new EventForbiddenError();
  }
}

/**
 * Creates a new event.
 *
 * New events are always created as DRAFT.
 * The event status is deliberately controlled by the service layer
 * rather than accepting a client-supplied status.
 */
export async function createNewEvent(data: CreateEventServiceData, actor: EventActor) {
  requireEventManager(actor);

  const eventData: CreateEventData = {
    title: data.title,
    description: data.description,
    venue: data.venue,
    city: data.city,
    startDate: data.startDate,
    endDate: data.endDate,
    createdById: actor.accountId,
    status: EventStatus.DRAFT,
    ...(data.bannerImageUrl !== undefined ? { bannerImageUrl: data.bannerImageUrl } : {}),
    ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
  };

  return createEvent(eventData);
}

/**
 * Retrieves a single non-deleted event.
 */
export async function getEventById(id: string) {
  const event = await findEventById(id);

  if (!event) {
    throw new EventNotFoundError(id);
  }

  return event;
}

/**
 * Retrieves a single published, non-deleted event for public discovery.
 */
export async function getPublishedEventById(id: string): Promise<PublicEvent> {
  const event = await getEventById(id);

  if (event.status !== EventStatus.PUBLISHED) {
    throw new EventNotFoundError(id);
  }

  return toPublicEvent(event);
}

/**
 * Retrieves events using the supplied filters and pagination options.
 *
 * Intended for authenticated/admin-facing event management.
 */
export async function listEvents(
  options: FindEventsOptions,
  actor: EventActor,
): Promise<PaginatedEvents> {
  requireEventManager(actor);

  return findEvents(options);
}

/**
 * Retrieves only published, non-deleted events.
 *
 * Intended for public-facing event discovery.
 */
export async function listPublishedEvents(options: FindEventsOptions): Promise<PublicEventList> {
  const result = await findPublishedEvents(options);

  return {
    ...result,
    events: result.events.map(toPublicEvent),
  };
}

/**
 * Updates an existing event.
 *
 * Event lifecycle status is intentionally excluded from arbitrary updates.
 * Publishing and cancellation are handled through dedicated operations.
 */
export async function updateExistingEvent(
  id: string,
  data: UpdateEventServiceData,
  actor: EventActor,
) {
  requireEventManager(actor);

  const event = await getEventById(id);

  if (event.status === EventStatus.CANCELLED) {
    throw new EventInvalidStateError('Cancelled events cannot be updated.');
  }

  if (event.status === EventStatus.COMPLETED) {
    throw new EventInvalidStateError('Completed events cannot be updated.');
  }

  const updateData: UpdateEventData = {
    ...data,
  };

  return updateEvent(id, updateData);
}

/**
 * Publishes an existing event.
 *
 * Publishing is an explicit lifecycle operation and cannot be achieved
 * through the generic update operation.
 */
export async function publishEvent(id: string, actor: EventActor) {
  requireEventManager(actor);

  const event = await getEventById(id);

  if (event.status === EventStatus.PUBLISHED) {
    return event;
  }

  if (event.status === EventStatus.CANCELLED) {
    throw new EventInvalidStateError('Cancelled events cannot be published.');
  }

  if (event.status === EventStatus.COMPLETED) {
    throw new EventInvalidStateError('Completed events cannot be published.');
  }

  return updateEvent(id, {
    status: EventStatus.PUBLISHED,
  });
}

/**
 * Cancels an existing event.
 *
 * Cancellation is an explicit lifecycle operation.
 */

/**
 * Cancels an existing event and notifies affected ticket holders.
 *
 * The event status change and notification inserts run in one transaction.
 * Repeated cancellation requests do not create duplicate notifications.
 */
export async function cancelEvent(id: string, actor: EventActor) {
  requireEventManager(actor);

  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!event) {
      throw new EventNotFoundError(id);
    }

    if (event.status === EventStatus.CANCELLED) {
      return event;
    }

    if (event.status === EventStatus.COMPLETED) {
      throw new EventInvalidStateError('Completed events cannot be cancelled.');
    }

    // Guard the transition so concurrent cancellation requests cannot
    // independently trigger duplicate notifications.
    const result = await tx.event.updateMany({
      where: {
        id,
        deletedAt: null,
        status: {
          not: EventStatus.CANCELLED,
        },
      },
      data: {
        status: EventStatus.CANCELLED,
      },
    });

    if (result.count === 0) {
      const currentEvent = await tx.event.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!currentEvent) {
        throw new EventNotFoundError(id);
      }

      if (currentEvent.status === EventStatus.CANCELLED) {
        return currentEvent;
      }

      throw new EventInvalidStateError('The event could not be cancelled from its current state.');
    }

    const cancelledEvent = await tx.event.findUniqueOrThrow({
      where: { id },
    });

    const ticketHolders = await tx.issuedTicket.findMany({
      where: {
        ticketType: {
          eventId: id,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      select: {
        accountId: true,
      },
      distinct: ['accountId'],
    });

    for (const ticketHolder of ticketHolders) {
      await createNotification(
        eventCancelledNotification(cancelledEvent, ticketHolder.accountId),
        tx,
      );
    }

    return cancelledEvent;
  });
}

/*
 * Completes an existing event.
 * Completion is an explicit lifecycle operation.
 */

export async function completeEvent(id: string, actor: EventActor) {
  requireEventManager(actor);

  const event = await getEventById(id);

  if (event.status === EventStatus.COMPLETED) {
    return event;
  }

  if (event.status === EventStatus.CANCELLED) {
    throw new EventInvalidStateError('Cancelled events cannot be completed.');
  }

  if (event.status === EventStatus.DRAFT) {
    throw new EventInvalidStateError('Draft events cannot be completed.');
  }

  return updateEvent(id, {
    status: EventStatus.COMPLETED,
  });
}

/**
 * Soft-deletes an existing event.
 */
export async function deleteEvent(id: string, actor: EventActor) {
  requireEventManager(actor);

  await getEventById(id);

  return softDeleteEvent(id);
}
