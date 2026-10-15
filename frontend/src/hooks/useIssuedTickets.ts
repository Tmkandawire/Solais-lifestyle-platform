import { useCallback, useEffect, useRef, useState } from "react";

import {
  checkInIssuedTicket,
  getIssuedTicketQrCredential,
  getMyIssuedTickets,
} from "../api/issuedTicket.api";

import { parseApiError, type ParsedApiError } from "../api/errors";

import type {
  AttendeeIssuedTicket,
  AttendeeTicketListParams,
  PaginatedAttendeeTickets,
  StaffCheckInResult,
} from "../types/issued-ticket";

interface UseMyIssuedTicketsResult {
  tickets: AttendeeIssuedTicket[];
  meta: PaginatedAttendeeTickets["meta"];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMyIssuedTickets(
  params: AttendeeTicketListParams = {},
): UseMyIssuedTicketsResult {
  const [tickets, setTickets] = useState<AttendeeIssuedTicket[]>([]);

  const [meta, setMeta] = useState<PaginatedAttendeeTickets["meta"]>({
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

  const refetch = useCallback(() => {
    setRefreshToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function fetchTickets() {
      try {
        setLoading(true);
        setError(null);

        const result = await getMyIssuedTickets(
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

        setTickets(result.tickets);
        setMeta(result.meta);
      } catch (err) {
        if (cancelled || controller.signal.aborted) {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Failed to load your tickets.",
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
  }, [page, limit, status, refreshToken]);

  return {
    tickets,
    meta,
    loading,
    error,
    refetch,
  };
}

interface UseIssuedTicketQrCredentialResult {
  qrCredential: string | null;
  loading: boolean;
  error: string | null;
  fetchQrCredential: () => Promise<void>;
  clearQrCredential: () => void;
}

export function useIssuedTicketQrCredential(
  ticketId: string,
): UseIssuedTicketQrCredentialResult {
  const [qrCredential, setQrCredential] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearQrCredential = useCallback(() => {
    setQrCredential(null);
    setError(null);
  }, []);

  const inFlight = useRef(false);

  const fetchQrCredential = useCallback(async () => {
    if (!ticketId || inFlight.current) {
      return;
    }

    inFlight.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await getIssuedTicketQrCredential(ticketId);
      setQrCredential(result.qrCredential);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to retrieve your ticket QR code.",
      );
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [ticketId]);

  return {
    qrCredential,
    loading,
    error,
    fetchQrCredential,
    clearQrCredential,
  };
}

export type CheckInFailureReason =
  | "invalid"
  | "already_checked_in"
  | "cancelled"
  | "wrong_event"
  | "forbidden"
  | "network"
  | "timeout"
  | "unknown";

export interface CheckInFailure {
  reason: CheckInFailureReason;
  message: string;
  ticketNumber: string | null;
  checkedInAt: string | null;
}

function readString(data: ParsedApiError["data"], key: string): string | null {
  const value = data?.[key];

  return typeof value === "string" ? value : null;
}

function toCheckInFailure(error: ParsedApiError): CheckInFailure {
  let reason: CheckInFailureReason = "unknown";

  if (error.status === null) {
    reason = "network";
  } else if (error.code === "TICKET_ALREADY_CHECKED_IN") {
    reason = "already_checked_in";
  } else if (error.code === "TICKET_CANCELLED") {
    reason = "cancelled";
  } else if (
    error.code === "TICKET_CREDENTIAL_NOT_FOUND" ||
    error.code === "INVALID_QR_PAYLOAD"
  ) {
    reason = "invalid";
  } else if (error.code === "TICKET_EVENT_MISMATCH") {
    reason = "wrong_event";
  } else if (error.status === 401 || error.status === 403) {
    reason = "forbidden";
  } else if (error.code === "TICKET_CHECK_IN_TIMEOUT") {
    reason = "timeout";
  }

  return {
    reason,
    message: error.message,
    ticketNumber: readString(error.data, "ticketNumber"),
    checkedInAt: readString(error.data, "checkedInAt"),
  };
}

interface UseCheckInIssuedTicketResult {
  checkIn: (qrPayload: string, eventId: string) => Promise<void>;
  result: StaffCheckInResult | null;
  failure: CheckInFailure | null;
  loading: boolean;
  reset: () => void;
}

export function useCheckInIssuedTicket(): UseCheckInIssuedTicketResult {
  const [result, setResult] = useState<StaffCheckInResult | null>(null);

  const [failure, setFailure] = useState<CheckInFailure | null>(null);

  const [loading, setLoading] = useState(false);

  const inFlight = useRef(false);
  const requestController = useRef<AbortController | null>(null);
  const requestGeneration = useRef(0);

  const checkIn = useCallback(async (qrPayload: string, eventId: string) => {
    if (inFlight.current) {
      return;
    }

    const controller = new AbortController();
    const generation = requestGeneration.current + 1;

    requestGeneration.current = generation;
    requestController.current = controller;
    inFlight.current = true;

    setLoading(true);
    setResult(null);
    setFailure(null);

    let timedOut = false;

    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 10_000);

    try {
      const checkInResult = await checkInIssuedTicket(qrPayload, eventId, {
        signal: controller.signal,
      });

      if (
        requestGeneration.current === generation &&
        !controller.signal.aborted
      ) {
        setResult(checkInResult);
      }
    } catch (err) {
      if (requestGeneration.current !== generation) {
        return;
      }

      if (timedOut) {
        setFailure({
          reason: "timeout",
          message:
            "No response from the server. Scan again to confirm this ticket's status.",
          ticketNumber: null,
          checkedInAt: null,
        });
        return;
      }

      if (controller.signal.aborted) {
        return;
      }

      setFailure(
        toCheckInFailure(parseApiError(err, "Unable to verify this ticket.")),
      );
    } finally {
      window.clearTimeout(timeoutId);

      if (requestGeneration.current === generation) {
        if (requestController.current === controller) {
          requestController.current = null;
        }

        inFlight.current = false;
        setLoading(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    requestGeneration.current += 1;

    requestController.current?.abort();
    requestController.current = null;

    inFlight.current = false;

    setResult(null);
    setFailure(null);
    setLoading(false);
  }, []);

  return {
    checkIn,
    result,
    failure,
    loading,
    reset,
  };
}
