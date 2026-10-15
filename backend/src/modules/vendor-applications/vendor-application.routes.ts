import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middleware/validation.middleware.js';

import {
  approveExistingVendorApplication,
  createVendorApplication,
  deleteExistingVendorApplication,
  getVendorApplication,
  getVendorApplications,
  rejectExistingVendorApplication,
} from './vendor-application.controller.js';

import {
  createVendorApplicationSchema,
  reviewVendorApplicationSchema,
  vendorApplicationIdSchema,
  vendorApplicationListQuerySchema,
} from './vendor-application.schemas.js';

export const vendorApplicationRouter = Router();

/**
 * Public vendor application submission.
 */
vendorApplicationRouter.post(
  '/',
  validateBody(createVendorApplicationSchema),
  createVendorApplication,
);

/**
 * Protected vendor application management.
 * Registered before '/:id' so '/manage' is not treated as an application id.
 */
vendorApplicationRouter.get(
  '/manage',
  authenticate,
  validateQuery(vendorApplicationListQuerySchema),
  getVendorApplications,
);

vendorApplicationRouter.get(
  '/manage/:id',
  authenticate,
  validateParams(vendorApplicationIdSchema),
  getVendorApplication,
);

vendorApplicationRouter.post(
  '/:id/approve',
  authenticate,
  validateParams(vendorApplicationIdSchema),
  validateBody(reviewVendorApplicationSchema),
  approveExistingVendorApplication,
);

vendorApplicationRouter.post(
  '/:id/reject',
  authenticate,
  validateParams(vendorApplicationIdSchema),
  validateBody(reviewVendorApplicationSchema),
  rejectExistingVendorApplication,
);

vendorApplicationRouter.delete(
  '/:id',
  authenticate,
  validateParams(vendorApplicationIdSchema),
  deleteExistingVendorApplication,
);
