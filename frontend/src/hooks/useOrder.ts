import { useCallback, useEffect, useRef, useState } from "react";

import {
  cancelOrder,
  createOrder,
  getOrderById,
  getOrders,
} from "../api/order.api";

import { extractErrorMessage } from "./shared/extractErrorMessage";

import type {
  CreateOrderPayload,
  Order,
  OrderListParams,
  PaginatedOrders,
} from "../types/order";

interface UseOrdersState {
  data: PaginatedOrders["data"];
  meta: PaginatedOrders["meta"] | null;
  resolvedKey: string | undefined;
  error: string | null;
}

/**
 * Retrieves a paginated list of orders.
 *
 * The backend remains responsible for:
 * - attendee ownership
 * - authorization
 * - pagination
 * - status filtering
 * - order lifecycle rules
 */
export function useOrders(params?: OrderListParams) {
  const { page, limit, status } = params ?? {};

  const [state, setState] = useState<UseOrdersState>({
    data: [],
    meta: null,
    resolvedKey: undefined,
    error: null,
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const latestRequestId = useRef(0);

  const requestKey = `${page ?? ""}:${limit ?? ""}:${status ?? ""}:${refreshKey}`;

  const loading = state.resolvedKey !== requestKey;

  const refetch = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    const requestId = ++latestRequestId.current;

    getOrders({ page, limit, status })
      .then((response) => {
        if (latestRequestId.current !== requestId) {
          return;
        }

        setState({
          data: response.data,
          meta: response.meta,
          resolvedKey: requestKey,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (latestRequestId.current !== requestId) {
          return;
        }

        setState((current) => ({
          ...current,
          resolvedKey: requestKey,
          error: extractErrorMessage(err, "Failed to load orders."),
        }));
      });
  }, [page, limit, status, refreshKey, requestKey]);

  return {
    orders: state.data,
    meta: state.meta,
    loading,
    error: state.error,
    refetch,
  };
}

/**
 * Retrieves a single order by ID.
 *
 * Returns null when no order ID is supplied.
 */
export function useOrder(id?: string) {
  const [refreshKey, setRefreshKey] = useState(0);

  const [state, setState] = useState<{
    order: Order | null;
    resolvedId: string | undefined;
    resolvedKey: string | undefined;
    error: string | null;
  }>({
    order: null,
    resolvedId: undefined,
    resolvedKey: undefined,
    error: null,
  });

  const requestKey = id ? `${id}:${refreshKey}` : undefined;

  const hasDataForId = id !== undefined && state.resolvedId === id;

  const loading =
    id !== undefined &&
    (state.resolvedId !== id || state.resolvedKey !== requestKey);

  const refreshing = loading && hasDataForId;

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    getOrderById(id)
      .then((order) => {
        if (cancelled) {
          return;
        }

        setState({
          order,
          resolvedId: id,
          resolvedKey: requestKey,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setState((current) => ({
          order: current.resolvedId === id ? current.order : null,
          resolvedId: current.resolvedId === id ? current.resolvedId : id,
          resolvedKey: requestKey,
          error: extractErrorMessage(error, "Failed to load order."),
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [id, requestKey]);

  const refetch = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  return {
    order: hasDataForId ? state.order : null,
    loading,
    refreshing,
    error: hasDataForId ? state.error : null,
    refetch,
  };
}

/**
 * Creates a new order.
 *
 * The backend owns price calculation, inventory reservation,
 * validation, and order expiry.
 */
export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (payload: CreateOrderPayload): Promise<Order> => {
      setLoading(true);
      setError(null);

      try {
        const order = await createOrder(payload);
        return order;
      } catch (err: unknown) {
        setError(extractErrorMessage(err, "Failed to create order."));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    createOrder: execute,
    loading,
    error,
  };
}

/**
 * Cancels an existing pending order.
 *
 * The backend owns the order-state transition and inventory release.
 */
export function useCancelOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (id: string): Promise<Order> => {
    setLoading(true);
    setError(null);

    try {
      const order = await cancelOrder(id);
      return order;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to cancel order."));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cancelOrder: execute,
    loading,
    error,
  };
}
