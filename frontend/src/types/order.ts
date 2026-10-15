import type { OrderStatus } from "./order-status";
import type { Paginated } from "./pagination";
import type { PaymentProvider } from "./payment-provider";
import type { PaymentStatus } from "./payment-status";

/**
 * Individual item belonging to an order.
 *
 * ticketTypeName and unitPrice represent the values captured
 * at the time the order was created.
 */
export interface OrderItem {
  id: string;
  orderId: string;
  ticketTypeId: string;
  ticketTypeName: string;

  quantity: number;
  unitPrice: string;

  createdAt: string;
}

/**
 * Summary of the payment for an order.
 *
 */
export interface OrderPaymentSummary {
  id: string;
  status: PaymentStatus;
  provider: PaymentProvider;
}

/**
 * Attendee order.
 *
 * An order is scoped to a single event. The event itself is
 * referenced by eventId rather than having event display data
 * duplicated into the order record.
 */
export interface Order {
  id: string;
  accountId: string;
  eventId: string;

  status: OrderStatus;

  totalAmount: string;

  expiresAt: string;
  paidAt: string | null;
  cancelledAt: string | null;

  items: OrderItem[];
  payment: OrderPaymentSummary | null;

  createdAt: string;
  updatedAt: string;
}

/**
 * Payload for creating an order.
 *
 * Prices and the total amount are intentionally excluded because
 * the backend resolves authoritative ticket prices and calculates
 * the order total.
 */
export interface CreateOrderItemPayload {
  ticketTypeId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  eventId: string;
  items: CreateOrderItemPayload[];
}

/**
 * Parameters for retrieving the authenticated attendee's orders.
 */
export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

/**
 * Paginated order response.
 *
 * Uses the shared pagination contract for all new paginated resources.
 */
export type PaginatedOrders = Paginated<Order>;
