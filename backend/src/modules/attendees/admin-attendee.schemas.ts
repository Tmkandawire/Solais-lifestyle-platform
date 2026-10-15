import { z } from 'zod';

const uuidSchema = (label: string) => z.string().uuid(`${label} must be a valid UUID.`);

export const adminAttendeeIdSchema = z.object({
  id: uuidSchema('Attendee ID'),
});

export const adminAttendeeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000, 'Page cannot exceed 100,000.').default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export type AdminAttendeeIdInput = z.infer<typeof adminAttendeeIdSchema>;

export type AdminAttendeeListQueryInput = z.infer<typeof adminAttendeeListQuerySchema>;
