import { apiClient } from "./client";
import type { ApiSuccessResponse } from "../types/api";
import type { Paginated } from "../types/pagination";
import type {
  CreateOrderPayload,
  Order,
  OrderListParams,
} from "../types/order";

type OrderResponse = ApiSuccessResponse<Order>;
interface BackendOrdersPayload {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type OrdersResponse = ApiSuccessResponse<BackendOrdersPayload>;

/**
 * Creates an order for the authenticated attendee.
 *
 * POST /orders
 *
 * The backend is responsible for:
 * - validating the event
 * - validating ticket types
 * - validating sale windows
 * - reserving inventory
 * - resolving authoritative ticket prices
 * - calculating the order total
 * - creating the order expiry
 */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const response = await apiClient.post<OrderResponse>("/orders", payload);
  return response.data.data;
}

/**
 * Retrieves orders belonging to the authenticated attendee.
 *
 * GET /orders
 */
export async function getOrders(
  params?: OrderListParams,
): Promise<Paginated<Order>> {
  const response = await apiClient.get<OrdersResponse>("/orders", {
    params,
  });

  const { orders, total, page, limit, totalPages } = response.data.data;

  return {
    data: orders,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/**
 * Retrieves a single order by ID.
 *
 * GET /orders/:id
 */
export async function getOrderById(id: string): Promise<Order> {
  const response = await apiClient.get<OrderResponse>(`/orders/${id}`);
  return response.data.data;
}

/**
 * Cancels a pending order.
 *
 * POST /orders/:id/cancel
 *
 * The backend is responsible for validating ownership, checking
 * the order status, transitioning the order to CANCELLED, and
 * releasing the reserved inventory.
 */
export async function cancelOrder(id: string): Promise<Order> {
  const response = await apiClient.post<OrderResponse>(
    `/orders/${id}/cancel`,
    {},
  );
  return response.data.data;
}
