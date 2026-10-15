import type { NextFunction, Request, Response } from 'express';
import type { ParsedQs } from 'qs';

import type { Role } from '../../generated/prisma/enums.js';
import {
  checkInTicket as checkInTicketService,
  getIssuedTicket as getIssuedTicketService,
  getIssuedTicketQrCredential as getIssuedTicketQrCredentialService,
  getIssuedTicketsByAccount as getIssuedTicketsByAccountService,
  getIssuedTicketsByOrderItem as getIssuedTicketsByOrderItemService,
  resolveTicketByQrCredential,
  toIssuedTicketSummary,
  toStaffCheckInResult,
} from '../../services/issued-ticket.service.js';
import { parseTicketQrPayload } from '../../services/qr-code.service.js';
import { successResponse } from '../../shared/responses/api-response.js';
import {
  IssuedTicketCredentialNotFoundError,
  IssuedTicketForbiddenError,
} from '../../shared/errors/issued-ticket.errors.js';
import type {
  CheckInTicketInput,
  IssuedTicketIdInput,
  OrderItemIdInput,
} from './issued-ticket.schemas.js';

const STAFF_ROLES: ReadonlySet<Role> = new Set(['ADMIN', 'SUPER_ADMIN']);

function isStaffRole(role: Role): boolean {
  return STAFF_ROLES.has(role);
}

function asyncHandler<P, ResBody, ReqBody, ReqQuery>(
  handler: (
    request: Request<P, ResBody, ReqBody, ReqQuery>,
    response: Response<ResBody>,
  ) => Promise<void>,
) {
  return (
    request: Request<P, ResBody, ReqBody, ReqQuery>,
    response: Response<ResBody>,
    next: NextFunction,
  ): void => {
    handler(request, response).catch(next);
  };
}

function requireUser(request: Pick<Request, 'user'>): NonNullable<Request['user']> {
  if (!request.user) {
    throw new Error('Authenticated route handler reached without request.user.');
  }
  return request.user;
}

/**
 * GET /issued-tickets/:id
 *
 * Retrieves a single issued ticket. Restricted to the ticket's owner or
 * staff (ADMIN/SUPER_ADMIN) — issued tickets contain another attendee's
 * ticket number and are not publicly viewable.
 */
export const getIssuedTicketById = asyncHandler<IssuedTicketIdInput, unknown, unknown, unknown>(
  async (request, response) => {
    const user = requireUser(request);
    const ticket = await getIssuedTicketService(request.params.id);

    if (ticket.accountId !== user.accountId && !isStaffRole(user.role)) {
      throw new IssuedTicketForbiddenError();
    }

    response
      .status(200)
      .json(
        successResponse('Issued ticket retrieved successfully.', toIssuedTicketSummary(ticket)),
      );
  },
);

/**
 * GET /issued-tickets/:id/qr-credential
 *
 * Retrieves the QR credential for an issued ticket.
 * Restricted to the ticket owner or staff (ADMIN/SUPER_ADMIN).
 */
export const getIssuedTicketQrCredential = asyncHandler<
  IssuedTicketIdInput,
  unknown,
  unknown,
  unknown
>(async (request, response) => {
  const user = requireUser(request);

  // Verify ownership or staff authorization before retrieving the credential.
  const ticket = await getIssuedTicketService(request.params.id);

  if (ticket.accountId !== user.accountId && !isStaffRole(user.role)) {
    throw new IssuedTicketForbiddenError();
  }

  const qrCredential = await getIssuedTicketQrCredentialService(ticket.id);

  response.status(200).json(
    successResponse('Ticket QR credential retrieved successfully.', {
      ticketId: ticket.id,
      qrCredential,
    }),
  );
});

/**
 * GET /issued-tickets/order-item/:orderItemId
 *
 * Retrieves all tickets belonging to an order item.
 *
 * KNOWN GAP: this does not yet verify the requesting account owns the
 * parent order — that requires resolving orderItemId -> Order.accountId,
 * which isn't available from this module. Restricted to staff only until
 * that lookup is wired in; do not relax this to "any authenticated user"
 * as a shortcut.
 */
export const getTicketsByOrderItem = asyncHandler<OrderItemIdInput, unknown, unknown, unknown>(
  async (request, response) => {
    const user = requireUser(request);

    if (!isStaffRole(user.role)) {
      throw new IssuedTicketForbiddenError();
    }

    const tickets = await getIssuedTicketsByOrderItemService(request.params.orderItemId);

    response
      .status(200)
      .json(
        successResponse(
          'Issued tickets retrieved successfully.',
          tickets.map(toIssuedTicketSummary),
        ),
      );
  },
);

/**
 * GET /issued-tickets/me
 *
 * Retrieves the authenticated attendee's issued tickets.
 */
export const getMyIssuedTickets = asyncHandler<Record<string, never>, unknown, unknown, ParsedQs>(
  async (request, response) => {
    const user = requireUser(request);

    const query = request.query;

    const result = await getIssuedTicketsByAccountService(user.accountId, {
      page: Number(query.page),
      limit: Number(query.limit),
    });

    response.status(200).json(successResponse('Issued tickets retrieved successfully.', result));
  },
);

/**
 * POST /issued-tickets/check-in
 *
 * Processes a scanned QR payload. Restricted to staff (ADMIN/SUPER_ADMIN) —
 * check-in records the authenticated account as the staff member who
 * performed it, so any authenticated attendee being able to hit this would
 * let them check in arbitrary tickets under their own identity.
 *
 * Flow:
 *   raw QR payload
 *        ↓
 *   parseTicketQrPayload()
 *        ↓
 *   resolveTicketByQrCredential()
 *        ↓
 *   checkInTicket()
 */
export const checkInIssuedTicket = asyncHandler<
  Record<string, never>,
  unknown,
  CheckInTicketInput,
  unknown
>(async (request, response) => {
  const user = requireUser(request);

  if (!isStaffRole(user.role)) {
    throw new IssuedTicketForbiddenError();
  }

  const payload = parseTicketQrPayload(request.body.qrPayload);
  const ticket = await resolveTicketByQrCredential(payload.credential);

  if (!ticket || ticket.id !== payload.ticketId) {
    throw new IssuedTicketCredentialNotFoundError();
  }

  const checkedInTicket = await checkInTicketService(
    ticket.id,
    request.body.eventId,
    user.accountId,
  );

  response
    .status(200)
    .json(
      successResponse('Ticket checked in successfully.', toStaffCheckInResult(checkedInTicket)),
    );
});
