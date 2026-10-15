import { useCallback, useEffect, useState } from "react";

import { getAdminOrders } from "../api/admin-order.api";
import { ADMIN_ORDERS_PAGE_SIZE } from "../constants/admin-order";
import { extractErrorMessage } from "./shared/extractErrorMessage";

import type {
  AdminOrderList,
  AdminOrderListParams,
} from "../types/admin-order";

const EMPTY_RESULT: AdminOrderList = {
  orders: [],
  meta: {
    total: 0,
    page: 1,
    limit: ADMIN_ORDERS_PAGE_SIZE,
    totalPages: 0,
  },
};

interface RequestResult {
  key: string;
  data: AdminOrderList;
  error: string | null;
}

export function useAdminOrders(params: AdminOrderListParams = {}) {
  const {
    page = 1,
    limit = ADMIN_ORDERS_PAGE_SIZE,
    status,
    eventId,
    paymentStatus,
    paymentProvider,
    search,
  } = params;

  const normalizedSearch = search?.trim() ?? "";

  const [refreshVersion, setRefreshVersion] = useState(0);
  const [result, setResult] = useState<RequestResult | null>(null);

  const requestKey = JSON.stringify({
    page,
    limit,
    status: status ?? "",
    eventId: eventId ?? "",
    paymentStatus: paymentStatus ?? "",
    paymentProvider: paymentProvider ?? "",
    search: normalizedSearch,
    refreshVersion,
  });

  // True from the moment the inputs change until the matching response lands.
  const loading = result?.key !== requestKey;

  const refetch = useCallback(() => {
    setRefreshVersion((current) => current + 1);
  }, [setRefreshVersion]);

  useEffect(() => {
    // The signal is passed to axios, so superseded requests are really
    // cancelled, not just ignored when they resolve.
    const controller = new AbortController();

    getAdminOrders(
      {
        page,
        limit,
        ...(status ? { status } : {}),
        ...(eventId ? { eventId } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
        ...(paymentProvider ? { paymentProvider } : {}),
        ...(normalizedSearch ? { search: normalizedSearch } : {}),
      },
      controller.signal,
    )
      .then((data) => {
        if (controller.signal.aborted) return;
        setResult({ key: requestKey, data, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          key: requestKey,
          data: EMPTY_RESULT,
          error: extractErrorMessage(error, "Failed to load orders."),
        });
      });

    return () => controller.abort();
  }, [
    page,
    limit,
    status,
    eventId,
    paymentStatus,
    paymentProvider,
    normalizedSearch,
    requestKey,
  ]);

  return {
    // Previous results stay on screen while a new request is in flight, so
    // paging, filtering and refreshing do not flash an empty table. After a
    // failure the data is EMPTY_RESULT, so stale rows are never shown as current.
    orders: result?.data.orders ?? EMPTY_RESULT.orders,
    meta: result?.data.meta ?? EMPTY_RESULT.meta,
    loading,
    error: loading ? null : (result?.error ?? null),
    refetch,
  };
}
