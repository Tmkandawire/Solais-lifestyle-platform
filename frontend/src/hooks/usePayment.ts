import { useCallback, useEffect, useRef, useState } from "react";

import { createPayment, getPaymentById } from "../api/payment.api";

import type { CreatePaymentPayload, Payment } from "../types/payment";

import { extractErrorMessage } from "./shared/extractErrorMessage";

interface UsePaymentState {
  payment: Payment | null;
  resolvedId: string | undefined;
  resolvedKey: string | undefined;
  error: string | null;
}

export function usePayment(id?: string) {
  const [refreshKey, setRefreshKey] = useState(0);

  const [state, setState] = useState<UsePaymentState>({
    payment: null,
    resolvedId: undefined,
    resolvedKey: undefined,
    error: null,
  });

  const requestKey = id ? `${id}:${refreshKey}` : undefined;

  const hasDataForId = id !== undefined && state.resolvedId === id;

  const inFlight = requestKey !== undefined && state.resolvedKey !== requestKey;

  const loading = inFlight && !hasDataForId;
  const refreshing = inFlight && hasDataForId;

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    getPaymentById(id)
      .then((payment) => {
        if (cancelled) {
          return;
        }

        setState({
          payment,
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
          payment: current.resolvedId === id ? current.payment : null,
          resolvedId: id,
          resolvedKey: requestKey,
          error: extractErrorMessage(error, "Failed to load payment."),
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
    payment: hasDataForId ? state.payment : null,
    loading,
    refreshing,
    error: hasDataForId ? state.error : null,
    refetch,
  };
}

export function useCreatePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inFlightPromise = useRef<Promise<Payment> | null>(null);

  const execute = useCallback(
    (payload: CreatePaymentPayload): Promise<Payment> => {
      if (inFlightPromise.current) {
        return inFlightPromise.current;
      }

      setLoading(true);
      setError(null);

      const promise = createPayment(payload)
        .catch((error: unknown) => {
          setError(extractErrorMessage(error, "Failed to create payment."));

          throw error;
        })
        .finally(() => {
          inFlightPromise.current = null;
          setLoading(false);
        });

      inFlightPromise.current = promise;

      return promise;
    },
    [],
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    createPayment: execute,
    loading,
    error,
    reset,
  };
}
