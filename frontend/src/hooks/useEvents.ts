import { useCallback, useEffect, useState } from "react";

import { getEvents } from "../api/event.api";
import type { Event, EventListMeta, GetEventsParams } from "../types/event";

interface UseEventsResult {
  events: Event[];
  meta: EventListMeta;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEvents(params: GetEventsParams = {}): UseEventsResult {
  const [events, setEvents] = useState<Event[]>([]);

  const [meta, setMeta] = useState<EventListMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshToken, setRefreshToken] = useState(0);

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const city = params.city;

  const refetch = useCallback(() => {
    setRefreshToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);

        const result = await getEvents({
          page,
          limit,
          ...(city !== undefined ? { city } : {}),
        });

        if (cancelled) {
          return;
        }

        setEvents(result.events);
        setMeta(result.meta);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(err instanceof Error ? err.message : "Failed to load events.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchEvents();

    return () => {
      cancelled = true;
    };
  }, [page, limit, city, refreshToken]);

  return {
    events,
    meta,
    loading,
    error,
    refetch,
  };
}
