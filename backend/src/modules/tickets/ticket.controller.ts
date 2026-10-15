import type { NextFunction, Request, Response } from 'express';

import {
  activateTicketType,
  createNewTicketType,
  deactivateTicketType,
  deleteTicketType,
  getTicketTypeById,
  listPublicTicketTypes,
  listTicketTypes,
  releaseTickets,
  reserveTickets,
  updateExistingTicketType,
  type CreateTicketTypeServiceData,
  type TicketActor,
  type UpdateTicketTypeServiceData,
} from '../../services/ticket.service.js';
import { successResponse } from '../../shared/responses/api-response.js';

import type {
  CreateTicketTypeInput,
  ReserveTicketInput,
  TicketTypeIdInput,
  TicketTypeListQueryInput,
  UpdateTicketTypeInput,
} from './ticket.schemas.js';

/**
 * Wraps an async Express handler so rejected promises are forwarded to
 * next(error) instead of becoming unhandled rejections.
 *
 * Introduced now that every controller method across auth/events/tickets
 * is written, matching the deferred decision to add this wrapper once the
 * full handler surface was known rather than guessing its shape upfront.
 *
 * If a shared asyncHandler utility already exists elsewhere in the
 * codebase, prefer that one and remove this local copy.
 */
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

/**
 * Narrows request.user from optional to required for handlers that execute
 * after the authenticate middleware.
 *
 * If this invariant is violated, the route has been wired incorrectly.
 */
function requireUser(request: Pick<Request, 'user'>): NonNullable<Request['user']> {
  if (!request.user) {
    throw new Error('Authenticated route handler reached without request.user.');
  }

  return request.user;
}

/**
 * Converts the authenticated Express user into the actor shape expected
 * by the ticket service.
 */
function getTicketActor(request: Pick<Request, 'user'>): TicketActor {
  const user = requireUser(request);

  return {
    accountId: user.accountId,
    role: user.role,
  };
}

/**
 * Returns the Zod-validated ticket list query in its domain-specific type.
 *
 * validateQuery() writes the coerced/validated result to
 * response.locals.validatedQuery rather than mutating request.query —
 * reading request.query directly (the old implementation) returned the
 * raw, unvalidated query object instead (page/limit as strings, no
 * defaults applied), which happened to mostly work by accident but
 * wasn't actually what validateQuery() produced.
 */
function getTicketListQuery(response: Response<unknown>): TicketTypeListQueryInput {
  return response.locals.validatedQuery as TicketTypeListQueryInput;
}

/**
 * Creates a new ticket type for an event.
 *
 * POST /tickets
 */
export const createTicket = asyncHandler<
  Record<string, never>,
  unknown,
  CreateTicketTypeInput,
  unknown
>(async (request, response) => {
  const input: CreateTicketTypeServiceData = {
    eventId: request.body.eventId,
    name: request.body.name,
    price: request.body.price,
    capacity: request.body.capacity,
    ...(request.body.description !== undefined ? { description: request.body.description } : {}),
    ...(request.body.saleStartAt !== undefined ? { saleStartAt: request.body.saleStartAt } : {}),
    ...(request.body.saleEndAt !== undefined ? { saleEndAt: request.body.saleEndAt } : {}),
  };

  const ticketType = await createNewTicketType(input, getTicketActor(request));

  response.status(201).json(successResponse('Ticket type created successfully.', ticketType));
});

/**
 * Retrieves a single non-deleted ticket type.
 *
 * GET /tickets/:id
 */
export const getTicket = asyncHandler<TicketTypeIdInput, unknown, unknown, unknown>(
  async (request, response) => {
    const ticketType = await getTicketTypeById(request.params.id);

    response.status(200).json(successResponse('Ticket type retrieved successfully.', ticketType));
  },
);

/**
 * Retrieves a single non-deleted ticket type for admin management.
 *
 * GET /tickets/manage/:id
 *
 * Requires an authenticated actor because this endpoint is part of the
 * administrative ticket-management surface.
 */
export const getManagedTicket = asyncHandler<TicketTypeIdInput, unknown, unknown, unknown>(
  async (request, response) => {
    const ticketType = await getTicketTypeById(request.params.id);

    response.status(200).json(successResponse('Ticket type retrieved successfully.', ticketType));
  },
);

/**
 * Lists ticket types belonging to an event, for admin management.
 *
 * GET /tickets/manage/event/:eventId
 *
 * Requires an authenticated actor, since listTicketTypes uses the actor to
 * decide visibility (INACTIVE ticket types included). Protected by
 * authenticate in ticket.routes.ts.
 */
