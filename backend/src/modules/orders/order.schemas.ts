import { z } from 'zod';
import { OrderStatus, PaymentProvider, PaymentStatus } from '../../generated/prisma/enums.js';

/**
 * Reusable UUID validator with a field-specific error message.
 * Centralizes the UUID validation pattern used across all order schemas
 * so the message format can't drift between fields.
 */
const uuidSchema = (label: string) => z.string().uuid(`${label} must be a valid UUID.`);

/**
 * Order identifier (route param).
 */
export const orderIdSchema = z.object({
  id: uuidSchema('Order ID'),
});

/**
 * Event identifier used when creating an order.
 */
export const orderEventIdSchema = z.object({
  eventId: uuidSchema('Event ID'),
});

/**
 * Individual ticket selection within an order.
 *
 * The client supplies only the ticket type and quantity.
 * Pricing is always resolved server-side from the TicketType record.
 *
 * `quantity` is a JSON body field, not a query string — it is validated
 * as a strict number rather than coerced, so a malformed client payload
 * (e.g. a string or boolean) is rejected instead of silently converted.
 */
export const createOrderItemSchema = z.object({
  ticketTypeId: uuidSchema('Ticket type ID'),
  quantity: z
    .number()
    .int('Ticket quantity must be a whole number.')
    .positive('Ticket quantity must be greater than zero.')
    .max(20, 'You cannot purchase more than 20 tickets of this type at once.'),
});

/**
 * Creates a new order.
 *
 * An order must contain at least one ticket selection.
 *
 * The event ID is supplied separately so the service can enforce the
 * one-event-per-order invariant and verify that every selected ticket type
 * belongs to that event.
 *
 * Price, total amount, account ID, and order status are intentionally absent.
 * Those values are trusted server-side values and must never be controlled
 * by the client.
 */
export const createOrderSchema = orderEventIdSchema.extend({
  items: z
    .array(createOrderItemSchema)
    .min(1, 'An order must contain at least one ticket type.')
    .superRefine((items, ctx) => {
      const ticketTypeIds = new Set<string>();

      for (const [index, item] of items.entries()) {
        if (ticketTypeIds.has(item.ticketTypeId)) {
          ctx.addIssue({
            code: 'custom',
            path: [index, 'ticketTypeId'],
            message: 'Each ticket type may only appear once in an order.',
          });
        }

        ticketTypeIds.add(item.ticketTypeId);
      }
    }),
});

/**
 * Order listing query parameters.
 *
 * Pagination follows the same convention established by Events and Tickets.
 * `page`/`limit` are coerced because query-string values always arrive as
 * strings — unlike `quantity` above, which is a JSON body field.
 *
 * Status filtering is optional and is interpreted by the service according
 * to the authenticated actor's visibility rules.
 */
export const orderListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int('Page must be a whole number.')
    .positive('Page must be greater than zero.')
    .default(1),
  limit: z.coerce
    .number()
    .int('Limit must be a whole number.')
    .positive('Limit must be greater than zero.')
    .max(100, 'Limit cannot exceed 100.')
    .default(20),
  status: z.enum(OrderStatus).optional(),
});

export const adminOrderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  status: z.nativeEnum(OrderStatus).optional(),

  eventId: uuidSchema('eventId').optional(),

  paymentStatus: z.nativeEnum(PaymentStatus).optional(),

  paymentProvider: z.nativeEnum(PaymentProvider).optional(),

  search: z.string().trim().max(100).optional(),
});

/**
 * Order cancellation request.
 *
 * Cancellation currently requires no client-controlled fields.
 * `.strict()` ensures an unexpected body (e.g. a stray `reason` field a
 * client adds later without a schema update) fails validation instead of
 * being silently stripped and ignored.
 * The service determines whether the order is actually cancellable.
 */
export const cancelOrderSchema = z.object({}).strict();

/**
 * Inferred schema types.
 */
export type OrderIdInput = z.infer<typeof orderIdSchema>;
export type OrderEventIdInput = z.infer<typeof orderEventIdSchema>;
export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderListQueryInput = z.infer<typeof orderListQuerySchema>;
export type AdminOrderListQueryInput = z.infer<typeof adminOrderListQuerySchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
