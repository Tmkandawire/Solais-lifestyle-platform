import { z } from 'zod';
import { ContactMessageStatus } from '../../generated/prisma/enums.js';

export const createContactMessageSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.email().max(254),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10).max(5000),
});

export const contactMessageIdSchema = z.object({
  id: z.uuid(),
});

export const contactMessageListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(ContactMessageStatus).optional(),
  search: z.string().trim().max(200).optional(),
});

export const updateContactMessageStatusSchema = z.object({
  status: z.enum(ContactMessageStatus),
});

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;
export type ContactMessageIdInput = z.infer<typeof contactMessageIdSchema>;
export type ContactMessageListQueryInput = z.infer<typeof contactMessageListQuerySchema>;
export type UpdateContactMessageStatusInput = z.infer<typeof updateContactMessageStatusSchema>;
