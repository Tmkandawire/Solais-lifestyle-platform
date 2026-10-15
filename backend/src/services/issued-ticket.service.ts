import { randomBytes, createHash } from 'node:crypto';

import {
  createIssuedTicketsInTransaction,
  findIssuedTicketByQrTokenHash,
  findIssuedTicketsByAccountId,
  findIssuedTicketsByOrderItemId,
  getIssuedTicketById,
  checkInIssuedTicket,
} from '../repositories/issued-ticket.repository.js';
import type {
  CreateIssuedTicketData,
  FindIssuedTicketsOptions,
  IssuedTicketCheckInDetails,
  IssuedTicketWithDetails,
} from '../repositories/issued-ticket.repository.js';
import type { IssuedTicket } from '../generated/prisma/client.js';
import { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../shared/errors/api-error.js';

import { decryptQrCredential, encryptQrCredential } from '../utils/qr-credential-encryption.js';

const TICKET_NUMBER_PREFIX = 'SOL';

/**
 * Hashes a raw QR credential using the algorithm used at issuance.
 *
 * Exported so every caller resolving a scanned QR code hashes it exactly
 * the same way it was hashed when the ticket was created, instead of each
 * caller reimplementing (and potentially mismatching) the hashing logic.
 */
export function hashQrCredential(credential: string): string {
  return createHash('sha256').update(credential).digest('hex');
}

/**
 * Converts issued ticket check-in details to a staff check-in result.
 */
export function toStaffCheckInResult(t: IssuedTicketCheckInDetails): StaffCheckInResult {
  return {
    id: t.id,
    ticketNumber: t.ticketNumber,
    status: t.status,
    checkedInAt: t.checkedInAt,
    ticketType: t.ticketType,
    event: t.orderItem.order.event,
  };
}

export interface IssuedTicketSummary {
  id: string;
  ticketNumber: string;
  status: IssuedTicket['status'];
  checkedInAt: Date | null;
  ticketTypeId: string;
  orderItemId: string;
  accountId: string;
  createdAt: Date;
}

export function toIssuedTicketSummary(ticket: IssuedTicket): IssuedTicketSummary {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    status: ticket.status,
    checkedInAt: ticket.checkedInAt,
    ticketTypeId: ticket.ticketTypeId,
    orderItemId: ticket.orderItemId,
    accountId: ticket.accountId,
    createdAt: ticket.createdAt,
  };
}

/**
 * Generates a cryptographically strong QR credential and its hash.
 *
 * The raw credential is returned to the immediate caller for QR payload
 * creation. Only its hash and encrypted form are persisted:
 *
 * - The hash is used to resolve scanned QR credentials.
 * - The encrypted form allows the original credential to be retrieved
 *   securely for the attendee's ticket.
 */
function generateQrCredential(): {
  credential: string;
  hash: string;
  encrypted: string;
} {
  const credential = randomBytes(32).toString('base64url');

  return {
    credential,
    hash: hashQrCredential(credential),
    encrypted: encryptQrCredential(credential),
  };
}

function generateTicketNumber(): string {
  return `${TICKET_NUMBER_PREFIX}-${randomBytes(6).toString('hex').toUpperCase()}`;
}

export interface IssueTicketsRequest {
  orderItemId: string;
  ticketTypeId: string;
  accountId: string;
  quantity: number;
}

export interface IssuedTicketWithCredential {
  ticket: IssuedTicket;
  qrCredential: string;
}

export interface AttendeeIssuedTicket {
  id: string;
  ticketNumber: string;
  status: IssuedTicket['status'];
  createdAt: Date;
  ticketType: {
    id: string;
    name: string;
    price: string;
  };
  order: {
    id: string;
  };
  event: {
    id: string;
    title: string;
    venue: string;
    city: string;
    startDate: Date;
    endDate: Date;
    bannerImageUrl: string | null;
  };
}

export interface PaginatedAttendeeTickets {
  tickets: AttendeeIssuedTicket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StaffCheckInResult {
  id: string;
  ticketNumber: string;
  status: IssuedTicket['status'];
  checkedInAt: Date | null;
  ticketType: {
    id: string;
    name: string;
  };
  event: {
    id: string;
    title: string;
  };
}

function toAttendeeIssuedTicket(ticket: IssuedTicketWithDetails): AttendeeIssuedTicket {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    status: ticket.status,
    createdAt: ticket.createdAt,
    ticketType: {
      id: ticket.ticketType.id,
      name: ticket.ticketType.name,
      price: ticket.ticketType.price.toString(),
    },
    order: {
      id: ticket.orderItem.order.id,
    },
    event: {
      id: ticket.orderItem.order.event.id,
      title: ticket.orderItem.order.event.title,
      venue: ticket.orderItem.order.event.venue,
      city: ticket.orderItem.order.event.city,
      startDate: ticket.orderItem.order.event.startDate,
      endDate: ticket.orderItem.order.event.endDate,
      bannerImageUrl: ticket.orderItem.order.event.bannerImageUrl,
    },
  };
}

/**
 * Issues the individual attendee tickets belonging to a successfully paid
 * order using an existing Prisma transaction.
 *
 * This contains the ticket-generation and ticket-validation logic used by
 * both standalone issuance and the payment-completion workflow.
 */
