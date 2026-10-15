import { EventStatus, Role, TicketStatus } from '../generated/prisma/enums.js';
import {
  createTicketType,
  findTicketTypeById,
  findTicketTypesByEventId,
  releaseTicketQuantity,
  reserveTicketQuantity,
  softDeleteTicketType,
  updateTicketType,
  type CreateTicketTypeData,
  type FindTicketTypesOptions,
  type PaginatedTicketTypes,
  type UpdateTicketTypeData,
} from '../repositories/ticket.repository.js';
import { getEventById } from './event.service.js';
import {
  TicketForbiddenError,
  TicketInvalidStateError,
  TicketTypeNotFoundError,
} from '../shared/errors/ticket.errors.js';

import { toPublicTicketType, type PublicTicketType } from '../modules/tickets/ticket.mapper.js';

export interface TicketActor {
  accountId: string;
  role: Role;
}

export interface CreateTicketTypeServiceData {
  eventId: string;
  name: string;
  description?: string | null;
  price: CreateTicketTypeData['price'];
  capacity: number;
  saleStartAt?: Date | null;
  saleEndAt?: Date | null;
}

/**
 * `status` is deliberately absent here. Ticket status transitions are only
 * permitted through the dedicated activateTicketType()/deactivateTicketType()
 * functions below, not through the generic update path — the same pattern
 * Events uses for publish/cancel.
 */
export interface UpdateTicketTypeServiceData {
  name?: string;
  description?: string | null;
  price?: UpdateTicketTypeData['price'];
  capacity?: number;
  saleStartAt?: Date | null;
  saleEndAt?: Date | null;
}

function canManageTickets(role: Role): boolean {
  return role === Role.SUPER_ADMIN || role === Role.ADMIN;
}

function requireTicketManager(actor: TicketActor): void {
  if (!canManageTickets(actor.role)) {
    throw new TicketForbiddenError();
  }
}

/**
 * Ensures the event can currently have ticket types administratively
 * managed (created, updated, deleted). This governs ADMIN operations only.
 *
 * It intentionally does NOT govern whether customers can purchase tickets —
 * see requirePurchasableEvent() for that path. Conflating the two would mean
 * ticket sales silently depend on admin-management rules rather than on the
 * event actually being published.
 */
async function requireManageableEvent(eventId: string) {
  const event = await getEventById(eventId);

  if (event.status === EventStatus.CANCELLED) {
    throw new TicketInvalidStateError('Ticket types cannot be managed for cancelled events.');
  }

  if (event.status === EventStatus.COMPLETED) {
    throw new TicketInvalidStateError('Ticket types cannot be managed for completed events.');
  }

  return event;
}

/**
 * Ensures the event is in a state where customers may purchase tickets.
 *
 * Only PUBLISHED events are purchasable. This is deliberately separate from
 * requireManageableEvent(): a published event is exactly the state where
 * purchases should be allowed, and is not something requireManageableEvent()
 * checks for (it only excludes CANCELLED/COMPLETED).
 */
async function requirePurchasableEvent(eventId: string) {
  const event = await getEventById(eventId);

  if (event.status !== EventStatus.PUBLISHED) {
    throw new TicketInvalidStateError('Tickets can only be purchased for published events.');
  }

  return event;
}

/**
 * Creates a new ticket type for an event.
 *
 * Ticket types always start with zero sold quantity.
 * The initial status is controlled by the service rather than the client.
 */
export async function createNewTicketType(data: CreateTicketTypeServiceData, actor: TicketActor) {
  requireTicketManager(actor);

  await requireManageableEvent(data.eventId);

  if (data.capacity <= 0 || !Number.isInteger(data.capacity)) {
    throw new TicketInvalidStateError('Ticket capacity must be a positive whole number.');
  }

  if (
    data.saleStartAt !== null &&
    data.saleStartAt !== undefined &&
    data.saleEndAt !== null &&
    data.saleEndAt !== undefined &&
    data.saleEndAt <= data.saleStartAt
  ) {
    throw new TicketInvalidStateError('Ticket sale end time must be after the sale start time.');
  }

  const ticketTypeData: CreateTicketTypeData = {
    eventId: data.eventId,
    name: data.name,
    price: data.price,
    capacity: data.capacity,
    soldQuantity: 0,
    status: TicketStatus.ACTIVE,
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.saleStartAt !== undefined ? { saleStartAt: data.saleStartAt } : {}),
    ...(data.saleEndAt !== undefined ? { saleEndAt: data.saleEndAt } : {}),
  };

  return createTicketType(ticketTypeData);
}

/**
 * Retrieves a single non-deleted ticket type.
 */
export async function getTicketTypeById(id: string) {
  const ticketType = await findTicketTypeById(id);

  if (!ticketType) {
    throw new TicketTypeNotFoundError(id);
  }

  return ticketType;
}

/**
 * Retrieves ticket types belonging to an event.
 */
export async function listTicketTypes(
  eventId: string,
  options: FindTicketTypesOptions,
  actor: TicketActor,
): Promise<PaginatedTicketTypes> {
  requireTicketManager(actor);

  await requireManageableEvent(eventId);

  return findTicketTypesByEventId(eventId, options);
}

