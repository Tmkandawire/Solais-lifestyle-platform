import type { NextFunction, Request, Response } from 'express';

import {
  cancelExistingOrder,
  createNewOrder,
  getAdminOrder,
  getOrder,
  listAdminOrders,
  listOrders,
  type OrderActor,
} from '../../services/order.service.js';

import { successResponse } from '../../shared/responses/api-response.js';

import type {
  AdminOrderListQueryInput,
  CreateOrderInput,
  OrderIdInput,
  OrderListQueryInput,
} from './order.schemas.js';

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
 * into the actor contract expected by the order service.
 *
 * All order routes using this helper must be protected by authenticate.
 */
function getOrderActor(request: Pick<Request, 'user'>): OrderActor {
  if (!request.user) {
    throw new Error('Authenticated order handler reached without request.user.');
  }

  return {
    accountId: request.user.accountId,
    role: request.user.role,
  };
}

/**
 * Creates a new order.
 *
 * POST /orders
 *
 * Pricing, totals, account ownership, ticket availability, and inventory
 * reservation are all handled by the service layer.
 */
export const createOrder = asyncHandler<Record<string, never>, unknown, CreateOrderInput, unknown>(
  async (request, response) => {
    const order = await createNewOrder(request.body, getOrderActor(request));

    response.status(201).json(successResponse('Order created successfully.', order));
  },
);

/**
 * Retrieves a single order.
 *
 * GET /orders/:id
 *
 * The service determines whether the authenticated actor may access it.
 */
export const getOrderById = asyncHandler<OrderIdInput, unknown, unknown, unknown>(
  async (request, response) => {
    const order = await getOrder(request.params.id, getOrderActor(request));

    response.status(200).json(successResponse('Order retrieved successfully.', order));
  },
);

/**
 * Retrieves a single order for the administrative order management screen.
 *
 * GET /admin/orders/:id
 *
 * The service enforces that only administrators may access this
 * administrative view.
 */
export const getAdminOrderById = asyncHandler<OrderIdInput, unknown, unknown, unknown>(
  async (request, response) => {
    const order = await getAdminOrder(request.params.id, getOrderActor(request));

    response.status(200).json(successResponse('Admin order retrieved successfully.', order));
  },
);

/**
 * Lists orders visible to the authenticated actor.
 *
 * GET /orders
 *
 * Administrators may receive the administrative order view.
 * Attendees are restricted to their own orders by the service layer.
 */
export const getOrders = asyncHandler<Record<string, never>, unknown, unknown, unknown>(
  async (request, response) => {
    const query = response.locals.validatedQuery as OrderListQueryInput;

    const orders = await listOrders(query, getOrderActor(request));

    response.status(200).json(successResponse('Orders retrieved successfully.', orders));
  },
);

/**
 * Lists orders for the administrative order management screen.
 *
 * GET /admin/orders
 *
 * The service enforces that only administrators may access this
 * administrative view.
 */
export const getAdminOrders = asyncHandler<Record<string, never>, unknown, unknown, unknown>(
  async (request, response) => {
    const query = response.locals.validatedQuery as AdminOrderListQueryInput;

    const orders = await listAdminOrders(query, getOrderActor(request));

    response.status(200).json(successResponse('Admin orders retrieved successfully.', orders));
  },
);

/**
 * Cancels an existing order.
 *
 * POST /orders/:id/cancel
 *
 * The service performs the state transition and inventory release.
 */
export const cancelOrder = asyncHandler<OrderIdInput, unknown, unknown, unknown>(
  async (request, response) => {
    const order = await cancelExistingOrder(request.params.id, getOrderActor(request));

    response.status(200).json(successResponse('Order cancelled successfully.', order));
  },
);
