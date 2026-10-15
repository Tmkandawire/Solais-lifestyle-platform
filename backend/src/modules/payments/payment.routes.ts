import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/authorization.middleware.js';
import { validateBody, validateParams } from '../../middleware/validation.middleware.js';

import {
  cancelPaymentById,
  createPayment,
  getPaymentById,
  paymentFailed,
  paymentSuccessful,
} from './payment.controller.js';

import {
  createPaymentSchema,
  paymentFailedSchema,
  paymentIdSchema,
  paymentSuccessfulSchema,
} from './payment.schemas.js';

export const paymentRouter = Router();

/**
 * Creates a payment for an existing order.
 *
 * POST /payments
 *
 * Authentication is required because payments belong to orders owned
 * by authenticated accounts.
 *
 * The service resolves the payment amount from the order and never
 * trusts an amount supplied by the client.
 */
paymentRouter.post('/', authenticate, validateBody(createPaymentSchema), createPayment);

/**
 * Retrieves a payment.
 *
 * GET /payments/:id
 *
 * Authentication is required.
 * Ownership and administrative visibility are enforced by the service.
 */
paymentRouter.get('/:id', authenticate, validateParams(paymentIdSchema), getPaymentById);

/**
 * Manually marks a payment as successful.
 *
 * POST /payments/:id/success
 *
 * This is an administrative operational endpoint.
 * It is NOT a payment-provider webhook endpoint.
 *
 * Authentication and administrative authorization are both required.
 */
paymentRouter.post(
  '/:id/success',
  authenticate,
  requireAdmin,
  validateParams(paymentIdSchema),
  validateBody(paymentSuccessfulSchema),
  paymentSuccessful,
);

/**
 * Manually marks a payment as failed.
 *
 * POST /payments/:id/fail
 *
 * This is an administrative operational endpoint.
 * It is NOT a payment-provider webhook endpoint.
 *
 * Authentication and administrative authorization are both required.
 */
paymentRouter.post(
  '/:id/fail',
  authenticate,
  requireAdmin,
  validateParams(paymentIdSchema),
  validateBody(paymentFailedSchema),
  paymentFailed,
);

/**
 * Cancels a pending payment.
 *
 * POST /payments/:id/cancel
 *
 * This is an administrative operational endpoint.
 * Authentication and administrative authorization are required.
 */
paymentRouter.post(
  '/:id/cancel',
  authenticate,
  requireAdmin,
  validateParams(paymentIdSchema),
  cancelPaymentById,
);
