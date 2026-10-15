import type { TicketType } from '../../generated/prisma/client.js';

/**
 * Attendee-safe view of a ticket type.
 *
 * Strips capacity/soldQuantity/deletedAt (internal inventory numbers) and
 * exposes availableQuantity instead — mirrors event.mapper.ts's
 * toPublicEvent() convention.
 *
 * ASSUMPTION: TicketType has no `currency` column (only Payment does).
 * Hardcoded to 'ZMW' to match the single-currency-per-order assumption
 * already made in OrderSummary.tsx. Revisit if ticket types ever need
 * per-type currency.
 */
export interface PublicTicketType {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  status: TicketType['status'];
  availableQuantity: number;
  saleStartAt: Date | null;
  saleEndAt: Date | null;
}

export function toPublicTicketType(ticketType: TicketType): PublicTicketType {
  return {
    id: ticketType.id,
    eventId: ticketType.eventId,
    name: ticketType.name,
    description: ticketType.description,
    price: ticketType.price.toString(),
    currency: 'ZMW',
    status: ticketType.status,
    availableQuantity: ticketType.capacity - ticketType.soldQuantity,
    saleStartAt: ticketType.saleStartAt,
    saleEndAt: ticketType.saleEndAt,
  };
}
