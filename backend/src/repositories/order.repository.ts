import { OrderStatus } from '../generated/prisma/enums.js';

import type {
  EventStatus,
  IssuedTicketStatus,
  PaymentProvider,
  PaymentStatus,
  Role,
} from '../generated/prisma/enums.js';

import type { Prisma, Order, OrderItem } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { cancelPendingPaymentByOrderIdInTransaction } from './payment.repository.js';
import { releaseTicketQuantityInTransaction } from './ticket.repository.js';
import { createNotification } from './notification.repository.js';

import {
  orderCreatedNotification,
  orderCancelledNotification,
  orderExpiredNotification,
} from '../shared/notifications/order-notification.messages.js';
import { OrderInvalidStateError, OrderNotFoundError } from '../shared/errors/order.errors.js';

export interface CreateOrderItemData {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: Prisma.Decimal | string;
}

export interface CreateOrderData {
  accountId: string;
  eventId: string;
  totalAmount: Prisma.Decimal | string;
  currency: string;
  expiresAt: Date;
  items: CreateOrderItemData[];
}

export interface FindOrdersOptions {
  page: number;
  limit: number;
  status?: OrderStatus;
  accountId?: string;
}

export interface FindAdminOrdersOptions {
  page: number;
  limit: number;
  status?: OrderStatus | undefined;
  eventId?: string | undefined;
  paymentStatus?: PaymentStatus | undefined;
  paymentProvider?: PaymentProvider | undefined;
  search?: string | undefined;
}

export interface OrderPaymentSummary {
  id: string;
  status: PaymentStatus;
  provider: PaymentProvider;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  payment: OrderPaymentSummary | null;
}

export interface AdminOrderAccountSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface AdminOrderEventSummary {
  id: string;
  title: string;
  venue: string;
  city: string;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
}

export interface AdminOrderPaymentSummary {
  id: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  amount: Prisma.Decimal;
  currency: string;
  providerReference: string | null;
  failureReason: string | null;
  paidAt: Date | null;
}

