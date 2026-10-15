import { useCallback, useEffect, useRef, useState } from "react";

import {
  activateTicketType,
  createTicketType,
  deactivateTicketType,
  deleteTicketType,
  getManagedTicketById,
  getManagedTicketsByEvent,
  updateTicketType,
} from "../api/ticket.api";

import { extractErrorMessage } from "../hooks/shared/extractErrorMessage";

import type {
  PaginatedTicketTypes,
  TicketType,
  TicketTypeListParams,
  UpdateTicketTypePayload,
} from "../types/ticket";
/**
 * Shared empty list reference to avoid unnecessary allocations.
 */
const EMPTY_TICKET_TYPES: TicketType[] = [];

/**
 * State for the admin ticket-type list.
 *
 * Keeping the event ID, request key, data, and error together ensures
 * that data and errors remain associated with the request that produced
 * them.
 */
type ListState = {
  eventId: string | undefined;
  key: string | undefined;
  data: PaginatedTicketTypes;
  error: string | null;
};

/**
 * Fetch and manage ticket types for an admin-selected event.
 *
 * Features:
 * - Event-scoped data and error state.
 * - Stale-request protection.
 * - Loading derived from the current request key.
 * - Refresh without discarding existing data.
 * - Separate initial loading and background refreshing states.
 *
 * Data from one event is never exposed as the data for another event.
 */
