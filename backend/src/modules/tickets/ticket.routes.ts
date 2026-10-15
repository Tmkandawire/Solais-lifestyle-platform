import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middleware/validation.middleware.js';

import {
  activateTicket,
  createTicket,
  deactivateTicket,
  deleteTicket,
  getManagedEventTickets,
  getManagedTicket,
  getPublicEventTickets,
  getTicket,
  reserveTicket,
  updateTicket,
} from './ticket.controller.js';
import {
  activateTicketTypeSchema,
  createTicketTypeSchema,
  deactivateTicketTypeSchema,
  reserveTicketSchema,
  ticketTypeIdSchema,
  ticketTypeListQuerySchema,
  updateTicketTypeSchema,
} from './ticket.schemas.js';
import { eventIdParamSchema } from './ticket.schemas.js';

export const ticketRouter = Router();

/**
 * Admin ticket management: lists all ticket types for an event, including
 * INACTIVE ones and raw inventory numbers. Registered before the public
 * '/event/:eventId' below, matching the '/manage' vs '/:id' convention
 * used in event.routes.ts.
 */
ticketRouter.get(
  '/manage/event/:eventId',
  authenticate,
  validateParams(eventIdParamSchema),
  validateQuery(ticketTypeListQuerySchema),
  getManagedEventTickets,
);

/**
 * Admin ticket management: retrieves a single ticket type including
 * administrative inventory fields.
 */
ticketRouter.get('/manage/:id', authenticate, validateParams(ticketTypeIdSchema), getManagedTicket);

/**
 * Public ticket discovery: lists purchasable (ACTIVE) ticket types for an
 * event. No authentication required.
 */
ticketRouter.get(
  '/event/:eventId',
  validateParams(eventIdParamSchema),
  validateQuery(ticketTypeListQuerySchema),
  getPublicEventTickets,
);
/**
 * Public ticket discovery.
 *
 * Retrieves a single non-deleted ticket type.
 */
ticketRouter.get('/:id', validateParams(ticketTypeIdSchema), getTicket);

/**
 * Creates a ticket type.
 */
ticketRouter.post('/', authenticate, validateBody(createTicketTypeSchema), createTicket);

/**
 * Updates non-lifecycle ticket fields.
 *
 * Status changes are intentionally handled through dedicated lifecycle
 * endpoints below.
 */
ticketRouter.patch(
  '/:id',
  authenticate,
  validateParams(ticketTypeIdSchema),
  validateBody(updateTicketTypeSchema),
  updateTicket,
);

/**
 * Activates a ticket type.
 */
ticketRouter.post(
  '/:id/activate',
  authenticate,
  validateParams(ticketTypeIdSchema),
  validateBody(activateTicketTypeSchema),
  activateTicket,
);

/**
 * Deactivates a ticket type.
 */
ticketRouter.post(
  '/:id/deactivate',
  authenticate,
  validateParams(ticketTypeIdSchema),
  validateBody(deactivateTicketTypeSchema),
  deactivateTicket,
);

/**
 * Soft-deletes a ticket type.
 */
ticketRouter.delete('/:id', authenticate, validateParams(ticketTypeIdSchema), deleteTicket);

/**
 * Reserves ticket inventory for a purchase.
 *
 * This intentionally does not use authenticate yet. The reservation
 * operation is part of the customer purchase flow and will eventually
 * be invoked within the Orders/Payments workflow.
 */
ticketRouter.post(
  '/:id/reserve',
  validateParams(ticketTypeIdSchema),
  validateBody(reserveTicketSchema),
  reserveTicket,
);

/**
 * releaseTicket is intentionally NOT wired up yet.
 *
 * Per ticket.controller.ts, releasing inventory must not be exposed
 * publicly until it can be scoped to an authenticated order context.
 * Wire this in once Orders exist to provide that context.
 */