export interface AdminIssuedTicket {
  id: string;
  ticketNumber: string;
  status: IssuedTicketStatus;
  checkedInAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminOrderItem {
  id: string;
  orderId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
  createdAt: Date;
  issuedTickets: AdminIssuedTicket[];
}

export interface AdminOrder extends Order {
  account: AdminOrderAccountSummary;
  event: AdminOrderEventSummary;
  items: AdminOrderItem[];
  payment: AdminOrderPaymentSummary | null;
}

export interface PaginatedAdminOrders {
  orders: AdminOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedOrders {
  orders: OrderWithItems[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const orderInclude = {
  items: true,
  payment: {
    select: {
      id: true,
      status: true,
      provider: true,
    },
  },
} satisfies Prisma.OrderInclude;

const adminOrderInclude = {
  account: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
    },
  },

  event: {
    select: {
      id: true,
      title: true,
      venue: true,
      city: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  },

  items: {
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      issuedTickets: {
        select: {
          id: true,
          ticketNumber: true,
          status: true,
          checkedInAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  },

  payment: {
    select: {
      id: true,
      status: true,
      provider: true,
      amount: true,
      currency: true,
      providerReference: true,
      failureReason: true,
      paidAt: true,
    },
  },
} satisfies Prisma.OrderInclude;

/**
 * Creates an order and its line items atomically.
 *
 * The repository receives already-validated server-side values. It does not
 * calculate prices, validate ticket availability, or decide whether the
 * account is authorized to place the order. Those responsibilities belong
 * to the service layer.
 *
 * Creating the order and all of its items in one Prisma transaction ensures
 * we never persist an order without its corresponding line items.
 */

export async function createOrder(data: CreateOrderData): Promise<OrderWithItems> {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        accountId: data.accountId,
        eventId: data.eventId,
        totalAmount: data.totalAmount,
        currency: data.currency,
        expiresAt: data.expiresAt,
        items: {
          create: data.items.map((item) => ({
            ticketTypeId: item.ticketTypeId,
            ticketTypeName: item.ticketTypeName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: orderInclude,
    });

    await createNotification(orderCreatedNotification(order), tx);

    return order;
  });
}

/**
 * Finds an order by ID.
 *
 * The accountId filter is optional because administrators may retrieve
        },
      },
    },
  });
}

/**
 * Finds an order by ID.
 *
 * The accountId filter is optional because administrators may retrieve
 * orders across accounts, while ordinary attendees should be restricted
 * to their own orders by the service layer.
 */
export async function findOrderById(
  id: string,
  accountId?: string,
): Promise<OrderWithItems | null> {
  return await prisma.order.findFirst({
    where: {
      id,
      ...(accountId !== undefined ? { accountId } : {}),
    },
    include: orderInclude,
  });
}

/**
 * Finds an order by ID or throws the repository's standard not-found error.
 *
 * Ownership is still optionally enforced through accountId.
 */
export async function getOrderById(id: string, accountId?: string): Promise<OrderWithItems> {
  const order = await findOrderById(id, accountId);

  if (!order) {
    throw new OrderNotFoundError(id);
  }

  return order;
}

/**
 * Retrieves a complete administrative view of an order.
 *
 * Unlike the attendee order query, the administrative view includes
 * customer/account information, event information, and the complete
 * payment summary.
 */
export async function getAdminOrderById(id: string): Promise<AdminOrder> {
  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: adminOrderInclude,
  });

  if (!order) {
    throw new OrderNotFoundError(id);
  }

  return order;
}

/**
 * Lists orders with pagination.
 *
 * accountId can be supplied to scope results to one attendee. Omitting it
 * allows the service layer to request an administrative view.
 */
export async function findOrders(options: FindOrdersOptions): Promise<PaginatedOrders> {
  const { page, limit, status, accountId } = options;

  const where: Prisma.OrderWhereInput = {
    ...(accountId !== undefined ? { accountId } : {}),
    ...(status !== undefined ? { status } : {}),
  };

  const skip = (page - 1) * limit;

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          id: 'desc',
        },
      ],
      skip,
      take: limit,
    }),

    prisma.order.count({
      where,
    }),
  ]);

  return {
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Lists orders for the administrative order management screen.
 *
 * This intentionally uses the administrative include so the frontend can
 * display customer, event, order, and payment information without making
 * N+1 requests for every row.
 */
export async function findAdminOrders(
  options: FindAdminOrdersOptions,
): Promise<PaginatedAdminOrders> {
  const { page, limit, status, eventId, paymentStatus, paymentProvider, search } = options;

  const normalizedSearch = search?.trim();

  const where: Prisma.OrderWhereInput = {
    ...(status !== undefined ? { status } : {}),

    ...(eventId !== undefined ? { eventId } : {}),

    ...(paymentStatus !== undefined || paymentProvider !== undefined
      ? {
          payment: {
            ...(paymentStatus !== undefined ? { status: paymentStatus } : {}),
            ...(paymentProvider !== undefined ? { provider: paymentProvider } : {}),
          },
        }
      : {}),

    ...(normalizedSearch
      ? {
          OR: [
            {
              id: {
                contains: normalizedSearch,
                mode: 'insensitive',
              },
            },
            {
              account: {
                firstName: {
                  contains: normalizedSearch,
                  mode: 'insensitive',
                },
              },
            },
            {
              account: {
                lastName: {
                  contains: normalizedSearch,
                  mode: 'insensitive',
                },
              },
            },
            {
              account: {
                email: {
                  contains: normalizedSearch,
                  mode: 'insensitive',
                },
              },
            },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * limit;

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      include: adminOrderInclude,
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          id: 'desc',
        },
      ],
      skip,
      take: limit,
    }),

    prisma.order.count({
      where,
    }),
  ]);

  return {
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Updates an order's status, atomically guarded against invalid transitions
 * and, optionally, ownership.
 *
 * `updateMany` (rather than `update`) is required here: Prisma's `update()`
 * only accepts unique fields in its `where` clause, so it cannot express
 * "and only if it belongs to this account" or "and only if it is still in
 * an expected status." Folding those conditions into the same query as the
 * write is what makes the guard atomic — checking status first and writing
 * second (two separate queries) would leave a window for another process to
 * change the row in between.
 *
 * `fromStatuses`, when supplied, restricts the transition to rows currently
 * in one of those statuses (e.g. only PENDING orders may become CANCELLED).
 * `accountId`, when supplied, additionally restricts the transition to
 * orders owned by that account.
 *
 * Because the guard can fail for two different reasons — the order doesn't
 * exist/isn't owned by this account, versus the order exists but isn't in
 * an eligible status — a zero-row result triggers a second read to
 * disambiguate them, so callers get the correct error (and HTTP status)
 * rather than a generic not-found for what is actually a state conflict.
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  options?: {
    accountId?: string;
    fromStatuses?: OrderStatus[];
  },
): Promise<OrderWithItems> {
  const { accountId, fromStatuses } = options ?? {};

  const result = await prisma.order.updateMany({
    where: {
      id,
      ...(accountId !== undefined ? { accountId } : {}),
      ...(fromStatuses !== undefined ? { status: { in: fromStatuses } } : {}),
    },
    data: {
      status,
      ...(status === OrderStatus.CANCELLED
        ? {
            cancelledAt: new Date(),
          }
        : {}),
    },
  });

  if (result.count === 0) {
    const existing = await findOrderById(id, accountId);

    if (!existing) {
      throw new OrderNotFoundError(id);
    }

    // The order exists and is owned correctly, so the guard must have
    // failed on `fromStatuses` — a genuine state conflict, not a 404.
    throw new OrderInvalidStateError(
      `Order "${id}" cannot transition from ${existing.status} to ${status}.`,
    );
  }

  return await getOrderById(id, accountId);
}

