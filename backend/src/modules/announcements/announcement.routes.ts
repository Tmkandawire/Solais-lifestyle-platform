import { Router } from 'express';

import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middleware/validation.middleware.js';
import {
  archiveAnnouncementHandler,
  createAnnouncementHandler,
  deleteAnnouncementHandler,
  getAnnouncementHandler,
  listAnnouncementsHandler,
  listPublicAnnouncementsHandler,
  publishAnnouncementHandler,
  updateAnnouncementHandler,
  announcementUnreadStatusHandler,
  markAnnouncementsSeenHandler,
} from './announcement.controller.js';
import {
  announcementIdSchema,
  announcementInputSchema,
  announcementListQuerySchema,
  publicAnnouncementQuerySchema,
} from './announcement.schemas.js';

export const announcementRouter = Router();

announcementRouter.use((_request, response, next) => {
  response.setHeader('Cache-Control', 'no-store');
  next();
});

// Public endpoint: published announcements only.
announcementRouter.get(
  '/',
  validateQuery(publicAnnouncementQuerySchema),
  listPublicAnnouncementsHandler,
);

announcementRouter.get('/unread-status', authenticate, announcementUnreadStatusHandler);

announcementRouter.patch('/seen', authenticate, markAnnouncementsSeenHandler);

// All management endpoints require administrator privileges.
announcementRouter.use('/manage', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'));

announcementRouter.get(
  '/manage',
  validateQuery(announcementListQuerySchema),
  listAnnouncementsHandler,
);

announcementRouter.get('/manage/:id', validateParams(announcementIdSchema), getAnnouncementHandler);

announcementRouter.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validateBody(announcementInputSchema),
  createAnnouncementHandler,
);

announcementRouter.patch(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validateParams(announcementIdSchema),
  validateBody(announcementInputSchema),
  updateAnnouncementHandler,
);

announcementRouter.patch(
  '/:id/publish',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validateParams(announcementIdSchema),
  publishAnnouncementHandler,
);

announcementRouter.patch(
  '/:id/archive',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validateParams(announcementIdSchema),
  archiveAnnouncementHandler,
);

announcementRouter.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validateParams(announcementIdSchema),
  deleteAnnouncementHandler,
);
