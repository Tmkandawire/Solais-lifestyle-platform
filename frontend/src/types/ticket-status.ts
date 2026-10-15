/**
 * Ticket lifecycle status.
 *
 * Ticket availability is controlled through ACTIVE / INACTIVE.
 * Inventory remaining is represented separately by the ticket type's
 * capacity and soldQuantity fields.
 */
export type TicketStatus = "ACTIVE" | "INACTIVE";

/**
 * Pagination metadata for ticket type listings.
 *
 * This follows the same resource-specific pagination convention
 * established by EventListMeta in types/event.ts.
 */
export interface TicketListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Full ticket type representation.
 *
 * Intended for authenticated/admin-facing workflows where the complete
 * inventory information is useful.
 */
export interface TicketType {
  id: string;
  eventId: string;

  name: string;
  description: string | null;

  price: string;

  capacity: number;
  soldQuantity: number;

  status: TicketStatus;

  saleStartAt: string | null;
  saleEndAt: string | null;

  createdAt: string;
  updatedAt: string;

  deletedAt: string | null;
}

/**
 * Public ticket representation.
 *
 * This is the contract consumed by attendee-facing UI.
 *
 * Internal inventory implementation details such as capacity,
 * soldQuantity, createdAt, updatedAt and deletedAt are deliberately
 * excluded.
 */
export interface PublicTicketType {
  id: string;
  eventId: string;

  name: string;
  description: string | null;

  price: string;

  availableQuantity: number;

  status: TicketStatus;

  saleStartAt: string | null;
  saleEndAt: string | null;
}

/**
 * Parameters for retrieving ticket types belonging to an event.
 *
 * Ticket types are scoped to an event, so eventId is required.
 */
export interface TicketTypeListParams {
  eventId: string;
  page?: number;
  limit?: number;
  status?: TicketStatus;
}

/**
 * Paginated admin ticket response.
 */
export interface PaginatedTicketTypes {
  ticketTypes: TicketType[];
  meta: TicketListMeta;
}

/**
 * Paginated public ticket response.
 */
export interface PaginatedPublicTicketTypes {
  ticketTypes: PublicTicketType[];
  meta: TicketListMeta;
}

/**
 * Creates a ticket type.
 *
 * Pricing is represented as a string to preserve Decimal precision.
 */
export interface CreateTicketTypePayload {
  eventId: string;

  name: string;
  description?: string | null;

  price: string;

  capacity: number;

  saleStartAt?: string | null;
  saleEndAt?: string | null;
}

/**
 * Updates mutable ticket metadata.
 *
 * Status is deliberately excluded.
 *
 * Ticket lifecycle transitions are handled through dedicated
 * activate/deactivate operations.
 */
export interface UpdateTicketTypePayload {
  name?: string;
  description?: string | null;

  price?: string;
  capacity?: number;

  saleStartAt?: string | null;
  saleEndAt?: string | null;
}