/**
 * Atomically transitions an order from PENDING to PAID using an existing
 * Prisma transaction.
 *
 * This is used by the successful-payment workflow so payment, order
 * finalisation, and ticket issuance commit or roll back together.
 */
export async function markOrderPaidInTransaction(
  tx: Prisma.TransactionClient,
  id: string,
  paidAt: Date,
): Promise<OrderWithItems> {
  const result = await tx.order.updateMany({
    where: {
      id,
      status: OrderStatus.PENDING,
      expiresAt: {
        gt: paidAt,
      },
    },
    data: {
      status: OrderStatus.PAID,
      paidAt,
    },
  });

  if (result.count === 0) {
    const existing = await tx.order.findUnique({
      where: { id },
      include: orderInclude,
    });

    if (!existing) {
      throw new OrderNotFoundError(id);
    }

    if (existing.status !== OrderStatus.PENDING) {
      throw new OrderInvalidStateError(
        `Order "${id}" cannot be marked as paid from its current status.`,
      );
    }

    throw new OrderInvalidStateError(
      `Order "${id}" has expired and can no longer be marked as paid.`,
    );
  }

  return await tx.order.findUniqueOrThrow({
    where: { id },
    include: orderInclude,
  });
}

/**
 * Cancels a pending order and releases all reserved ticket inventory
 * atomically.
 *
 * The order status transition, pending payment cancellation, and every
 * inventory release occur inside the same database transaction. If any
 * inventory release or payment cancellation fails, the entire transaction
 * rolls back and the order remains PENDING.
 */
export async function cancelOrderInTransaction(
  id: string,
  accountId?: string,
): Promise<OrderWithItems> {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        id,
        ...(accountId !== undefined ? { accountId } : {}),
      },
      include: orderInclude,
    });

    if (!order) {
      throw new OrderNotFoundError(id);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new OrderInvalidStateError(
        `Order "${id}" cannot be cancelled from its current status.`,
      );
    }

    const result = await tx.order.updateMany({
      where: {
        id,
        status: OrderStatus.PENDING,
        ...(accountId !== undefined ? { accountId } : {}),
      },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new OrderInvalidStateError(
        `Order "${id}" cannot be cancelled from its current status.`,
      );
    }

    await cancelPendingPaymentByOrderIdInTransaction(tx, id);

    const itemsForRelease = [...order.items].sort((a, b) =>
      a.ticketTypeId.localeCompare(b.ticketTypeId),
    );

    for (const item of itemsForRelease) {
      await releaseTicketQuantityInTransaction(tx, item.ticketTypeId, item.quantity);
    }

    const cancelledOrder = await tx.order.findUniqueOrThrow({
      where: { id },
      include: orderInclude,
    });

    await createNotification(
      orderCancelledNotification(cancelledOrder, {
        byOwner: accountId !== undefined,
      }),
      tx,
    );

    return cancelledOrder;
  });
}

