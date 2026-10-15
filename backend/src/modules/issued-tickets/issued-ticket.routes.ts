import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middleware/validation.middleware.js';
import {
  checkInIssuedTicket,
  getIssuedTicketById,
  getIssuedTicketQrCredential,
  getMyIssuedTickets,
  getTicketsByOrderItem,
} from './issued-ticket.controller.js';
import {
  checkInTicketSchema,
  issuedTicketIdSchema,
  issuedTicketListQuerySchema,
  orderItemIdSchema,
} from './issued-ticket.schemas.js';

export const issuedTicketRouter = Router();

/**
 * Retrieves the authenticated user's issued tickets.
 *
 * GET /issued-tickets/me
 */
issuedTicketRouter.get(
  '/me',
  authenticate,
  validateQuery(issuedTicketListQuerySchema),
  getMyIssuedTickets,
);

/**
 * Checks a ticket in using a scanned QR payload.
 *
 * POST /issued-tickets/check-in
 *
 * Staff-only — enforced inside the controller (role check), not here.
 */
issuedTicketRouter.post(
  '/check-in',
  authenticate,
  validateBody(checkInTicketSchema),
  checkInIssuedTicket,
);

/**
 * Retrieves tickets belonging to an order item.
 *
 * Staff-only for now — see KNOWN GAP note in the controller.
 */
issuedTicketRouter.get(
  '/order-item/:orderItemId',
  authenticate,
  validateParams(orderItemIdSchema),
  getTicketsByOrderItem,
);

/**
 * Retrieves the QR credential for an individual issued ticket.
 *
 * Owner or staff — authorization is enforced in the controller.
 */
issuedTicketRouter.get(
  '/:id/qr-credential',
  authenticate,
  validateParams(issuedTicketIdSchema),
  getIssuedTicketQrCredential,
);

/**
 * Retrieves an individual issued ticket. Owner or staff — enforced in the
 * controller.
 */
issuedTicketRouter.get(
  '/:id',
  authenticate,
  validateParams(issuedTicketIdSchema),
  getIssuedTicketById,
);
