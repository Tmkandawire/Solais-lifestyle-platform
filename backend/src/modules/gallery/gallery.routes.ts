import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middleware/validation.middleware.js';
import { requireGalleryManager } from './gallery.authorization.js';

import { galleryUpload } from './gallery.upload.js';

import {
  createGalleryItemHandler,
  deleteGalleryItemHandler,
  getEventGalleryHandler,
  getGalleryItemHandler,
  getGalleryItemsHandler,
  getManagedGalleryItemHandler,
  getPublishedGalleryHandler,
  publishGalleryItemHandler,
  unpublishGalleryItemHandler,
  updateGalleryItemHandler,
  uploadGalleryItemHandler,
} from './gallery.controller.js';

import {
  createGalleryItemSchema,
  galleryEventIdSchema,
  galleryIdSchema,
  galleryListQuerySchema,
  updateGalleryItemSchema,
} from './gallery.schemas.js';

export const galleryRouter = Router();

/**
 * Public gallery discovery.
 */
galleryRouter.get('/', validateQuery(galleryListQuerySchema), getPublishedGalleryHandler);

/**
 * Public gallery items belonging to an event.
 *
 * Registered before '/:id' because '/event/:eventId'
 * is a more specific route than '/:id'.
 */
galleryRouter.get(
  '/event/:eventId',
  validateParams(galleryEventIdSchema),
  validateQuery(galleryListQuerySchema),
  getEventGalleryHandler,
);

/**
 * Protected gallery management.
 *
 * Registered before '/:id' — otherwise Express could attempt
 * to match '/manage' as an :id parameter.
 */
galleryRouter.get(
  '/manage',
  authenticate,
  validateQuery(galleryListQuerySchema),
  getGalleryItemsHandler,
);

galleryRouter.get(
  '/manage/:id',
  authenticate,
  requireGalleryManager,
  validateParams(galleryIdSchema),
  getManagedGalleryItemHandler,
);

/**
 * Public single gallery item discovery.
 */
galleryRouter.get('/:id', validateParams(galleryIdSchema), getGalleryItemHandler);

/**
 * Protected gallery media upload.
 */

galleryRouter.post(
  '/upload',
  authenticate,
  requireGalleryManager,
  galleryUpload.single('file'),
  uploadGalleryItemHandler,
);

/**
 * Protected gallery management.
 */
galleryRouter.post(
  '/',
  authenticate,
  validateBody(createGalleryItemSchema),
  createGalleryItemHandler,
);

galleryRouter.patch(
  '/:id',
  authenticate,
  validateParams(galleryIdSchema),
  validateBody(updateGalleryItemSchema),
  updateGalleryItemHandler,
);

galleryRouter.post(
  '/:id/publish',
  authenticate,
  validateParams(galleryIdSchema),
  publishGalleryItemHandler,
);

galleryRouter.post(
  '/:id/unpublish',
  authenticate,
  validateParams(galleryIdSchema),
  unpublishGalleryItemHandler,
);

galleryRouter.delete(
  '/:id',
  authenticate,
  validateParams(galleryIdSchema),
  deleteGalleryItemHandler,
);
