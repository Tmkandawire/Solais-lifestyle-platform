import { TicketStatus, Role } from '../generated/prisma/enums.js';

import {
  createOrder,
  findAdminOrders,
  findOrderById,
  getAdminOrderById,
  findOrders,
  cancelOrderInTransaction,
  type CreateOrderData,
  type FindAdminOrdersOptions,
  type FindOrdersOptions,
  type AdminOrder,
  type OrderWithItems,
  type PaginatedAdminOrders,
  type PaginatedOrders,
} from '../repositories/order.repository.js';

import {
  findTicketTypeById,
  releaseTicketQuantity,
  reserveTicketQuantity,
} from '../repositories/ticket.repository.js';

import { getEventById } from './event.service.js';

import {
  OrderForbiddenError,
  OrderInvalidStateError,
  OrderNotFoundError,
} from '../shared/errors/order.errors.js';

import type { CreateOrderInput, OrderListQueryInput } from '../modules/orders/order.schemas.js';

export interface OrderActor {
  accountId: string;
  role: Role;
}

export function isAdmin(actor: OrderActor): boolean {
  return actor.role === Role.ADMIN || actor.role === Role.SUPER_ADMIN;
}

export async function getAdminOrder(id: string, actor: OrderActor): Promise<AdminOrder> {
  if (!isAdmin(actor)) {
    throw new OrderForbiddenError();
  }

  return await getAdminOrderById(id);
}

export async function listAdminOrders(
  options: FindAdminOrdersOptions,
  actor: OrderActor,
): Promise<PaginatedAdminOrders> {
  if (!isAdmin(actor)) {
    throw new OrderForbiddenError();
  }

  return await findAdminOrders(options);
}

/**
 * Creates an order from server-resolved ticket pricing.
 *
 * Important invariants:
 * - An order belongs to exactly one account.
 * - An order contains ticket types from exactly one event.
 * - Ticket prices are never trusted from the client.
 * - The event must be published.
 * - Ticket types must be active and purchasable.
 * - Inventory is reserved before the order is persisted.
 *
 * If order creation fails after inventory has been reserved, the
 * reservations are released so inventory is not permanently lost.
 */
export async function createNewOrder(
  data: CreateOrderInput,
  actor: OrderActor,
): Promise<OrderWithItems> {
  const event = await getEventById(data.eventId);

  if (event.status !== 'PUBLISHED') {
    throw new OrderInvalidStateError('Orders can only be created for published events.');
  }

  const ticketTypes = await Promise.all(
    data.items.map((item) => findTicketTypeById(item.ticketTypeId)),
  );

  const resolvedTicketTypes = ticketTypes.filter(
    (ticket): ticket is NonNullable<typeof ticket> => ticket !== null,
  );

  if (resolvedTicketTypes.length !== data.items.length) {
    throw new OrderInvalidStateError('One or more selected ticket types could not be found.');
  }

  for (const ticketType of resolvedTicketTypes) {
    if (ticketType.eventId !== data.eventId) {
      throw new OrderInvalidStateError(
        'All ticket types in an order must belong to the selected event.',
      );
    }

    if (ticketType.deletedAt !== null) {
      throw new OrderInvalidStateError(`Ticket type "${ticketType.name}" is no longer available.`);
    }

    if (ticketType.status !== TicketStatus.ACTIVE) {
      throw new OrderInvalidStateError(
        `Ticket type "${ticketType.name}" is not currently available.`,
      );
    }

    const now = new Date();

    if (ticketType.saleStartAt !== null && ticketType.saleStartAt > now) {
      throw new OrderInvalidStateError(
        `Ticket sales for "${ticketType.name}" have not started yet.`,
      );
    }

    if (ticketType.saleEndAt !== null && ticketType.saleEndAt <= now) {
      throw new OrderInvalidStateError(`Ticket sales for "${ticketType.name}" have ended.`);
    }
  }

  const reserved: Array<{ ticketTypeId: string; quantity: number }> = [];

  try {
    let totalAmount = resolvedTicketTypes[0]!.price.mul(0);

    const items: CreateOrderData['items'] = [];

    for (let index = 0; index < data.items.length; index += 1) {
      const requestedItem = data.items[index]!;
      const ticketType = resolvedTicketTypes[index]!;

      await reserveTicketQuantity(requestedItem.ticketTypeId, requestedItem.quantity);

      reserved.push({
        ticketTypeId: requestedItem.ticketTypeId,
        quantity: requestedItem.quantity,
      });

      const lineTotal = ticketType.price.mul(requestedItem.quantity);
      totalAmount = totalAmount.add(lineTotal);

      items.push({
        ticketTypeId: requestedItem.ticketTypeId,
        ticketTypeName: ticketType.name,
        quantity: requestedItem.quantity,
        unitPrice: ticketType.price,
      });
    }

    const orderData: CreateOrderData = {
      accountId: actor.accountId,
      eventId: data.eventId,
      totalAmount,
      currency: 'ZMW',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      items,
    };

    return await createOrder(orderData);
  } catch (error) {
    for (const reservation of reserved.reverse()) {
      try {
        await releaseTicketQuantity(reservation.ticketTypeId, reservation.quantity);
      } catch {
        // The original error is more important than a secondary rollback
        // failure. Inventory reconciliation can be handled operationally.
      }
    }

    throw error;
  }
}

/**
 * Retrieves an order while enforcing ownership.
 *
 * Administrators may retrieve any order.
 * Attendees may retrieve only their own orders.
 */
export async function getOrder(id: string, actor: OrderActor): Promise<OrderWithItems> {
  const order = await findOrderById(id, isAdmin(actor) ? undefined : actor.accountId);

  if (!order) {
    throw new OrderNotFoundError(id);
  }

  return order;
}

/**
 * Lists orders according to the actor's visibility.
 *
 * Administrators receive the administrative view.
 * Attendees receive only their own orders.
 */
export async function listOrders(
  query: OrderListQueryInput,
  actor: OrderActor,
): Promise<PaginatedOrders> {
  const options: FindOrdersOptions = {
    page: query.page,
    limit: query.limit,
    ...(query.status !== undefined ? { status: query.status } : {}),
    ...(isAdmin(actor) ? {} : { accountId: actor.accountId }),
  };

  return findOrders(options);
}

/**
 * Cancels an order.
 *
 * Only PENDING orders can currently be cancelled.
 *
 * The status transition happens first and is atomically guarded by the
 * repository (only PENDING orders can transition to CANCELLED, scoped to
 * the owning account for non-admins). Inventory is only released *after*
 * that transition succeeds — never before — so there is no window in
 * which released inventory could be claimed by another order while this
 * order's status hasn't actually changed yet.
 */
export async function cancelExistingOrder(id: string, actor: OrderActor): Promise<OrderWithItems> {
  return await cancelOrderInTransaction(id, isAdmin(actor) ? undefined : actor.accountId);
}
