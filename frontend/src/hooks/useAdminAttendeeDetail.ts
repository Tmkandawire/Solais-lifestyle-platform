import { useCallback, useEffect, useRef, useState } from "react";

import { getAdminAttendeeById } from "../api/admin-attendee.api";
import { extractErrorMessage } from "./shared/extractErrorMessage";

import type { AdminAttendeeDetail } from "../types/admin-attendee";

interface DetailState {
  isOpen: boolean;
  attendee: AdminAttendeeDetail | null;
  loading: boolean;
  error: string | null;
}

const CLOSED: DetailState = {
  isOpen: false,
  attendee: null,
  loading: false,
  error: null,
};

export function useAdminAttendeeDetail() {
  const [state, setState] = useState<DetailState>(CLOSED);
  const controllerRef = useRef<AbortController | null>(null);
  const lastIdRef = useRef<string | null>(null);

  const openAttendee = useCallback(async (id: string) => {
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;
    lastIdRef.current = id;

    setState({
      isOpen: true,
      attendee: null,
      loading: true,
      error: null,
    });

    try {
      const attendee = await getAdminAttendeeById(id, controller.signal);

      if (controller.signal.aborted) return;

      setState({
        isOpen: true,
        attendee,
        loading: false,
        error: null,
      });
    } catch (error: unknown) {
      if (controller.signal.aborted) return;

      setState({
        isOpen: true,
        attendee: null,
        loading: false,
        error: extractErrorMessage(error, "Unable to load this attendee."),
      });
    }
  }, []);

  const closeAttendee = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    lastIdRef.current = null;
    setState(CLOSED);
  }, []);

  const retry = useCallback(() => {
    if (lastIdRef.current) {
      void openAttendee(lastIdRef.current);
    }
  }, [openAttendee]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  return {
    ...state,
    openAttendee,
    closeAttendee,
    retry,
  };
}
