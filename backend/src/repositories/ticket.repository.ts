import { TicketStatus, type Prisma, type TicketType } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import {
  InvalidTicketQuantityError,
  TicketInventoryUnavailableError,
  TicketTypeNotFoundError,
} from '../shared/errors/ticket.errors.js';

export interface CreateTicketTypeData {
  eventId: string;
  name: string;
  description?: string | null;
  price: Prisma.Decimal | number | string;
  capacity: number;
  soldQuantity?: number;
  status?: TicketStatus;
  saleStartAt?: Date | null;
  saleEndAt?: Date | null;
}

export interface UpdateTicketTypeData {
  name?: string;
  description?: string | null;
  price?: Prisma.Decimal | number | string;
  capacity?: number;
  status?: TicketStatus;
  saleStartAt?: Date | null;
  saleEndAt?: Date | null;
}

export interface FindTicketTypesOptions {
  page: number;
  limit: number;
  status?: TicketStatus;
}

export interface PaginatedTicketTypes {
  ticketTypes: TicketType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Asserts that a quantity is a positive integer.
 *
 * This is an invariant assertion, not a domain error. Callers (the service
 * layer, guarded by Zod validation) should never pass an invalid quantity.
 * A failure here indicates a programming error upstream, not a legitimate
 * "inventory unavailable" business state, so it must not be reported as one.
 */
function assertPositiveIntegerQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InvalidTicketQuantityError();
  }
}

/**
 * Creates a ticket type for an event.
 */
export async function createTicketType(data: CreateTicketTypeData): Promise<TicketType> {
  return await prisma.ticketType.create({
    data: {
      eventId: data.eventId,
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      capacity: data.capacity,
      ...(data.soldQuantity !== undefined ? { soldQuantity: data.soldQuantity } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.saleStartAt !== undefined ? { saleStartAt: data.saleStartAt } : {}),
      ...(data.saleEndAt !== undefined ? { saleEndAt: data.saleEndAt } : {}),
    },
  });
}

/**
 * Finds a non-deleted ticket type by ID.
 *
 * Soft-deleted ticket types are intentionally invisible to normal reads.
 */
export async function findTicketTypeById(id: string): Promise<TicketType | null> {
  return await prisma.ticketType.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
}

/**
 * Finds ticket types belonging to an event with pagination.
 *
 * Soft-deleted ticket types are excluded automatically.
 */
export async function findTicketTypesByEventId(
  eventId: string,
  options: FindTicketTypesOptions,
): Promise<PaginatedTicketTypes> {
  const { page, limit, status } = options;

  const where: Prisma.TicketTypeWhereInput = {
    eventId,
    deletedAt: null,
    ...(status !== undefined ? { status } : {}),
  };

  const skip = (page - 1) * limit;

  const [ticketTypes, total] = await prisma.$transaction([
    prisma.ticketType.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
      skip,
      take: limit,
    }),

    prisma.ticketType.count({
      where,
    }),
  ]);

  return {
    ticketTypes,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Updates a non-deleted ticket type.
 *
 * The deletedAt condition is enforced inside the database update itself,
 * preventing soft-deleted records from being modified.
 */
export async function updateTicketType(
  id: string,
  data: UpdateTicketTypeData,
): Promise<TicketType> {
  const result = await prisma.ticketType.updateMany({
    where: {
      id,
      deletedAt: null,
    },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.saleStartAt !== undefined ? { saleStartAt: data.saleStartAt } : {}),
      ...(data.saleEndAt !== undefined ? { saleEndAt: data.saleEndAt } : {}),
    },
  });

  if (result.count === 0) {
    throw new TicketTypeNotFoundError(id);
  }

  const ticketType = await prisma.ticketType.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!ticketType) {
    throw new TicketTypeNotFoundError(id);
  }

  return ticketType;
}

/**
 * Soft-deletes a ticket type.
 *
 * A deleted ticket type cannot be deleted or modified again through the
 * repository's normal mutation paths.
 */
