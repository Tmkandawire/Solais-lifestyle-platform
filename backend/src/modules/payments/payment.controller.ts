import type { NextFunction, Request, Response } from 'express';

import {
  cancelPayment,
  createNewPayment,
  getPayment,
  markPaymentFailed,
  markPaymentSuccessful,
} from '../../services/payment.service.js';

import { successResponse } from '../../shared/responses/api-response.js';

import type {
  CreatePaymentInput as CreatePaymentSchemaInput,
  PaymentFailedInput,
  PaymentIdInput,
  PaymentSuccessfulInput,
} from './payment.schemas.js';

/**
 * Wraps an async Express handler so rejected promises are forwarded to
 * the centralized error middleware.
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
 * Extracts the authenticated account from request.user and converts it
 * into the actor contract expected by the payment service.
 *
 * Payment routes using this helper must be protected by authenticate.
 */
function getPaymentActor(request: Pick<Request, 'user'>) {
  if (!request.user) {
    throw new Error('Authenticated payment handler reached without request.user.');
  }

  return {
    accountId: request.user.accountId,
    role: request.user.role,
  };
}

/**
 * Creates a new payment for an existing order.
 *
 * POST /payments
 *
 * The service resolves the order amount and validates ownership,
 * order status, and expiration.
 */
export const createPayment = asyncHandler<
  Record<string, never>,
  unknown,
  CreatePaymentSchemaInput,
  unknown
>(async (request, response) => {
  const payment = await createNewPayment(request.body, getPaymentActor(request));

  response.status(201).json(successResponse('Payment created successfully.', payment));
});

/**
 * Retrieves a payment by ID.
 *
 * GET /payments/:id
 *
 * The service determines whether the authenticated actor may access it.
 */
export const getPaymentById = asyncHandler<PaymentIdInput, unknown, unknown, unknown>(
  async (request, response) => {
    const payment = await getPayment(request.params.id, getPaymentActor(request));

    response.status(200).json(successResponse('Payment retrieved successfully.', payment));
  },
);

/**
 * Manually marks a payment as successful.
 *
 * POST /payments/:id/success
 *
 * This is an administrative operational endpoint.
 * It is NOT a payment-provider webhook endpoint.
 *
 * The route must be protected by authenticate and requireAdmin.
 */
export const paymentSuccessful = asyncHandler<
  PaymentIdInput,
  unknown,
  PaymentSuccessfulInput,
  unknown
>(async (request, response) => {
  const completion = await markPaymentSuccessful(
    request.params.id,
    request.body.providerReference,
    getPaymentActor(request),
  );

  response.status(200).json(successResponse('Payment completed successfully.', completion));
});

/**
 * Manually marks a payment as failed.
 *
 * POST /payments/:id/fail
 *
 * This is an administrative operational endpoint.
 * It is NOT a payment-provider webhook endpoint.
 *
 * The route must be protected by authenticate and requireAdmin.
 */
export const paymentFailed = asyncHandler<PaymentIdInput, unknown, PaymentFailedInput, unknown>(
  async (request, response) => {
    const payment = await markPaymentFailed(
      request.params.id,
      request.body.failureReason,
      getPaymentActor(request),
    );

    response.status(200).json(successResponse('Payment marked as failed.', payment));
  },
);

/**
 * Cancels a pending payment.
 *
 * POST /payments/:id/cancel
 *
 * This is an administrative operational endpoint.
 * The route must be protected by authenticate and requireAdmin.
 */
export const cancelPaymentById = asyncHandler<PaymentIdInput, unknown, unknown, unknown>(
  async (request, response) => {
    const payment = await cancelPayment(request.params.id);

    response.status(200).json(successResponse('Payment cancelled successfully.', payment));
  },
);
