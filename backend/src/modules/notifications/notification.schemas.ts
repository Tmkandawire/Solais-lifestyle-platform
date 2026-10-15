import { z } from 'zod';

export const notificationIdSchema = z.object({
  id: z.string().uuid('Notification ID must be a valid UUID.'),
});

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(100_000, 'Page cannot exceed 100000.').default(1),

  limit: z.coerce.number().int().positive().max(100, 'Limit cannot exceed 100.').default(20),

  unreadOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});

export type NotificationIdInput = z.infer<typeof notificationIdSchema>;

export type NotificationListQueryInput = z.infer<typeof notificationListQuerySchema>;
