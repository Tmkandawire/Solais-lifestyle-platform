import { z } from 'zod';

import { MediaType } from '../../generated/prisma/enums.js';

const galleryBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required.')
    .max(200, 'Title must not exceed 200 characters.'),

  description: z
    .string()
    .trim()
    .max(5000, 'Description must not exceed 5000 characters.')
    .optional()
    .nullable(),

  mediaType: z.enum(MediaType),

  mediaUrl: z.string().trim().url('Media URL must be a valid URL.'),

  thumbnailUrl: z.string().trim().url('Thumbnail URL must be a valid URL.').optional().nullable(),

  publicId: z
    .string()
    .trim()
    .min(1, 'Public ID is required.')
    .max(500, 'Public ID must not exceed 500 characters.'),

  eventId: z.uuid('Event ID must be a valid UUID.').optional().nullable(),

  displayOrder: z.coerce
    .number()
    .int('Display order must be a whole number.')
    .min(0, 'Display order cannot be negative.')
    .optional(),
});

/**
 * Creates a new gallery item.
 *
 * Publication state is deliberately excluded from the request.
 * New gallery items are controlled by the service layer.
 */
export const createGalleryItemSchema = galleryBaseSchema;

/**
 * Updates an existing gallery item.
 *
 * Publication state is deliberately excluded from the generic update path.
 * Use the dedicated publish/unpublish endpoints instead.
 */
export const updateGalleryItemSchema = galleryBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'At least one field must be provided.');

/**
 * Gallery item ID parameter.
 */
export const galleryIdSchema = z.object({
  id: z.uuid('Gallery ID must be a valid UUID.'),
});

/**
 * Event ID parameter used when retrieving an event's gallery.
 */
export const galleryEventIdSchema = z.object({
  eventId: z.uuid('Event ID must be a valid UUID.'),
});

/**
 * Gallery listing query parameters.
 */
export const galleryListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int('Page must be a whole number.')
    .min(1, 'Page must be at least 1.')
    .default(1),

  limit: z.coerce
    .number()
    .int('Limit must be a whole number.')
    .min(1, 'Limit must be at least 1.')
    .max(100, 'Limit must not exceed 100.')
    .default(20),

  mediaType: z.enum(MediaType).optional(),

  eventId: z.uuid('Event ID must be a valid UUID.').optional(),

  isPublished: z.coerce.boolean().optional(),
});

export type CreateGalleryItemInput = z.infer<typeof createGalleryItemSchema>;
export type UpdateGalleryItemInput = z.infer<typeof updateGalleryItemSchema>;
export type GalleryIdInput = z.infer<typeof galleryIdSchema>;
export type GalleryEventIdInput = z.infer<typeof galleryEventIdSchema>;
export type GalleryListQueryInput = z.infer<typeof galleryListQuerySchema>;