export const getManagedEventTickets = asyncHandler<{ eventId: string }, unknown, unknown, unknown>(
  async (request, response) => {
    const { eventId } = request.params;
    const query = getTicketListQuery(response);

    const result = await listTicketTypes(
      eventId,
      {
        page: query.page,
        limit: query.limit,
        ...(query.status !== undefined ? { status: query.status } : {}),
      },
      getTicketActor(request),
    );

    response.status(200).json(successResponse('Ticket types retrieved successfully.', result));
  },
);

/**
 * Lists purchasable ticket types belonging to an event, for anonymous
 * attendee-facing callers.
 *
 * GET /tickets/event/:eventId
 *
 * Public endpoint — no actor. Always ACTIVE-only, enforced server-side by
 * listPublicTicketTypes(), not by trusting a client-supplied status.
 */
export const getPublicEventTickets = asyncHandler<{ eventId: string }, unknown, unknown, unknown>(
  async (request, response) => {
    const { eventId } = request.params;
    const query = getTicketListQuery(response);

    const result = await listPublicTicketTypes(eventId, {
      page: query.page,
      limit: query.limit,
    });

    response.status(200).json(successResponse('Ticket types retrieved successfully.', result));
  },
);

/**
 * Updates the non-lifecycle fields of a ticket type.
 *
 * PATCH /tickets/:id
 *
 * Status changes deliberately do not belong here.
 */
export const updateTicket = asyncHandler<
  TicketTypeIdInput,
  unknown,
  UpdateTicketTypeInput,
  unknown
>(async (request, response) => {
  const input: UpdateTicketTypeServiceData = {
    ...(request.body.name !== undefined ? { name: request.body.name } : {}),
    ...(request.body.description !== undefined ? { description: request.body.description } : {}),
    ...(request.body.price !== undefined ? { price: request.body.price } : {}),
    ...(request.body.capacity !== undefined ? { capacity: request.body.capacity } : {}),
    ...(request.body.saleStartAt !== undefined ? { saleStartAt: request.body.saleStartAt } : {}),
    ...(request.body.saleEndAt !== undefined ? { saleEndAt: request.body.saleEndAt } : {}),
  };

  const ticketType = await updateExistingTicketType(
    request.params.id,
    input,
    getTicketActor(request),
  );

  response.status(200).json(successResponse('Ticket type updated successfully.', ticketType));
});

/**
 * Activates a ticket type.
 *
 * POST /tickets/:id/activate
 */
export const activateTicket = asyncHandler<TicketTypeIdInput, unknown, unknown, unknown>(
  async (request, response) => {
    const ticketType = await activateTicketType(request.params.id, getTicketActor(request));

    response.status(200).json(successResponse('Ticket type activated successfully.', ticketType));
  },
);

/**
 * Deactivates a ticket type.
 *
 * POST /tickets/:id/deactivate
 */
export const deactivateTicket = asyncHandler<TicketTypeIdInput, unknown, unknown, unknown>(
  async (request, response) => {
    const ticketType = await deactivateTicketType(request.params.id, getTicketActor(request));

    response.status(200).json(successResponse('Ticket type deactivated successfully.', ticketType));
  },
);

/**
 * Soft-deletes a ticket type.
 *
 * DELETE /tickets/:id
 */
export const deleteTicket = asyncHandler<TicketTypeIdInput, unknown, unknown, unknown>(
  async (request, response) => {
    const ticketType = await deleteTicketType(request.params.id, getTicketActor(request));

    response.status(200).json(successResponse('Ticket type deleted successfully.', ticketType));
  },
);

/**
 * Reserves ticket inventory for a purchase.
 *
 * POST /tickets/:id/reserve
 *
 * This endpoint does not require an administrative actor. Inventory
 * reservation is part of the customer purchase flow.
 */
export const reserveTicket = asyncHandler<TicketTypeIdInput, unknown, ReserveTicketInput, unknown>(
  async (request, response) => {
    const ticketType = await reserveTickets(request.params.id, request.body.quantity);

    response
      .status(200)
      .json(successResponse('Ticket inventory reserved successfully.', ticketType));
  },
);

/**
 * Releases previously reserved ticket inventory.
 *
 * This is intentionally exposed at the service boundary for the upcoming
 * order/payment workflow. It should not be exposed publicly without an
 * authenticated order context once Orders are implemented — do not wire
 * this into ticket.routes.ts without that context in place.
 */
export const releaseTicket = asyncHandler<TicketTypeIdInput, unknown, ReserveTicketInput, unknown>(
  async (request, response) => {
    const ticketType = await releaseTickets(request.params.id, request.body.quantity);

    response
      .status(200)
      .json(successResponse('Ticket inventory released successfully.', ticketType));
  },
);
