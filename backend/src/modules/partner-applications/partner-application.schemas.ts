import { z } from 'zod';

import { PartnerApplicationStatus } from '../../generated/prisma/enums.js';

export const createPartnerApplicationSchema = z.object({
  organisationName: z.string().trim().min(2).max(200),
  contactPerson: z.string().trim().min(2).max(200),
  phoneNumber: z.string().trim().min(5).max(50),
  email: z.string().trim().email().max(320),
  partnershipType: z.string().trim().min(2).max(100),
  organisationDescription: z.string().trim().min(2).max(2000),
  partnershipInterest: z.string().trim().min(2).max(2000),
  contributionDescription: z.string().trim().min(2).max(2000),
  websiteOrSocial: z.string().trim().max(500).optional(),
  preferredEventId: z.uuid().optional(),
});

export const partnerApplicationIdSchema = z.object({
  id: z.uuid(),
});

export const partnerApplicationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(PartnerApplicationStatus).optional(),
});

export const reviewPartnerApplicationSchema = z.object({
  adminNotes: z.string().trim().max(2000).optional(),
});

export type CreatePartnerApplicationInput = z.infer<typeof createPartnerApplicationSchema>;

export type PartnerApplicationIdInput = z.infer<typeof partnerApplicationIdSchema>;

export type PartnerApplicationListQueryInput = z.infer<typeof partnerApplicationListQuerySchema>;

export type ReviewPartnerApplicationInput = z.infer<typeof reviewPartnerApplicationSchema>;
