import { useCallback, useEffect, useRef, useState } from "react";

import {
  cancelEvent,
  completeEvent,
  createEvent,
  deleteEvent,
  getAdminEventById,
  getAdminEvents,
  publishEvent,
  updateEvent,
} from "../api/event.api";

import { extractErrorMessage } from "../hooks/shared/extractErrorMessage";

import type {
  AdminEvent,
  AdminEventList,
  AdminEventListParams,
  UpdateEventPayload,
} from "../types/event";

/**
 * Fetch and manage the admin event list.
 *
 * Loading is derived by comparing the currently-resolved data's key
 * against the key of the request the current params/refresh would
 * produce — no synchronous setState reset in the effect body, and no
 * extra render cycle on every fetch start.
 */
export function useAdminEvents(params?: AdminEventListParams) {
  const { page, limit, status, city } = params ?? {};

  const [result, setResult] = useState<{
    key: string | undefined;
    data: AdminEventList;
  }>({
    key: undefined,
    data: {
      events: [],
      meta: { total: 0, page: page ?? 1, limit: limit ?? 20, totalPages: 0 },
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const latestRequestId = useRef(0);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const requestKey = `${page ?? ""}:${limit ?? ""}:${status ?? ""}:${city ?? ""}:${refreshToken}`;
  const isLoading = result.key !== requestKey;

  useEffect(() => {
    const requestId = ++latestRequestId.current;

    getAdminEvents({ page, limit, status, city })
      .then((data) => {
        if (latestRequestId.current !== requestId) return;
        setResult({ key: requestKey, data });
        setError(null);
      })
      .catch((err: unknown) => {
        if (latestRequestId.current !== requestId) return;
        setError(extractErrorMessage(err, "Failed to load events."));
        setResult((current) => ({ ...current, key: requestKey }));
      });
  }, [page, limit, status, city, refreshToken, requestKey]);

  return {
    events: result.data.events,
    meta: result.data.meta,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Fetch a single admin event by ID.
 */
export function useAdminEvent(id?: string) {
  const [result, setResult] = useState<{
    key: string | undefined;
    event: AdminEvent | null;
  }>({ key: undefined, event: null });

  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const latestRequestId = useRef(0);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const requestKey = id ? `${id}:${refreshToken}` : undefined;
  const isLoading = requestKey !== undefined && result.key !== requestKey;

  useEffect(() => {
    if (!id || !requestKey) {
      return;
    }

    const requestId = ++latestRequestId.current;

    getAdminEventById(id)
      .then((event) => {
        if (latestRequestId.current !== requestId) return;
        setResult({ key: requestKey, event });
        setError(null);
      })
      .catch((err: unknown) => {
        if (latestRequestId.current !== requestId) return;
        setError(extractErrorMessage(err, "Failed to load event."));
        setResult((current) => ({ ...current, key: requestKey }));
      });
  }, [id, requestKey]);

  return {
    event: result.event,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Shared scaffolding for a single imperative admin mutation:
 * loading/error state plus a stable execute() wrapper. Not an effect,
 * so the set-state-in-effect rule doesn't apply here — these setState
 * calls happen inside a callback the caller invokes, not synchronously
 * during render/commit.
 */
function useAdminEventAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  fallbackMessage: string,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      setIsLoading(true);
      setError(null);

      try {
        return await action(...args);
      } catch (err) {
        setError(extractErrorMessage(err, fallbackMessage));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [action, fallbackMessage],
  );

  return { execute, isLoading, error };
}

export function useCreateEvent() {
  const { execute, isLoading, error } = useAdminEventAction(
    createEvent,
    "Failed to create event.",
  );
  return { create: execute, isLoading, error };
}

export function useUpdateEvent() {
  const { execute, isLoading, error } = useAdminEventAction(
    (id: string, payload: UpdateEventPayload) => updateEvent(id, payload),
    "Failed to update event.",
  );
  return { update: execute, isLoading, error };
}

export function usePublishEvent() {
  const { execute, isLoading, error } = useAdminEventAction(
    publishEvent,
    "Failed to publish event.",
  );
  return { publish: execute, isLoading, error };
}

export function useCancelEvent() {
  const { execute, isLoading, error } = useAdminEventAction(
    cancelEvent,
    "Failed to cancel event.",
  );
  return { cancel: execute, isLoading, error };
}

export function useCompleteEvent() {
  const { execute, isLoading, error } = useAdminEventAction(
    completeEvent,
    "Failed to complete event.",
  );
  return { complete: execute, isLoading, error };
}

export function useDeleteEvent() {
  const { execute, isLoading, error } = useAdminEventAction(
    deleteEvent,
    "Failed to delete event.",
  );
  return { remove: execute, isLoading, error };
}
