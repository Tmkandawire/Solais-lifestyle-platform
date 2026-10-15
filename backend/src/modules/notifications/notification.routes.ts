import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { validateParams, validateQuery } from '../../middleware/validation.middleware.js';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  removeNotification,
} from './notification.controller.js';
import { notificationIdSchema, notificationListQuerySchema } from './notification.schemas.js';

export const notificationRouter = Router();

notificationRouter.use((_request, response, next) => {
  response.setHeader('Cache-Control', 'private, no-store');
  next();
});

notificationRouter.use(authenticate);

notificationRouter.get('/', validateQuery(notificationListQuerySchema), getNotifications);

notificationRouter.get('/unread-count', getUnreadNotificationCount);

notificationRouter.patch('/read-all', markAllNotificationsAsRead);

notificationRouter.patch('/:id/read', validateParams(notificationIdSchema), markNotificationAsRead);

notificationRouter.delete('/:id', validateParams(notificationIdSchema), removeNotification);
