import { z } from 'zod';

import { EventStatus } from '../../generated/prisma/enums.js';

const eventBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required.')
    .max(200, 'Title must not exceed 200 characters.'),

  description: z
    .string()
    .trim()
    .min(1, 'Description is required.')
    .max(5000, 'Description must not exceed 5000 characters.'),

  venue: z
    .string()
    .trim()
    .min(1, 'Venue is required.')
    .max(255, 'Venue must not exceed 255 characters.'),

  city: z
    .string()
    .trim()
    .min(1, 'City is required.')
    .max(100, 'City must not exceed 100 characters.'),

  startDate: z.coerce.date(),

  endDate: z.coerce.date(),

  bannerImageUrl: z
    .string()
    .trim()
    .url('Banner image URL must be a valid URL.')
    .optional()
    .nullable(),

  capacity: z.coerce
    .number()
    .int('Capacity must be a whole number.')
    .positive('Capacity must be greater than zero.')
    .optional()
    .nullable(),
});

export const createEventSchema = eventBaseSchema.superRefine((data, context) => {
  if (data.endDate <= data.startDate) {
    context.addIssue({
      code: 'custom',
      path: ['endDate'],
      message: 'End date must be after start date.',
    });
  }
});

export const updateEventSchema = eventBaseSchema
  .partial()
  .superRefine((data, context) => {
    if (data.startDate !== undefined && data.endDate !== undefined) {
      if (data.endDate <= data.startDate) {
        context.addIssue({
          code: 'custom',
          path: ['endDate'],
          message: 'End date must be after start date.',
        });
      }
    }
  })
  .refine((data) => Object.keys(data).length > 0, 'At least one field must be provided.');

export const eventIdSchema = z.object({
  id: z.uuid('Event ID must be a valid UUID.'),
});

export const eventListQuerySchema = z.object({
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

  status: z.enum(EventStatus).optional(),

  city: z.string().trim().min(1).max(100).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventIdInput = z.infer<typeof eventIdSchema>;
export type EventListQueryInput = z.infer<typeof eventListQuerySchema>;
