import { z } from 'zod';
import { AnnouncementStatus } from '../../generated/prisma/enums.js';

export const announcementIdSchema = z.object({
  id: z.uuid(),
});

export const announcementInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
});

export const announcementListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(AnnouncementStatus).optional(),
  search: z.string().trim().max(200).optional(),
});

export const publicAnnouncementQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type AnnouncementInput = z.infer<typeof announcementInputSchema>;
export type AnnouncementIdInput = z.infer<typeof announcementIdSchema>;
export type AnnouncementListQueryInput = z.infer<typeof announcementListQuerySchema>;
export type PublicAnnouncementQueryInput = z.infer<typeof publicAnnouncementQuerySchema>;
