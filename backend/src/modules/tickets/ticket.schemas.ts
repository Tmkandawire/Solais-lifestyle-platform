import { z } from 'zod';
import { TicketStatus } from '../../generated/prisma/enums.js';

/**
 * Ticket type identifier.
 */
export const ticketTypeIdSchema = z.object({
  id: z.string().uuid('Ticket type ID must be a valid UUID.'),
});

/**
 * Event identifier as it appears on ticket routes, where the path
 * segment is `:eventId` (not `:id` as in event.routes.ts). Using
 * event.schemas.ts's eventIdSchema here was the bug: that schema
 * validates a field named `id`, which never exists on these routes'
 * request.params, so validation always failed regardless of the
 * actual value in the URL.
 */
export const eventIdParamSchema = z.object({
  eventId: z.string().uuid('Event ID must be a valid UUID.'),
});

/**
 * Monetary amount shared by create/update schemas.
 *
 * Accepts either a number or a string but never coerces through JS floating
 * point arithmetic — the value is validated structurally (non-negative, at
 * most 2 fractional digits) and passed through as a string, so Prisma's
 * Decimal parser performs the exact conversion instead of a JS Number
 * round-trip. This matters because the underlying column is
 * Decimal(12, 2); losing that precision guarantee here would defeat the
 * point of using Decimal at all, right before Orders/Payments are built on
 * top of it.
 */
const priceSchema = z
  .union([z.number(), z.string()])
  .transform((val) => (typeof val === 'number' ? val.toString() : val.trim()))
  .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
    message: 'Ticket price must be a non-negative amount with up to 2 decimal places.',
  });

/**
 * Shared cross-field check: if both sale window bounds are present,
 * the end must be strictly after the start. Mirrors the same rule Events
 * enforces directly in its create/update schemas (endDate > startDate),
 * so this fails fast as a 400 at the validation layer rather than
 * reaching the service and surfacing as a 409.
 */
function hasValidSaleWindow(data: {
  saleStartAt?: Date | null | undefined;
  saleEndAt?: Date | null | undefined;
}): boolean {
  if (
    data.saleStartAt === null ||
    data.saleStartAt === undefined ||
    data.saleEndAt === null ||
    data.saleEndAt === undefined
  ) {
    return true;
  }

  return data.saleEndAt > data.saleStartAt;
}

const SALE_WINDOW_ISSUE = {
  message: 'Ticket sale end time must be after the sale start time.',
  path: ['saleEndAt'],
};

/**
 * Creates a new ticket type.
 *
 * Business rules such as event state and authorization remain in the
 * service layer. The sale-window ordering check below is a structural
 * validation rule (not a business-state rule), so it belongs here.
 */
export const createTicketTypeSchema = z
  .object({
    eventId: z.string().uuid('Event ID must be a valid UUID.'),
    name: z
      .string()
      .trim()
      .min(1, 'Ticket name is required.')
      .max(100, 'Ticket name must not exceed 100 characters.'),
    description: z
      .string()
      .trim()
      .max(1000, 'Ticket description must not exceed 1000 characters.')
      .nullable()
      .optional(),
    price: priceSchema,
    capacity: z.coerce
      .number()
      .int('Ticket capacity must be a whole number.')
      .positive('Ticket capacity must be greater than zero.'),
    saleStartAt: z.coerce.date().nullable().optional(),
    saleEndAt: z.coerce.date().nullable().optional(),
  })
  .refine(hasValidSaleWindow, SALE_WINDOW_ISSUE);

/**
 * Updates the non-lifecycle fields of a ticket type.
 *
 * `status` is intentionally absent. Ticket status changes must go through
 * the dedicated activate/deactivate endpoints.
 *
 * At least one field must be provided — an empty body is rejected here
 * rather than silently reaching the service as a no-op update, matching
 * the same rule Events enforces on its update schema.
 */
export const updateTicketTypeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Ticket name cannot be empty.')
      .max(100, 'Ticket name must not exceed 100 characters.')
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, 'Ticket description must not exceed 1000 characters.')
      .nullable()
      .optional(),
    price: priceSchema.optional(),
    capacity: z.coerce
      .number()
      .int('Ticket capacity must be a whole number.')
      .positive('Ticket capacity must be greater than zero.')
      .optional(),
    saleStartAt: z.coerce.date().nullable().optional(),
    saleEndAt: z.coerce.date().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  })
  .refine(hasValidSaleWindow, SALE_WINDOW_ISSUE);

/**
 * Ticket type listing query parameters.
 */
export const ticketTypeListQuerySchema = z.object({
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
  status: z.enum(TicketStatus).optional(),
});

/**
 * Ticket purchase/reservation quantity.
 *
 * NOTE: the 20-ticket cap below is an API policy decision, not a structural
 * requirement. Confirm it against the SRS/business requirements before
 * shipping — remove it if it isn't a documented rule rather than leaving
 * an arbitrary limit in place.
 */
export const reserveTicketSchema = z.object({
  quantity: z.coerce
    .number()
    .int('Ticket quantity must be a whole number.')
    .positive('Ticket quantity must be greater than zero.')
    .max(20, 'You cannot reserve more than 20 tickets at once.'),
});

/**
 * Explicit ticket lifecycle operations.
 *
 * These schemas intentionally contain no client-controlled status field.
 * The endpoint itself determines the lifecycle transition.
 * inventory reaching capacity, which is an order/inventory design decision,
 * not something to invent behavior for at the schema layer.
 */
export const activateTicketTypeSchema = z.object({});
export const deactivateTicketTypeSchema = z.object({});

/**
 * Inferred schema types.
 */
export type TicketTypeIdInput = z.infer<typeof ticketTypeIdSchema>;
export type CreateTicketTypeInput = z.infer<typeof createTicketTypeSchema>;
export type UpdateTicketTypeInput = z.infer<typeof updateTicketTypeSchema>;
export type TicketTypeListQueryInput = z.infer<typeof ticketTypeListQuerySchema>;
export type ReserveTicketInput = z.infer<typeof reserveTicketSchema>;
