import { useCallback, useEffect, useRef, useState } from "react";

import { getAdminOrderById } from "../api/admin-order.api";
import { extractErrorMessage } from "./shared/extractErrorMessage";

import type { AdminOrder } from "../types/admin-order";

interface DetailState {
  isOpen: boolean;
  order: AdminOrder | null;
  loading: boolean;
  error: string | null;
}

const CLOSED: DetailState = {
  isOpen: false,
  order: null,
  loading: false,
  error: null,
};

/**
 * Owns the order-detail modal's data. A new open or a close aborts any request
 * still in flight, so a late response can never reopen a closed modal or show
 * the wrong order.
 */
export function useAdminOrderDetail() {
  const [state, setState] = useState<DetailState>(CLOSED);
  const controllerRef = useRef<AbortController | null>(null);
  const lastIdRef = useRef<string | null>(null);

  const openOrder = useCallback(async (id: string) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    lastIdRef.current = id;

    setState({ isOpen: true, order: null, loading: true, error: null });

    try {
      const order = await getAdminOrderById(id, controller.signal);
      if (controller.signal.aborted) return;
      setState({ isOpen: true, order, loading: false, error: null });
    } catch (error: unknown) {
      if (controller.signal.aborted) return;
      setState({
        isOpen: true,
        order: null,
        loading: false,
        error: extractErrorMessage(error, "Unable to load this order."),
      });
    }
  }, []);

  const closeOrder = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    lastIdRef.current = null;
    setState(CLOSED);
  }, []);

  const retry = useCallback(() => {
    if (lastIdRef.current) void openOrder(lastIdRef.current);
  }, [openOrder]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  return { ...state, openOrder, closeOrder, retry };
}
