import { z } from 'zod';

const idSchema = z.uuid();

export const issuedTicketIdSchema = z.object({
  id: idSchema,
});

export const orderItemIdSchema = z.object({
  orderItemId: idSchema,
});

export const issuedTicketListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const checkInTicketSchema = z.object({
  qrPayload: z.string().trim().min(1, 'QR payload is required.'),
  eventId: idSchema,
});

export type IssuedTicketIdInput = z.infer<typeof issuedTicketIdSchema>;
export type OrderItemIdInput = z.infer<typeof orderItemIdSchema>;
export type IssuedTicketListQueryInput = z.infer<typeof issuedTicketListQuerySchema>;
export type CheckInTicketInput = z.infer<typeof checkInTicketSchema>;
