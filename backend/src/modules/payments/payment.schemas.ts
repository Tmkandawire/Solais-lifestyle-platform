import { z } from 'zod';
import { PaymentProvider, PaymentStatus } from '../../generated/prisma/enums.js';

/**
 * Reusable UUID validator with a field-specific error message.
 */
const uuidSchema = (label: string) => z.string().uuid(`${label} must be a valid UUID.`);

export const createPaymentSchema = z.object({
  orderId: uuidSchema('Order ID'),
  provider: z.enum(PaymentProvider),
});

export const paymentIdSchema = z.object({
  id: uuidSchema('Payment ID'),
});

/**
 * Administrative/manual payment-success operation.
 *
 * This is NOT a payment-provider webhook payload.
 */
export const paymentSuccessfulSchema = z.object({
  providerReference: z.string().trim().min(1, 'Provider reference is required.').max(255),
});

/**
 * Administrative/manual payment-failure operation.
 */
export const paymentFailedSchema = z.object({
  failureReason: z.string().trim().min(1, 'Failure reason is required.').max(1000),
});

/**
 * Provider webhook payload.
 *
 * The exact provider payload will be adapted at the integration boundary
 * once the payment provider is confirmed.
 */
export const paymentWebhookSchema = z.discriminatedUnion('status', [
  z.object({
    providerReference: z.string().trim().min(1, 'Provider reference is required.').max(255),
    status: z.literal(PaymentStatus.SUCCESS),
  }),
  z.object({
    providerReference: z.string().trim().min(1, 'Provider reference is required.').max(255),
    status: z.literal(PaymentStatus.FAILED),
    failureReason: z.string().trim().min(1, 'Failure reason is required.').max(1000),
  }),
]);

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type PaymentIdInput = z.infer<typeof paymentIdSchema>;
export type PaymentSuccessfulInput = z.infer<typeof paymentSuccessfulSchema>;
export type PaymentFailedInput = z.infer<typeof paymentFailedSchema>;
export type PaymentWebhookInput = z.infer<typeof paymentWebhookSchema>;