export async function softDeleteTicketType(id: string): Promise<TicketType> {
  const deletedAt = new Date();

  const result = await prisma.ticketType.updateMany({
    where: {
      id,
      deletedAt: null,
    },
    data: {
      deletedAt,
    },
  });

  if (result.count === 0) {
    throw new TicketTypeNotFoundError(id);
  }

  const ticketType = await prisma.ticketType.findUnique({
    where: {
      id,
    },
  });

  if (!ticketType) {
    throw new TicketTypeNotFoundError(id);
  }

  return ticketType;
}

/**
 * Atomically reserves ticket inventory.
 *
 * The inventory constraint is enforced by PostgreSQL:
 *
 * soldQuantity + quantity <= capacity
 *
 * This prevents concurrent purchases from overselling available inventory.
 * The status value is interpolated from the TicketStatus enum (not a raw
 * string literal) so the query stays tied to the same source of truth as
 * the TypeScript type.
 */
export async function reserveTicketQuantity(id: string, quantity: number): Promise<TicketType> {
  assertPositiveIntegerQuantity(quantity);

  const result = await prisma.$executeRaw`
    UPDATE "ticket_types"
    SET
      "soldQuantity" = "soldQuantity" + ${quantity},
      "updatedAt" = NOW()
    WHERE
      "id" = ${id}
      AND "deletedAt" IS NULL
      AND "status" = ${TicketStatus.ACTIVE}::"TicketStatus"
      AND "soldQuantity" + ${quantity} <= "capacity"
  `;

  if (result === 0) {
    const ticketType = await findTicketTypeById(id);

    if (!ticketType) {
      throw new TicketTypeNotFoundError(id);
    }

    throw new TicketInventoryUnavailableError(id);
  }

  const ticketType = await findTicketTypeById(id);

  if (!ticketType) {
    throw new TicketTypeNotFoundError(id);
  }

  return ticketType;
}

/**
 * Atomically releases previously reserved ticket inventory.
 *
 * The database condition prevents soldQuantity from becoming negative.
 */
export async function releaseTicketQuantity(id: string, quantity: number): Promise<TicketType> {
  assertPositiveIntegerQuantity(quantity);

  const result = await prisma.$executeRaw`
    UPDATE "ticket_types"
    SET
      "soldQuantity" = "soldQuantity" - ${quantity},
      "updatedAt" = NOW()
    WHERE
      "id" = ${id}
      AND "deletedAt" IS NULL
      AND "soldQuantity" >= ${quantity}
  `;

  if (result === 0) {
    const ticketType = await findTicketTypeById(id);

    if (!ticketType) {
      throw new TicketTypeNotFoundError(id);
    }

    throw new TicketInventoryUnavailableError(id);
  }

  const ticketType = await findTicketTypeById(id);

  if (!ticketType) {
    throw new TicketTypeNotFoundError(id);
  }

  return ticketType;
}

/**
 * Atomically releases previously reserved ticket inventory inside an
 * existing Prisma transaction.
 *
 * This function intentionally does NOT require deletedAt IS NULL.
 *
 * A ticket type may be soft-deleted after an order has reserved inventory.
 * That reservation still belongs to the order and must be releasable when
 * the order is cancelled or expires.
 *
 * This function is therefore different from normal ticket-type mutation
 * paths: it exists specifically to reconcile an already-existing inventory
 * reservation.
 */
export async function releaseTicketQuantityInTransaction(
  tx: Prisma.TransactionClient,
  id: string,
  quantity: number,
): Promise<TicketType> {
  assertPositiveIntegerQuantity(quantity);

  const result = await tx.$executeRaw`
    UPDATE "ticket_types"
    SET
      "soldQuantity" = "soldQuantity" - ${quantity},
      "updatedAt" = NOW()
    WHERE
      "id" = ${id}
      AND "soldQuantity" >= ${quantity}
  `;

  if (result === 0) {
    const ticketType = await tx.ticketType.findUnique({
      where: {
        id,
      },
    });

    if (!ticketType) {
      throw new TicketTypeNotFoundError(id);
    }

    throw new TicketInventoryUnavailableError(id);
  }

  const ticketType = await tx.ticketType.findUnique({
    where: {
      id,
    },
  });

  if (!ticketType) {
    throw new TicketTypeNotFoundError(id);
  }

  return ticketType;
}
