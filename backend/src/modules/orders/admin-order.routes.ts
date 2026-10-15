import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/authorization.middleware.js';
import { validateParams, validateQuery } from '../../middleware/validation.middleware.js';

import { getAdminOrderById, getAdminOrders } from './order.controller.js';

import { adminOrderListQuerySchema, orderIdSchema } from './order.schemas.js';

export const adminOrderRouter = Router();

/**
 * Lists orders for the administrative order management screen.
 *
 * GET /admin/orders
 *
 * Authentication is required. The service layer verifies that the
 * authenticated actor has ADMIN or SUPER_ADMIN privileges.
 */
adminOrderRouter.get(
  '/',
  authenticate,
  requireAdmin,
  validateQuery(adminOrderListQuerySchema),
  getAdminOrders,
);

/**
 * Retrieves a single order for the administrative order management screen.
 *
 * GET /admin/orders/:id
 *
 * Authentication is required. The service layer verifies that the
 * authenticated actor has ADMIN or SUPER_ADMIN privileges.
 */
adminOrderRouter.get(
  '/:id',
  authenticate,
  requireAdmin,
  validateParams(orderIdSchema),
  getAdminOrderById,
);