export interface PaginatedPublicTicketTypes {
  ticketTypes: PublicTicketType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Retrieves purchasable (ACTIVE) ticket types for an event, for anonymous
 * attendee-facing callers.
 *
 * Deliberately takes no TicketActor — this is not an admin operation.
 * Only PUBLISHED events expose ticket types publicly, matching the same
 * visibility rule Events already enforces via getPublishedEvents().
 * `status` is forced to ACTIVE server-side rather than trusting the
 * caller, so this can never leak INACTIVE ticket types regardless of
 * what query params are sent.
 */
export async function listPublicTicketTypes(
  eventId: string,
  options: { page: number; limit: number },
): Promise<PaginatedPublicTicketTypes> {
  await requirePurchasableEvent(eventId);

  const result = await findTicketTypesByEventId(eventId, {
    page: options.page,
    limit: options.limit,
    status: TicketStatus.ACTIVE,
  });

  return {
    ticketTypes: result.ticketTypes.map(toPublicTicketType),
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
}

/**
 * Updates an existing ticket type's non-lifecycle fields.
 *
 * Capacity cannot be reduced below the number of tickets already sold.
 * Ticket status cannot be changed here — use activateTicketType() /
 * deactivateTicketType() instead.
 */
export async function updateExistingTicketType(
  id: string,
  data: UpdateTicketTypeServiceData,
  actor: TicketActor,
) {
  requireTicketManager(actor);

  const ticketType = await getTicketTypeById(id);

  await requireManageableEvent(ticketType.eventId);

  if (data.capacity !== undefined && data.capacity < ticketType.soldQuantity) {
    throw new TicketInvalidStateError(
      'Capacity cannot be lower than the number of tickets already sold.',
    );
  }

  if (
    data.saleStartAt !== undefined &&
    data.saleStartAt !== null &&
    data.saleEndAt !== undefined &&
    data.saleEndAt !== null &&
    data.saleEndAt <= data.saleStartAt
  ) {
    throw new TicketInvalidStateError('Ticket sale end time must be after the sale start time.');
  }

  const updateData: UpdateTicketTypeData = {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.price !== undefined ? { price: data.price } : {}),
    ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
    ...(data.saleStartAt !== undefined ? { saleStartAt: data.saleStartAt } : {}),
    ...(data.saleEndAt !== undefined ? { saleEndAt: data.saleEndAt } : {}),
  };
  return updateTicketType(id, updateData);
}

/**
 * Activates a ticket type, making it purchasable (subject to sale window
 * and event-publication checks in reserveTickets()). Idempotent if already
 * active.
 */
export async function activateTicketType(id: string, actor: TicketActor) {
  requireTicketManager(actor);

  const ticketType = await getTicketTypeById(id);

  await requireManageableEvent(ticketType.eventId);

  if (ticketType.status === TicketStatus.ACTIVE) {
    return ticketType;
  }

  return updateTicketType(id, { status: TicketStatus.ACTIVE });
}

/**
 * Deactivates a ticket type, preventing further purchases. Idempotent if
 * already inactive.
 */
export async function deactivateTicketType(id: string, actor: TicketActor) {
  requireTicketManager(actor);

  const ticketType = await getTicketTypeById(id);

  await requireManageableEvent(ticketType.eventId);

  if (ticketType.status === TicketStatus.INACTIVE) {
    return ticketType;
  }

  return updateTicketType(id, { status: TicketStatus.INACTIVE });
}

/**
 * Soft-deletes an existing ticket type.
 *
 * Ticket types with sold inventory cannot be deleted because doing so would
 * destroy the relationship between existing purchases and their ticket
 * definition.
 */
export async function deleteTicketType(id: string, actor: TicketActor) {
  requireTicketManager(actor);

  const ticketType = await getTicketTypeById(id);

  await requireManageableEvent(ticketType.eventId);

  if (ticketType.soldQuantity > 0) {
    throw new TicketInvalidStateError('Ticket types with sold tickets cannot be deleted.');
  }

  return softDeleteTicketType(id);
}

/**
 * Reserves ticket inventory atomically for a purchase.
 *
 * This is the customer-purchase path, not the admin-management path: it
 * checks that the event is PUBLISHED (via requirePurchasableEvent()) rather
 * than checking requireManageableEvent(), and it does not require a
 * TicketActor — reserving inventory is not an admin operation.
 */
export async function reserveTickets(id: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new TicketInvalidStateError('Ticket quantity must be a positive whole number.');
  }

  const ticketType = await getTicketTypeById(id);

  await requirePurchasableEvent(ticketType.eventId);

  if (ticketType.status !== TicketStatus.ACTIVE) {
    throw new TicketInvalidStateError('Tickets are not currently available for purchase.');
  }

  const now = new Date();

  if (ticketType.saleStartAt !== null && ticketType.saleStartAt > now) {
    throw new TicketInvalidStateError('Ticket sales have not started yet.');
  }

  if (ticketType.saleEndAt !== null && ticketType.saleEndAt <= now) {
    throw new TicketInvalidStateError('Ticket sales have ended.');
  }

  return reserveTicketQuantity(id, quantity);
}

/**
 * Releases previously reserved ticket inventory.
 *
 * Intended for order cancellation or payment-failure flows. Deliberately
 * does not repeat the purchase-eligibility checks from reserveTickets() —
 * releasing inventory must succeed even if the event or ticket type has
 * since moved to a non-purchasable state, since this is undoing a prior
 * reservation, not making a new one.
 */
export async function releaseTickets(id: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new TicketInvalidStateError('Ticket quantity must be a positive whole number.');
  }

  return releaseTicketQuantity(id, quantity);
}