export function useAdminTicketTypes(
  eventId?: string,
  params?: TicketTypeListParams,
) {
  const { page, limit, status } = params ?? {};

  const [state, setState] = useState<ListState>({
    eventId: undefined,
    key: undefined,
    data: {
      ticketTypes: EMPTY_TICKET_TYPES,
      meta: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    },
    error: null,
  });

  const [refreshToken, setRefreshToken] = useState(0);
  const latestRequestId = useRef(0);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const requestKey = eventId
    ? `${eventId}:${page ?? ""}:${limit ?? ""}:${status ?? ""}:${refreshToken}`
    : undefined;

  const hasDataForEvent = eventId !== undefined && state.eventId === eventId;

  const isLoading = requestKey !== undefined && state.key !== requestKey;

  const isRefreshing = isLoading && hasDataForEvent;

  useEffect(() => {
    // Invalidate previous requests even when eventId becomes undefined.
    const requestId = ++latestRequestId.current;

    if (!eventId || !requestKey) {
      return;
    }

    getManagedTicketsByEvent(eventId, {
      page,
      limit,
      status,
    })
      .then((data) => {
        if (latestRequestId.current !== requestId) {
          return;
        }

        setState({
          eventId,
          key: requestKey,
          data,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (latestRequestId.current !== requestId) {
          return;
        }

        setState((current) => ({
          eventId,
          key: requestKey,
          data:
            current.eventId === eventId
              ? current.data
              : {
                  ticketTypes: EMPTY_TICKET_TYPES,
                  meta: {
                    total: 0,
                    page: page ?? 1,
                    limit: limit ?? 20,
                    totalPages: 0,
                  },
                },
          error: extractErrorMessage(err, "Failed to load ticket types."),
        }));
      });
  }, [eventId, page, limit, status, requestKey]);

  return {
    ticketTypes: hasDataForEvent ? state.data.ticketTypes : EMPTY_TICKET_TYPES,

    meta: hasDataForEvent
      ? state.data.meta
      : {
          total: 0,
          page: page ?? 1,
          limit: limit ?? 20,
          totalPages: 0,
        },

    isLoading,
    isRefreshing,

    error: hasDataForEvent && state.key === requestKey ? state.error : null,

    refresh,
  };
}

/**
 * Fetch a single ticket type for the admin detail page.
 *
 * Features:
 * - Ticket-ID-scoped data and error state.
 * - Stale-request protection.
 * - Loading derived from the current request key.
 * - Refresh without discarding existing data.
 *
 * Data from one ticket type is never exposed as the data for another
 * ticket type.
 */
export function useAdminTicket(ticketTypeId?: string) {
  const [state, setState] = useState<{
    ticketTypeId: string | undefined;
    key: string | undefined;
    ticketType: TicketType | null;
    error: string | null;
  }>({
    ticketTypeId: undefined,
    key: undefined,
    ticketType: null,
    error: null,
  });

  const [refreshToken, setRefreshToken] = useState(0);
  const latestRequestId = useRef(0);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const requestKey = ticketTypeId
    ? `${ticketTypeId}:${refreshToken}`
    : undefined;

  const hasDataForTicket =
    ticketTypeId !== undefined &&
    state.ticketTypeId === ticketTypeId &&
    state.ticketType !== null;

  const isLoading = requestKey !== undefined && state.key !== requestKey;

  const isRefreshing = isLoading && hasDataForTicket;

  useEffect(() => {
    // Invalidate previous requests even when ticketTypeId becomes undefined.
    const requestId = ++latestRequestId.current;

    if (!ticketTypeId || !requestKey) {
      return;
    }

    getManagedTicketById(ticketTypeId)
      .then((ticketType) => {
        if (latestRequestId.current !== requestId) {
          return;
        }

        setState({
          ticketTypeId,
          key: requestKey,
          ticketType,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (latestRequestId.current !== requestId) {
          return;
        }

        setState((current) => ({
          ticketTypeId,
          key: requestKey,
          ticketType:
            current.ticketTypeId === ticketTypeId ? current.ticketType : null,
          error: extractErrorMessage(err, "Failed to load ticket type."),
        }));
      });
  }, [ticketTypeId, requestKey]);

  return {
    ticketType: hasDataForTicket ? state.ticketType : null,
    isLoading,
    isRefreshing,
    error: hasDataForTicket && state.key === requestKey ? state.error : null,
    refresh,
  };
}

/**
 * Shared scaffolding for imperative admin ticket mutations.
 *
 * Supports:
 * - Overlap-safe pending state.
 * - Error extraction and rethrowing.
 * - Stable execute() identity when action and options are stable.
 * - Optional in-flight deduplication.
 * - Resetting the displayed error when a form is reopened.
 *
 * Deduplication is intentionally opt-in. It should only be enabled
 * for operations where repeating the same in-flight request is safe.
 */
function useAdminTicketAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  fallbackMessage: string,
  options?: { dedupe?: boolean },
) {
  const dedupe = options?.dedupe ?? false;

  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const inFlight = useRef<Promise<TResult> | null>(null);

  const execute = useCallback(
    (...args: TArgs): Promise<TResult> => {
      if (dedupe && inFlight.current) {
        return inFlight.current;
      }

      setPending((count) => count + 1);
      setError(null);

      const promise = action(...args)
        .catch((err: unknown) => {
          setError(extractErrorMessage(err, fallbackMessage));
          throw err;
        })
        .finally(() => {
          if (inFlight.current === promise) {
            inFlight.current = null;
          }

          setPending((count) => Math.max(0, count - 1));
        });

      if (dedupe) {
        inFlight.current = promise;
      }

      return promise;
    },
    [action, dedupe, fallbackMessage],
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    execute,
    isLoading: pending > 0,
    error,
    reset,
  };
}

/**
 * Create a ticket type.
 *
 * Concurrent submissions share the same in-flight promise to prevent
 * duplicate ticket-type creation from repeated clicks.
 */
export function useCreateTicketType() {
  const { execute, isLoading, error, reset } = useAdminTicketAction(
    createTicketType,
    "Failed to create ticket type.",
    { dedupe: true },
  );

  return {
    create: execute,
    isLoading,
    error,
    reset,
  };
}

/**
 * Update an existing ticket type.
 *
 * The API function is passed directly so the execute callback remains
 * stable and does not change identity on every render.
 */
export function useUpdateTicketType() {
  const { execute, isLoading, error, reset } = useAdminTicketAction<
    [id: string, payload: UpdateTicketTypePayload],
    TicketType
  >(updateTicketType, "Failed to update ticket type.");

  return {
    update: execute,
    isLoading,
    error,
    reset,
  };
}

/**
 * Activate a ticket type.
 */
export function useActivateTicketType() {
  const { execute, isLoading, error, reset } = useAdminTicketAction(
    activateTicketType,
    "Failed to activate ticket type.",
  );

  return {
    activate: execute,
    isLoading,
    error,
    reset,
  };
}

/**
 * Deactivate a ticket type.
 */
export function useDeactivateTicketType() {
  const { execute, isLoading, error, reset } = useAdminTicketAction(
    deactivateTicketType,
    "Failed to deactivate ticket type.",
  );

  return {
    deactivate: execute,
    isLoading,
    error,
    reset,
  };
}

/**
 * Delete a ticket type.
 *
 * Deduplication is intentionally disabled because a single hook
 * instance may be shared by multiple table rows.
 */
export function useDeleteTicketType() {
  const { execute, isLoading, error, reset } = useAdminTicketAction(
    deleteTicketType,
    "Failed to delete ticket type.",
  );

  return {
    remove: execute,
    isLoading,
    error,
    reset,
  };
}
