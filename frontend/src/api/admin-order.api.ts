import { apiClient } from "./client";
import type { ApiSuccessResponse } from "../types/api";
import type {
  AdminOrder,
  AdminOrderList,
  AdminOrderListMeta,
  AdminOrderListParams,
} from "../types/admin-order";

interface BackendAdminOrdersPayload extends AdminOrderListMeta {
  orders: AdminOrder[];
}

export async function getAdminOrders(
  params?: AdminOrderListParams,
  signal?: AbortSignal,
): Promise<AdminOrderList> {
  const response = await apiClient.get<
    ApiSuccessResponse<BackendAdminOrdersPayload>
  >("/admin/orders", { params, signal });

  const { orders, total, page, limit, totalPages } = response.data.data;

  return {
    orders,
    meta: { total, page, limit, totalPages },
  };
}

export async function getAdminOrderById(
  id: string,
  signal?: AbortSignal,
): Promise<AdminOrder> {
  const response = await apiClient.get<ApiSuccessResponse<AdminOrder>>(
    `/admin/orders/${encodeURIComponent(id)}`,
    { signal },
  );

  return response.data.data;
}