export async function issueTicketsForOrderInTransaction(
  tx: Prisma.TransactionClient,
  requests: IssueTicketsRequest[],
): Promise<IssuedTicketWithCredential[]> {
  if (requests.length === 0) {
    throw new ApiError({
      statusCode: 400,
      message: 'At least one ticket request must be provided.',
    });
  }

  for (const request of requests) {
    if (!Number.isInteger(request.quantity) || request.quantity < 1) {
      throw new ApiError({
        statusCode: 400,
        message: 'Ticket quantity must be a positive whole number.',
      });
    }
  }

  /*
   * Check for existing tickets using the SAME transaction.
   *
   * This prevents the ticket-existence check from occurring outside the
   * payment-completion transaction.
   */
  const existingByOrderItem = await Promise.all(
    requests.map((request) =>
      tx.issuedTicket.findMany({
        where: {
          orderItemId: request.orderItemId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ),
  );

  for (let index = 0; index < requests.length; index += 1) {
    const request = requests[index];
    const existingTickets = existingByOrderItem[index];

    if (request && existingTickets && existingTickets.length > 0) {
      throw new ApiError({
        statusCode: 409,
        message: `Tickets have already been issued for order item "${request.orderItemId}".`,
      });
    }
  }

  const credentials: { credential: string; hash: string; encrypted: string }[] = [];
  const data: CreateIssuedTicketData[] = [];

  for (const request of requests) {
    for (let i = 0; i < request.quantity; i += 1) {
      const generated = generateQrCredential();

      credentials.push(generated);

      data.push({
        orderItemId: request.orderItemId,
        ticketTypeId: request.ticketTypeId,
        accountId: request.accountId,
        ticketNumber: generateTicketNumber(),
        qrTokenHash: generated.hash,
        qrTokenEncrypted: generated.encrypted,
      });
    }
  }

  let tickets: IssuedTicket[];

  try {
    tickets = await createIssuedTicketsInTransaction(tx, data);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ApiError({
        statusCode: 409,
        message: 'A ticket credential collision occurred while issuing tickets. Please retry.',
      });
    }

    throw error;
  }

  return tickets.map((ticket, index) => {
    const credential = credentials[index];

    if (!credential) {
      throw new ApiError({
        statusCode: 500,
        message: 'Issued ticket credential mapping failed.',
      });
    }

    return {
      ticket,
      qrCredential: credential.credential,
    };
  });
}

/**
 * Issues tickets using a dedicated transaction when ticket issuance is
 * performed independently of another larger workflow.
 */
export async function issueTicketsForOrder(
  requests: IssueTicketsRequest[],
): Promise<IssuedTicketWithCredential[]> {
  return await prisma.$transaction(async (tx) => {
    return await issueTicketsForOrderInTransaction(tx, requests);
  });
}

/**
 * Retrieves a single issued ticket by ID.
 */
export async function getIssuedTicket(id: string): Promise<IssuedTicket> {
  return await getIssuedTicketById(id);
}

/**
 * Retrieves and decrypts the QR credential for an issued ticket.
 *
 * The caller must enforce ticket ownership or staff authorization before
 * invoking this function.
 */
export async function getIssuedTicketQrCredential(ticketId: string): Promise<string> {
  const ticket = await getIssuedTicketById(ticketId);

  const encryptedCredential: unknown = ticket.qrTokenEncrypted;

  if (typeof encryptedCredential !== 'string' || encryptedCredential.length === 0) {
    throw new ApiError({
      statusCode: 409,
      message: 'QR credentials are not available for this ticket.',
    });
  }

  try {
    return decryptQrCredential(encryptedCredential);
  } catch {
    throw new ApiError({
      statusCode: 500,
      message: 'Unable to retrieve the ticket QR credential.',
    });
  }
}

/**
 * Retrieves all issued tickets belonging to an order item.
 */
export async function getIssuedTicketsByOrderItem(orderItemId: string): Promise<IssuedTicket[]> {
  return await findIssuedTicketsByOrderItemId(orderItemId);
}

/**
 * Retrieves an attendee's issued tickets.
 *
 * Returns only the fields required by the attendee-facing API.
 * Internal QR credential hashes are never exposed.
 */
export async function getIssuedTicketsByAccount(
  accountId: string,
  options: FindIssuedTicketsOptions,
): Promise<PaginatedAttendeeTickets> {
  const result = await findIssuedTicketsByAccountId(accountId, options);

  return {
    ...result,
    tickets: result.tickets.map(toAttendeeIssuedTicket),
  };
}

/**
 * Resolves a scanned QR credential to its issued ticket.
 *
 * Callers pass the raw credential straight from the scanned QR code — the
 * hashing happens here so there's exactly one place in the codebase that
 * decides how a credential is hashed.
 */
export async function resolveTicketByQrCredential(
  qrCredential: string,
): Promise<IssuedTicket | null> {
  return await findIssuedTicketByQrTokenHash(hashQrCredential(qrCredential));
}

/**
 * Checks an issued ticket in at the event entrance.
 *
 * The repository performs the atomic ISSUED → CHECKED_IN transition.
 * This service method intentionally does not perform a separate
 * "is it checked in?" read because that would introduce a race condition.
 */
export async function checkInTicket(
  ticketId: string,
  eventId: string,
  checkedInById: string,
): Promise<IssuedTicketCheckInDetails> {
  return await checkInIssuedTicket(ticketId, eventId, checkedInById);
}
