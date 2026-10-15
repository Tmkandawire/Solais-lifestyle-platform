import type { Event } from '../../generated/prisma/client.js';

import type { PublicEvent } from './event.types.js';

export function toPublicEvent(event: Event): PublicEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    venue: event.venue,
    city: event.city,
    startDate: event.startDate,
    endDate: event.endDate,
    bannerImageUrl: event.bannerImageUrl,
    capacity: event.capacity,
    status: event.status,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}
