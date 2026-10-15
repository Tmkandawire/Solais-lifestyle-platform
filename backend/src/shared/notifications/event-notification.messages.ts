import type { Event } from '../../generated/prisma/client.js';
import type { CreateNotificationData } from '../../repositories/notification.repository.js';

type EventNotificationReference = Pick<Event, 'id' | 'title'>;

/**
 * Notification copy for event lifecycle changes.
 *
 * Pure functions with deterministic content and app-relative action URLs.
 */
export function eventCancelledNotification(
  event: EventNotificationReference,
  accountId: string,
): CreateNotificationData {
  return {
    accountId,
    type: 'EVENT',
    title: 'Event cancelled',
    message: `The event "${event.title}" has been cancelled. Please contact support if you need assistance with your booking.`,
    actionUrl: `/events/${event.id}`,
  };
}

export function eventDetailsUpdatedNotification(
  event: EventNotificationReference,
  accountId: string,
): CreateNotificationData {
  return {
    accountId,
    type: 'EVENT',
    title: 'Event details updated',
    message: `The details for "${event.title}" have changed. Please review the event information.`,
    actionUrl: `/events/${event.id}`,
  };
}
