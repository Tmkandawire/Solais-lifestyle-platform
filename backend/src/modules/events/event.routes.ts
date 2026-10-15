import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middleware/validation.middleware.js';

import {
  cancelExistingEvent,
  completeExistingEvent,
  createEvent,
  deleteExistingEvent,
  getEvent,
  getEvents,
  getManagedEvent,
  getPublishedEvents,
  publishExistingEvent,
  updateEvent,
} from './event.controller.js';

import {
  createEventSchema,
  eventIdSchema,
  eventListQuerySchema,
  updateEventSchema,
} from './event.schemas.js';

export const eventRouter = Router();

/**
 * Public event discovery.
 */
eventRouter.get('/', validateQuery(eventListQuerySchema), getPublishedEvents);

/**
 * Protected event management.
 * Registered before '/:id' — otherwise Express matches '/manage' as an :id param
 * and this route (and its authenticate middleware) never runs.
 */
eventRouter.get('/manage', authenticate, validateQuery(eventListQuerySchema), getEvents);

eventRouter.get('/manage/:id', authenticate, validateParams(eventIdSchema), getManagedEvent);

eventRouter.get('/:id', validateParams(eventIdSchema), getEvent);

eventRouter.post('/', authenticate, validateBody(createEventSchema), createEvent);

eventRouter.patch(
  '/:id',
  authenticate,
  validateParams(eventIdSchema),
  validateBody(updateEventSchema),
  updateEvent,
);

eventRouter.post('/:id/publish', authenticate, validateParams(eventIdSchema), publishExistingEvent);

eventRouter.post('/:id/cancel', authenticate, validateParams(eventIdSchema), cancelExistingEvent);

eventRouter.post(
  '/:id/complete',
  authenticate,
  validateParams(eventIdSchema),
  completeExistingEvent,
);

eventRouter.delete('/:id', authenticate, validateParams(eventIdSchema), deleteExistingEvent);
