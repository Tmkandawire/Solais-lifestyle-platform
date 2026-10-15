import type { IssuedTicket, Prisma } from '../generated/prisma/client.js';
import { IssuedTicketStatus } from '../generated/prisma/enums.js';

import { prisma } from '../lib/prisma.js';
import {
  IssuedTicketNotFoundError,
  IssuedTicketAlreadyCheckedInError,
  IssuedTicketCancelledError,
  IssuedTicketEventMismatchError,
} from '../shared/errors/issued-ticket.errors.js';

const checkInSelect = {
  id: true,
  ticketNumber: true,
  status: true,
  checkedInAt: true,
  ticketType: {
    select: {
      id: true,
      name: true,
    },
  },
  orderItem: {
    select: {
      order: {
        select: {
          event: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.IssuedTicketSelect;

export interface CreateIssuedTicketData {
  orderItemId: string;
  ticketTypeId: string;
  accountId: string;
  ticketNumber: string;
  qrTokenHash: string;
  qrTokenEncrypted: string;
}

export interface FindIssuedTicketsOptions {
  page: number;
  limit: number;
  accountId?: string;
  orderItemId?: string;
  status?: IssuedTicketStatus;
}

export type IssuedTicketWithDetails = Prisma.IssuedTicketGetPayload<{
  include: {
    ticketType: {
      select: {
        id: true;
        name: true;
        price: true;
      };
    };
    orderItem: {
      select: {
        orderId: true;
        order: {
          select: {
            id: true;
            event: {
              select: {
                id: true;
                title: true;
                venue: true;
                city: true;
                startDate: true;
                endDate: true;
                bannerImageUrl: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export interface PaginatedIssuedTickets {
  tickets: IssuedTicketWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type IssuedTicketCheckInDetails = Prisma.IssuedTicketGetPayload<{
  select: typeof checkInSelect;
}>;

/**
 * Creates an individual issued ticket.
 *
 * An issued ticket represents one attendee admission generated from a
 * successfully paid order item.
 *
 * The repository receives already-validated values from the service layer.
 * It does not decide whether the order is paid or whether the attendee is
 * authorized to receive the ticket.
 */
export async function createIssuedTicket(data: CreateIssuedTicketData): Promise<IssuedTicket> {
  return await prisma.issuedTicket.create({
    data: {
      orderItemId: data.orderItemId,
      ticketTypeId: data.ticketTypeId,
      accountId: data.accountId,
      ticketNumber: data.ticketNumber,
      qrTokenHash: data.qrTokenHash,
      qrTokenEncrypted: data.qrTokenEncrypted,
    },
  });
}

/**
 * Creates multiple issued tickets atomically.
 *
 * This is used when an order contains multiple ticket quantities.
 * Either all tickets are created or the transaction fails.
 */
export async function createIssuedTickets(data: CreateIssuedTicketData[]): Promise<IssuedTicket[]> {
  if (data.length === 0) {
    return [];
  }

  return await prisma.$transaction(
    data.map((ticket) =>
      prisma.issuedTicket.create({
        data: {
          orderItemId: ticket.orderItemId,
          ticketTypeId: ticket.ticketTypeId,
          accountId: ticket.accountId,
          ticketNumber: ticket.ticketNumber,
          qrTokenHash: ticket.qrTokenHash,
          qrTokenEncrypted: ticket.qrTokenEncrypted,
        },
      }),
    ),
  );
}

/**
 * Creates issued tickets using an existing Prisma transaction.
 *
 * This is used by workflows that must create tickets atomically together
 * with other database state changes, such as payment completion.
 */
export async function createIssuedTicketsInTransaction(
  tx: Prisma.TransactionClient,
  data: CreateIssuedTicketData[],
): Promise<IssuedTicket[]> {
  if (data.length === 0) {
    return [];
  }

  return await Promise.all(
    data.map((ticket) =>
      tx.issuedTicket.create({
        data: {
          orderItemId: ticket.orderItemId,
          ticketTypeId: ticket.ticketTypeId,
          accountId: ticket.accountId,
          ticketNumber: ticket.ticketNumber,
          qrTokenHash: ticket.qrTokenHash,
          qrTokenEncrypted: ticket.qrTokenEncrypted,
        },
      }),
    ),
  );
}

/**
 * Finds an issued ticket by its public ticket ID.
 *
 * This does not expose or search using the raw QR credential.
 */
export async function findIssuedTicketById(id: string): Promise<IssuedTicket | null> {
  return await prisma.issuedTicket.findUnique({
    where: {
      id,
    },
  });
}

/**
 * Finds an issued ticket by ID or throws the standard not-found error.
 */
export async function getIssuedTicketById(id: string): Promise<IssuedTicket> {
  const ticket = await findIssuedTicketById(id);

  if (!ticket) {
    throw new IssuedTicketNotFoundError(id);
  }

  return ticket;
}

/**
 * Finds an issued ticket using the hash of the QR credential.
 *
 * The raw credential contained in the QR code is never persisted.
 */
export async function findIssuedTicketByQrTokenHash(
  qrTokenHash: string,
): Promise<IssuedTicket | null> {
  return await prisma.issuedTicket.findUnique({
    where: {
      qrTokenHash,
    },
  });
}

/**
 * Retrieves all issued tickets belonging to an order item.
 */
export async function findIssuedTicketsByOrderItemId(orderItemId: string): Promise<IssuedTicket[]> {
  return await prisma.issuedTicket.findMany({
    where: {
      orderItemId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

/**
 * Retrieves all issued tickets belonging to an account.
 */
export async function findIssuedTicketsByAccountId(
  accountId: string,
  options: FindIssuedTicketsOptions,
): Promise<PaginatedIssuedTickets> {
  const { page, limit, orderItemId, status } = options;

  const where: Prisma.IssuedTicketWhereInput = {
    accountId,
    ...(orderItemId !== undefined ? { orderItemId } : {}),
    ...(status !== undefined ? { status } : {}),
  };

  const skip = (page - 1) * limit;

  const [tickets, total] = await prisma.$transaction([
    prisma.issuedTicket.findMany({
      where,
      include: {
        ticketType: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        orderItem: {
          select: {
            orderId: true,
            order: {
              select: {
                id: true,
                event: {
                  select: {
                    id: true,
                    title: true,
                    venue: true,
                    city: true,
                    startDate: true,
                    endDate: true,
                    bannerImageUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),

    prisma.issuedTicket.count({
      where,
    }),
  ]);

  return {
    tickets,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Atomically checks an issued ticket in.
 *
 * The ticket can only transition from ISSUED to CHECKED_IN.
 *
 * The status condition is part of the same database UPDATE as the state
 * transition. This prevents two concurrent scanners from successfully
 * checking in the same ticket.
 *
 * If the update affects zero rows, the current ticket state is inspected
 * so the caller receives the appropriate domain error.
 */
export async function checkInIssuedTicket(
  id: string,
  eventId: string,
  checkedInById: string,
): Promise<IssuedTicketCheckInDetails> {
  const result = await prisma.issuedTicket.updateMany({
    where: {
      id,
      status: IssuedTicketStatus.ISSUED,
      orderItem: {
        order: {
          eventId,
        },
      },
    },
    data: {
      status: IssuedTicketStatus.CHECKED_IN,
      checkedInAt: new Date(),
      checkedInById,
    },
  });

  if (result.count === 0) {
    const ticket = await prisma.issuedTicket.findUnique({
      where: {
        id,
      },
      select: {
        ticketNumber: true,
        status: true,
        checkedInAt: true,
        orderItem: {
          select: {
            order: {
              select: {
                eventId: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new IssuedTicketNotFoundError(id);
    }

    if (ticket.orderItem.order.eventId !== eventId) {
      throw new IssuedTicketEventMismatchError();
    }

    if (ticket.status === IssuedTicketStatus.CANCELLED) {
      throw new IssuedTicketCancelledError(id);
    }

    throw new IssuedTicketAlreadyCheckedInError(id, {
      ticketNumber: ticket.ticketNumber,
      checkedInAt: ticket.checkedInAt,
    });
  }

  return await prisma.issuedTicket.findUniqueOrThrow({
    where: { id },
    select: checkInSelect,
  });
}
