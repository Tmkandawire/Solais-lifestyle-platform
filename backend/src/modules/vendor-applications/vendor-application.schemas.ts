import { z } from 'zod';

import { VendorApplicationStatus } from '../../generated/prisma/enums.js';

export const createVendorApplicationSchema = z.object({
  businessName: z.string().trim().min(2).max(200),
  contactPerson: z.string().trim().min(2).max(200),
  phoneNumber: z.string().trim().min(5).max(50),
  email: z.string().trim().email().max(320),
  businessCategory: z.string().trim().min(2).max(100),
  productsOrServices: z.string().trim().min(2).max(2000),
  websiteOrSocial: z.string().trim().max(500).optional(),
  preferredEventId: z.uuid().optional(),
});

export const vendorApplicationIdSchema = z.object({
  id: z.uuid(),
});

export const vendorApplicationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(VendorApplicationStatus).optional(),
});

export const reviewVendorApplicationSchema = z.object({
  adminNotes: z.string().trim().max(2000).optional(),
});

export type CreateVendorApplicationInput = z.infer<typeof createVendorApplicationSchema>;

export type VendorApplicationIdInput = z.infer<typeof vendorApplicationIdSchema>;

export type VendorApplicationListQueryInput = z.infer<typeof vendorApplicationListQuerySchema>;

export type ReviewVendorApplicationInput = z.infer<typeof reviewVendorApplicationSchema>;