/**
 * Finds a bounded batch of pending orders whose expiry time has passed.
 *
 * This function only discovers candidates. It does not change order state
 * or release inventory. Each returned order must subsequently be processed
 * through expireOrderInTransaction(), which performs the guarded transition
 * and inventory/payment cleanup atomically.
 */
export async function findExpiredPendingOrderIds(
  now: Date,
  limit: number,
  excludeIds: readonly string[] = [],
): Promise<string[]> {
  const orders = await prisma.order.findMany({
    where: {
      status: OrderStatus.PENDING,
      expiresAt: {
        lte: now,
      },
      ...(excludeIds.length > 0 ? { id: { notIn: [...excludeIds] } } : {}),
    },
    orderBy: [{ expiresAt: 'asc' }, { id: 'asc' }],
    take: limit,
    select: {
      id: true,
    },
  });

  return orders.map((order) => order.id);
}

/**
 * Expires one pending order whose expiry time has passed.
 *
 * The following operations are performed atomically:
 *
 *   Order:   PENDING → EXPIRED
 *   Payment: PENDING → CANCELLED (when one exists)
 *   Tickets: reserved inventory is released
 *
 * If any operation fails, the entire transaction rolls back.
 *
 * The order transition is guarded by both status and expiry time. This means
 * callers may safely attempt to expire the same order concurrently without
 * releasing inventory more than once.
 */
export async function expireOrderInTransaction(
  id: string,
  now: Date,
): Promise<OrderWithItems | null> {
  return await prisma.$transaction(async (tx) => {
    /*
     * Read the pending expired order and its items inside this transaction.
     *
     * The lifecycle transition below is independently guarded by the same
     * PENDING + expired conditions, so inventory is only released when this
     * transaction successfully owns the PENDING → EXPIRED transition.
     */
    const order = await tx.order.findFirst({
      where: {
        id,
        status: OrderStatus.PENDING,
        expiresAt: {
          lte: now,
        },
      },
      include: orderInclude,
    });

    if (!order) {
      return null;
    }

    /*
     * Guard the lifecycle transition itself.
     *
     * Another payment/cancellation/expiry request may have changed the
     * order after the initial read. Only the request that successfully
     * changes PENDING → EXPIRED is allowed to release inventory.
     */
    const result = await tx.order.updateMany({
      where: {
        id,
        status: OrderStatus.PENDING,
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: OrderStatus.EXPIRED,
      },
    });

    if (result.count === 0) {
      return null;
    }

    /*
     * Cancel the associated pending payment, if one exists.
     *
     * A payment may not exist because expiry is allowed to happen before
     * the attendee creates a payment.
     */
    await cancelPendingPaymentByOrderIdInTransaction(tx, id);

    /*
     * Release every reservation belonging to this order.
     *
     * These releases participate in the SAME transaction as the order
     * transition and payment cancellation.
     */
    const itemsForRelease = [...order.items].sort((a, b) =>
      a.ticketTypeId.localeCompare(b.ticketTypeId),
    );

    for (const item of itemsForRelease) {
      await releaseTicketQuantityInTransaction(tx, item.ticketTypeId, item.quantity);
    }

    const expiredOrder = await tx.order.findUniqueOrThrow({
      where: {
        id,
      },
      include: orderInclude,
    });

    await createNotification(orderExpiredNotification(expiredOrder), tx);

    return expiredOrder;
  });
}
