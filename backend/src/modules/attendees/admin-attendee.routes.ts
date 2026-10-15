import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/authorization.middleware.js';
import { validateParams, validateQuery } from '../../middleware/validation.middleware.js';

import { getAdminAttendeeById, getAdminAttendees } from './admin-attendee.controller.js';

import { adminAttendeeIdSchema, adminAttendeeListQuerySchema } from './admin-attendee.schemas.js';

export const adminAttendeeRouter = Router();

adminAttendeeRouter.use(authenticate, requireAdmin);

adminAttendeeRouter.get('/', validateQuery(adminAttendeeListQuerySchema), getAdminAttendees);

adminAttendeeRouter.get('/:id', validateParams(adminAttendeeIdSchema), getAdminAttendeeById);
