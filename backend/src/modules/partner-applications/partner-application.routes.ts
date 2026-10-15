import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middleware/validation.middleware.js';

import {
  approveExistingPartnerApplication,
  createPartnerApplication,
  deleteExistingPartnerApplication,
  getPartnerApplication,
  getPartnerApplications,
  rejectExistingPartnerApplication,
} from './partner-application.controller.js';

import {
  createPartnerApplicationSchema,
  reviewPartnerApplicationSchema,
  partnerApplicationIdSchema,
  partnerApplicationListQuerySchema,
} from './partner-application.schemas.js';

export const partnerApplicationRouter = Router();

/**
 * Public partner application submission.
 */
partnerApplicationRouter.post(
  '/',
  validateBody(createPartnerApplicationSchema),
  createPartnerApplication,
);

/**
 * Protected partner application management.
 * Registered before '/:id' so '/manage' is not treated as an application id.
 */
partnerApplicationRouter.get(
  '/manage',
  authenticate,
  validateQuery(partnerApplicationListQuerySchema),
  getPartnerApplications,
);

partnerApplicationRouter.get(
  '/manage/:id',
  authenticate,
  validateParams(partnerApplicationIdSchema),
  getPartnerApplication,
);

partnerApplicationRouter.post(
  '/:id/approve',
  authenticate,
  validateParams(partnerApplicationIdSchema),
  validateBody(reviewPartnerApplicationSchema),
  approveExistingPartnerApplication,
);

partnerApplicationRouter.post(
  '/:id/reject',
  authenticate,
  validateParams(partnerApplicationIdSchema),
  validateBody(reviewPartnerApplicationSchema),
  rejectExistingPartnerApplication,
);

partnerApplicationRouter.delete(
  '/:id',
  authenticate,
  validateParams(partnerApplicationIdSchema),
  deleteExistingPartnerApplication,
);
