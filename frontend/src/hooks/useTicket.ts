import { useCallback, useEffect, useState } from "react";

import { getTicketById, getTicketsByEvent } from "../api/ticket.api";

import type {
  PaginatedPublicTicketTypes,
  PublicTicketType,
  TicketTypeListParams,
} from "../types/ticket";

interface UseEventTicketsResult {
  tickets: PublicTicketType[];
  meta: PaginatedPublicTicketTypes["meta"];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEventTickets(
  eventId: string,
  params: TicketTypeListParams = {},
): UseEventTicketsResult {
  const [tickets, setTickets] = useState<PublicTicketType[]>([]);

  const [meta, setMeta] = useState<PaginatedPublicTicketTypes["meta"]>({
    total: 0,
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshToken, setRefreshToken] = useState(0);

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const status = params.status;

  const hasEventId = Boolean(eventId);

  const refetch = useCallback(() => {
    setRefreshToken((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!hasEventId) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchTickets() {
      try {
        setLoading(true);
        setError(null);

        const result = await getTicketsByEvent(
          eventId,
          {
            page,
            limit,
            ...(status !== undefined ? { status } : {}),
          },
          {
            signal: controller.signal,
          },
        );

        if (cancelled || controller.signal.aborted) {
          return;
        }

        setTickets(result.ticketTypes);
        setMeta(result.meta);
      } catch (err) {
        if (cancelled || controller.signal.aborted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load available tickets.",
        );
      } finally {
        if (!cancelled && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchTickets();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [eventId, hasEventId, page, limit, status, refreshToken]);

  return {
    tickets: hasEventId ? tickets : [],
    meta: hasEventId
      ? meta
      : {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
    loading: hasEventId ? loading : false,
    error: hasEventId ? error : "Event ID is required.",
    refetch,
  };
}

interface UseTicketResult {
  ticket: PublicTicketType | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTicket(id: string): UseTicketResult {
  const [ticket, setTicket] = useState<PublicTicketType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshToken, setRefreshToken] = useState(0);

  const hasId = Boolean(id);

  const refetch = useCallback(() => {
    setRefreshToken((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!hasId) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchTicket() {
      try {
        setLoading(true);
        setError(null);

        const result = await getTicketById(id, {
          signal: controller.signal,
        });

        if (cancelled || controller.signal.aborted) {
          return;
        }

        setTicket(result);
      } catch (err) {
        if (cancelled || controller.signal.aborted) {
          return;
        }

        setTicket(null);
        setError(
          err instanceof Error ? err.message : "Failed to load ticket type.",
        );
      } finally {
        if (!cancelled && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchTicket();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id, hasId, refreshToken]);

  return {
    ticket: hasId ? ticket : null,
    loading: hasId ? loading : false,
    error: hasId ? error : "Ticket ID is required.",
    refetch,
  };
}
