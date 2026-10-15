import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middleware/validation.middleware.js';

import { cancelOrder, createOrder, getOrderById, getOrders } from './order.controller.js';
import {
  cancelOrderSchema,
  createOrderSchema,
  orderIdSchema,
  orderListQuerySchema,
} from './order.schemas.js';

export const orderRouter = Router();

/**
 * Creates a new order.
 *
 * POST /orders
 *
 * Orders are always created in the context of the authenticated account.
 * The service resolves ticket pricing and validates inventory server-side.
 */
orderRouter.post('/', authenticate, validateBody(createOrderSchema), createOrder);

/**
 * Lists orders visible to the authenticated actor.
 *
 * GET /orders
 *
 * Administrators may receive the administrative order view while
 * attendees are restricted to their own orders by the service layer.
 */
orderRouter.get('/', authenticate, validateQuery(orderListQuerySchema), getOrders);

/**
 * Retrieves a single order.
 *
 * GET /orders/:id
 *
 * Ownership and administrative visibility are enforced by the service layer.
 */
orderRouter.get('/:id', authenticate, validateParams(orderIdSchema), getOrderById);

/**
 * Cancels an existing order.
 *
 * POST /orders/:id/cancel
 *
 * Cancellation is a domain action rather than a generic status update.
 * The service layer enforces ownership and verifies that the order is
 * currently cancellable.
 */
orderRouter.post(
  '/:id/cancel',
  authenticate,
  validateParams(orderIdSchema),
  validateBody(cancelOrderSchema),
  cancelOrder,
);
