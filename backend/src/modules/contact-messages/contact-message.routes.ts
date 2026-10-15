import { Router } from 'express';

import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middleware/validation.middleware.js';

import {
  createContactMessageHandler,
  deleteContactMessageHandler,
  getContactMessageHandler,
  listContactMessagesHandler,
  updateContactMessageStatusHandler,
} from './contact-message.controller.js';

import {
  contactMessageIdSchema,
  contactMessageListQuerySchema,
  createContactMessageSchema,
  updateContactMessageStatusSchema,
} from './contact-message.schemas.js';
import { contactSubmissionRateLimiter } from '../../middleware/rate-limit.middleware.js';

export const contactMessageRouter = Router();

// Public submission
contactMessageRouter.post(
  '/',
  contactSubmissionRateLimiter,
  validateBody(createContactMessageSchema),
  createContactMessageHandler,
);

// All management endpoints require administrator privileges.
contactMessageRouter.use('/manage', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'));

contactMessageRouter.get(
  '/manage',
  validateQuery(contactMessageListQuerySchema),
  listContactMessagesHandler,
);

contactMessageRouter.get(
  '/manage/:id',
  validateParams(contactMessageIdSchema),
  getContactMessageHandler,
);

contactMessageRouter.patch(
  '/manage/:id/status',
  validateParams(contactMessageIdSchema),
  validateBody(updateContactMessageStatusSchema),
  updateContactMessageStatusHandler,
);

/**
 * DELETE /manage/:id
 * Delete a contact message by ID.
 */
contactMessageRouter.delete(
  '/manage/:id',
  validateParams(contactMessageIdSchema),
  deleteContactMessageHandler,
);
