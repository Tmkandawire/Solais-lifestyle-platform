import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Camera,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  RefreshCw,
  ScanLine,
  ShieldAlert,
  Ticket,
  TriangleAlert,
  WifiOff,
  X,
  type LucideIcon,
} from "lucide-react";

import TicketQrScanner from "../../../components/admin/TicketQrScanner";
import { useAdminEvents } from "../../../hooks/useAdminEvent";
import { useCheckInIssuedTicket } from "../../../hooks/useIssuedTickets";
import type { AdminEvent, AdminEventListParams } from "../../../types/event";

/*
 * Published events only. The limit is deliberately high so the event being
 * worked today is not pushed onto a second page by older published events.
 * Lower it if the backend caps list requests below 100.
 */
const EVENT_LIST_PARAMS: AdminEventListParams = {
  page: 1,
  limit: 100,
  status: "PUBLISHED",
};

type CheckInSuccess = NonNullable<
  ReturnType<typeof useCheckInIssuedTicket>["result"]
>;

type CheckInFailureState = NonNullable<
  ReturnType<typeof useCheckInIssuedTicket>["failure"]
>;

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

function formatEventDate(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Date unavailable";
  }

  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (start.toDateString() === end.toDateString()) {
    return formatter.format(start);
  }

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Time unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function describeElapsed(fromIso: string, nowMs: number): string | null {
  const then = new Date(fromIso).getTime();

  if (Number.isNaN(then)) {
    return null;
  }

  const seconds = Math.max(0, Math.round((nowMs - then) / 1000));

  if (seconds <= 5) {
    return "just now";
  }

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  }

  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Camera errors                                                              */
/* -------------------------------------------------------------------------- */

interface Problem {
  title: string;
  message: string;
}

function readField(value: unknown, field: string): unknown {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  return (value as Record<string, unknown>)[field];
}

/**
 * Accepts either the scanner library's `kind` values or standard
 * DOMException names, so the message is right whichever the library reports.
 */
function describeCameraError(error: unknown): Problem {
  const kind = readField(error, "kind");
  const name = readField(error, "name");
  const token =
    typeof kind === "string" ? kind : typeof name === "string" ? name : "";

  switch (token) {
    case "permission-denied":
    case "NotAllowedError":
      return {
        title: "Camera permission denied",
        message:
          "Camera access is blocked for this site. Allow it in your browser settings, then try again.",
      };

    case "no-camera":
    case "NotFoundError":
      return {
        title: "No camera found",
        message:
          "This device has no usable camera. Use a phone or tablet to scan tickets.",
      };

    case "in-use":
    case "NotReadableError":
      return {
        title: "Camera is in use",
        message:
          "Another app or browser tab is using the camera. Close it, then try again.",
      };

    case "insecure-context":
      return {
        title: "Secure connection required",
        message:
          "Camera scanning only works over HTTPS. Open this page using a secure address.",
      };

    case "unsupported":
      return {
        title: "Camera scanning not supported",
        message:
          "This browser cannot access the camera. Try the latest Chrome, Safari or Edge.",
      };

    case "security":
    case "SecurityError":
      return {
        title: "Camera access blocked",
        message:
          "The browser blocked camera access for security reasons. Check the site permissions, then try again.",
      };

    default:
      return {
        title: "Camera could not start",
        message:
          "The camera did not start. Check the camera permission for this site, then try again.",
      };
  }
}

/* -------------------------------------------------------------------------- */
/* Failure presentation                                                       */
/* -------------------------------------------------------------------------- */

type Tone = "danger" | "warning" | "neutral";

interface FailurePresentation {
  title: string;
  message: string;
  icon: LucideIcon;
  tone: Tone;
  actionLabel: string;
}

/*
 * Red means "do not admit". Gold means "already used". Blue-grey means the
 * result is unknown, so a dropped connection never looks like a rejected
 * ticket.
 */
const TONES: Record<Tone, { panel: string; badge: string; eyebrow: string }> = {
  danger: {
    panel: "border-[#a84b45]/25 bg-[#a84b45]/8",
    badge: "bg-[#a84b45]/12 text-[#a84b45]",
    eyebrow: "text-[#a84b45]",
  },
  warning: {
    panel: "border-[#c99b55]/30 bg-[#c99b55]/10",
    badge: "bg-[#c99b55]/15 text-[#a87932]",
    eyebrow: "text-[#8d692f]",
  },
  neutral: {
    panel: "border-[#476b8a]/20 bg-[#476b8a]/8",
    badge: "bg-[#476b8a]/12 text-[#476b8a]",
    eyebrow: "text-[#476b8a]",
  },
};

const FALLBACK_FAILURE: FailurePresentation = {
  title: "Verification failed",
  message:
    "The ticket could not be verified. Scan it again. If this keeps happening, your session may have expired, so sign in again.",
  icon: TriangleAlert,
  tone: "neutral",
  actionLabel: "Scan again",
};

const FAILURES: Record<string, FailurePresentation | undefined> = {
  already_checked_in: {
    title: "Already checked in",
    message: "This ticket has already been used for entry.",
    icon: Clock3,
    tone: "warning",
    actionLabel: "Scan next ticket",
  },
  wrong_event: {
    title: "Wrong event",
    message:
      "This ticket belongs to a different event. Check that the correct event is selected above.",
    icon: TriangleAlert,
    tone: "danger",
    actionLabel: "Scan next ticket",
  },
  cancelled: {
    title: "Ticket cancelled",
    message: "This ticket was cancelled and cannot be used for entry.",
    icon: X,
    tone: "danger",
    actionLabel: "Scan next ticket",
  },
  invalid: {
    title: "Invalid ticket",
    message: "This QR code is not a valid SOLAÍS ticket.",
    icon: X,
    tone: "danger",
    actionLabel: "Scan next ticket",
  },
  forbidden: {
    title: "Access denied",
    message:
      "This account cannot check tickets in. Sign in with a staff account.",
    icon: ShieldAlert,
    tone: "danger",
    actionLabel: "Scan again",
  },
  network: {
    title: "Connection problem",
    message:
      "The server could not be reached, so the result is unknown. Scan the ticket again. If it now shows as checked in moments ago, the first scan went through.",
    icon: WifiOff,
    tone: "neutral",
    actionLabel: "Scan again",
  },
  timeout: {
    title: "No response from server",
    message:
      "The server took too long to respond, so the result is unknown. Scan the ticket again. If it now shows as checked in moments ago, the first scan went through.",
    icon: Clock3,
    tone: "neutral",
    actionLabel: "Scan again",
  },
  unknown: FALLBACK_FAILURE,
};

/* -------------------------------------------------------------------------- */
/* Presentational components                                                  */
/* -------------------------------------------------------------------------- */

function EventOption({ event }: { event: AdminEvent }) {
  return (
    <option value={event.id}>
      {event.title} · {event.city} ·{" "}
      {formatEventDate(event.startDate, event.endDate)}
    </option>
  );
}

function EventPicker({
  upcoming,
  past,
  selectedEvent,
  selectedEventId,
  loading,
  disabled,
  error,
  notice,
  onChange,
  onRetry,
}: {
  upcoming: AdminEvent[];
  past: AdminEvent[];
  selectedEvent: AdminEvent | undefined;
  selectedEventId: string;
  loading: boolean;
  disabled: boolean;
  error: string | null;
  notice: string | null;
  onChange: (eventId: string) => void;
  onRetry: () => void;
}) {
  const compact = selectedEvent !== undefined;
  const hasEvents = upcoming.length + past.length > 0;

  return (
    <section className="rounded-2xl border border-[#122425]/8 bg-white p-4 shadow-[0_12px_40px_rgba(18,36,37,0.04)] sm:p-5">
      {!compact && (
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
            Check-in event
          </p>

          <p className="mt-1 text-sm leading-6 text-[#122425]/55">
            Choose the event you are working at. Tickets are only accepted for
            the selected event.
          </p>
        </div>
      )}

      <label
        htmlFor="check-in-event"
        className={
          compact
            ? "mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40"
            : "sr-only"
        }
      >
        Check-in event
      </label>

      <div className="relative">
        <select
          id="check-in-event"
          value={selectedEventId}
          onChange={(event) => onChange(event.target.value)}
          disabled={loading || disabled || !hasEvents}
          className="h-11 w-full appearance-none rounded-xl border border-[#122425]/8 bg-[#f5f1e9]/55 pl-4 pr-11 text-sm text-[#122425] outline-none transition focus:border-[#c99b55]/50 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            {loading ? "Loading events…" : "Select an event"}
          </option>

          {upcoming.length > 0 && (
            <optgroup label="Upcoming and in progress">
              {upcoming.map((event) => (
                <EventOption key={event.id} event={event} />
              ))}
            </optgroup>
          )}

          {past.length > 0 && (
            <optgroup label="Past events">
              {past.map((event) => (
                <EventOption key={event.id} event={event} />
              ))}
            </optgroup>
          )}
        </select>

        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#122425]/35"
          strokeWidth={1.7}
        />
      </div>

      {selectedEvent && (
        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#122425]/50">
          <MapPin
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c99b55]"
            strokeWidth={1.6}
          />
          <span>
            {selectedEvent.venue}, {selectedEvent.city} ·{" "}
            {formatEventDate(selectedEvent.startDate, selectedEvent.endDate)}
          </span>
        </p>
      )}

      {notice && !error && (
        <p className="mt-3 text-xs leading-5 text-[#8d692f]">{notice}</p>
      )}

      {!loading && !error && !hasEvents && (
        <p className="mt-3 text-xs leading-5 text-[#122425]/50">
          There are no published events to check tickets in for.
        </p>
      )}

      {error && (
        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-[#a84b45]/20 bg-[#a84b45]/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#8f3f39]">
              Unable to load events
            </p>
            <p className="mt-1 text-xs leading-5 text-[#8f3f39]/70">{error}</p>
          </div>

          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[#a84b45]/20 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f3f39] transition hover:bg-[#a84b45]/8"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.7} />
            Try again
          </button>
        </div>
      )}
    </section>
  );
}

function ScanStatus({ verifying }: { verifying: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-2xl border border-[#122425]/8 bg-white px-4 py-3.5 shadow-[0_12px_40px_rgba(18,36,37,0.04)]"
    >
      {verifying ? (
        <RefreshCw
          className="h-4 w-4 shrink-0 animate-spin text-[#c99b55]"
          strokeWidth={1.7}
        />
      ) : (
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#2f6b4f]" />
      )}

      <p className="text-xs text-[#122425]/60">
        {verifying
          ? "Verifying ticket…"
          : "Scanner ready. Hold the QR code inside the frame."}
      </p>
    </div>
  );
}

function SuccessPanel({
  result,
  onNext,
}: {
  result: CheckInSuccess;
  onNext: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="assertive"
      className="rounded-2xl border border-[#2f6b4f]/25 bg-[#2f6b4f]/8 p-5 sm:p-6"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2f6b4f]/12 text-[#2f6b4f]">
          <Check className="h-7 w-7" strokeWidth={1.8} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#2f6b4f]">
            Entry approved
          </p>

          <h2 className="mt-1 font-serif text-3xl italic text-[#122425]">
            Ticket verified
          </h2>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-white/75 p-4">
        <div>
          <dt className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
            Ticket
          </dt>
          <dd className="mt-1 break-all font-mono text-sm font-semibold text-[#122425]">
            {result.ticketNumber}
          </dd>
        </div>

        <div>
          <dt className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
            Ticket type
          </dt>
          <dd className="mt-1 text-sm font-medium text-[#122425]">
            {result.ticketType.name}
          </dd>
        </div>

        <div className="col-span-2">
          <dt className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
            Event
          </dt>
          <dd className="mt-1 text-sm font-medium text-[#122425]">
            {result.event.title}
          </dd>
        </div>

        <div className="col-span-2">
          <dt className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
            Checked in
          </dt>
          <dd className="mt-1 text-sm font-medium text-[#122425]">
            {formatDateTime(result.checkedInAt)}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onNext}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#122425] px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#eee8dd] transition hover:bg-[#1b3435]"
      >
        <ScanLine className="h-4 w-4" strokeWidth={1.7} />
        Scan next ticket
      </button>
    </div>
  );
}

function FailurePanel({
  failure,
  onNext,
}: {
  failure: CheckInFailureState;
  onNext: () => void;
}) {
  const presentation = FAILURES[failure.reason] ?? FALLBACK_FAILURE;
  const tone = TONES[presentation.tone];
  const Icon = presentation.icon;

  // Captured once when the panel appears so "x seconds ago" stays stable.
  const [shownAt] = useState(() => new Date().getTime());

  const elapsed =
    failure.reason === "already_checked_in" && failure.checkedInAt
      ? describeElapsed(failure.checkedInAt, shownAt)
      : null;

  return (
    <div role="alert" className={`rounded-2xl border p-5 sm:p-6 ${tone.panel}`}>
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${tone.badge}`}
        >
          <Icon className="h-7 w-7" strokeWidth={1.7} />
        </div>

        <div className="min-w-0">
          <p
            className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${tone.eyebrow}`}
          >
            {presentation.tone === "neutral"
              ? "Result unknown"
              : "Do not admit"}
          </p>

          <h2 className="mt-1 font-serif text-3xl italic text-[#122425]">
            {presentation.title}
          </h2>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#122425]/70">
        {failure.reason === "already_checked_in" && failure.checkedInAt ? (
          <>
            This ticket was checked in at{" "}
            <strong className="font-semibold text-[#122425]">
              {formatDateTime(failure.checkedInAt)}
            </strong>
            {elapsed ? ` (${elapsed})` : ""}.
          </>
        ) : (
          presentation.message
        )}
      </p>

      {failure.ticketNumber && (
        <div className="mt-4 rounded-xl bg-white/75 p-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
            Ticket
          </p>
          <p className="mt-1 break-all font-mono text-sm font-semibold text-[#122425]">
            {failure.ticketNumber}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#122425] px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#eee8dd] transition hover:bg-[#1b3435]"
      >
        <RefreshCw className="h-4 w-4" strokeWidth={1.7} />
        {presentation.actionLabel}
      </button>
    </div>
  );
}

function CameraProblemCard({
  problem,
  onRetry,
}: {
  problem: Problem;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#a84b45]/20 bg-[#a84b45]/5 p-6 text-center"
    >
      <div className="max-w-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#a84b45]/10 text-[#a84b45]">
          <Camera className="h-6 w-6" strokeWidth={1.5} />
        </div>

        <h2 className="mt-5 font-serif text-2xl italic text-[#122425]">
          {problem.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#122425]/60">
          {problem.message}
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#122425] px-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#eee8dd] transition hover:bg-[#1b3435]"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.7} />
            Try camera again
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AdminIssuedTicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // The event the most recent scan was submitted for. Results are only shown
  // while that event is still selected, so a slow response can never appear
  // under a different event.
  const [scanEventId, setScanEventId] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<{ detail: unknown } | null>(
    null,
  );
  const [cameraAttempt, setCameraAttempt] = useState(0);
  const [now] = useState(() => new Date().getTime());

  const scanLockRef = useRef(false);

  const secureContext = typeof window === "undefined" || window.isSecureContext;

  const selectedEventId = searchParams.get("eventId") ?? "";

  const {
    events,
    meta,
    isLoading: eventsLoading,
    error: eventsError,
    refresh: refreshEvents,
  } = useAdminEvents(EVENT_LIST_PARAMS);

  const {
    checkIn,
    result,
    failure,
    loading: checkInLoading,
    reset: resetCheckIn,
  } = useCheckInIssuedTicket();

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId),
    [events, selectedEventId],
  );

  const { upcoming, past } = useMemo(() => {
    const upcomingEvents: AdminEvent[] = [];
    const pastEvents: AdminEvent[] = [];

    for (const event of events) {
      if (new Date(event.endDate).getTime() >= now) {
        upcomingEvents.push(event);
      } else {
        pastEvents.push(event);
      }
    }

    upcomingEvents.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

    pastEvents.sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );

    return { upcoming: upcomingEvents, past: pastEvents };
  }, [events, now]);

  const truncationNotice =
    meta.total > events.length
      ? `Showing ${events.length} of ${meta.total} published events.`
      : null;

  const scanIsCurrent =
    selectedEvent !== undefined && scanEventId === selectedEventId;
  const visibleResult = scanIsCurrent ? result : null;
  const visibleFailure = scanIsCurrent ? failure : null;
  const hasOutcome = visibleResult !== null || visibleFailure !== null;
  const verifying = checkInLoading;

  const cameraBlocked = !secureContext || cameraError !== null;
  const scannerPaused = verifying || hasOutcome;

  const selectionMissing =
    selectedEventId !== "" &&
    !eventsLoading &&
    !eventsError &&
    selectedEvent === undefined;

  const outcomeKind = visibleResult
    ? "success"
    : visibleFailure
      ? "failure"
      : null;

  // Haptic feedback where supported, because the scanner beep is disabled.
  useEffect(() => {
    if (outcomeKind === null || !("vibrate" in navigator)) {
      return;
    }

    navigator.vibrate(outcomeKind === "success" ? 80 : [140, 70, 140]);
  }, [outcomeKind]);

  const handleEventChange = useCallback(
    (eventId: string) => {
      resetCheckIn();
      setScanEventId(null);
      setCameraError(null);
      setSearchParams(eventId ? { eventId } : {}, { replace: true });
    },
    [resetCheckIn, setSearchParams],
  );

  const handleScan = useCallback(
    (qrPayload: string) => {
      if (
        !selectedEvent ||
        checkInLoading ||
        hasOutcome ||
        scanLockRef.current
      ) {
        return;
      }

      scanLockRef.current = true;
      setScanEventId(selectedEvent.id);

      void checkIn(qrPayload, selectedEvent.id).finally(() => {
        scanLockRef.current = false;
      });
    },
    [selectedEvent, checkInLoading, hasOutcome, checkIn],
  );

  const handleScanNext = useCallback(() => {
    resetCheckIn();
    setScanEventId(null);
  }, [resetCheckIn]);

  const handleCameraError = useCallback((error: unknown) => {
    setCameraError({ detail: error });
  }, []);

  const handleCameraRetry = useCallback(() => {
    setCameraError(null);
    setCameraAttempt((current) => current + 1);
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]">
          Entrance management
        </p>

        <h1 className="mt-2 font-serif text-4xl italic tracking-tight text-[#122425] sm:text-5xl">
          Ticket check-in
        </h1>

        <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-[#122425]/55 sm:block">
          Scan attendee QR tickets to verify admission for the selected SOLAÍS
          event.
        </p>
      </header>

      <EventPicker
        upcoming={upcoming}
        past={past}
        selectedEvent={selectedEvent}
        selectedEventId={selectedEventId}
        loading={eventsLoading}
        disabled={checkInLoading}
        error={eventsError}
        notice={truncationNotice}
        onChange={handleEventChange}
        onRetry={() => void refreshEvents()}
      />

      {selectionMissing && (
        <div
          role="alert"
          className="rounded-2xl border border-[#c99b55]/30 bg-[#c99b55]/10 p-4 text-sm leading-6 text-[#8d692f]"
        >
          The event in this link is not available for check-in. It may be
          unpublished or no longer in the list. Choose an event above.
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,720px)_minmax(280px,1fr)]">
        <div className="space-y-4">
          {selectedEvent ? (
            <>
              {visibleResult ? (
                <SuccessPanel result={visibleResult} onNext={handleScanNext} />
              ) : visibleFailure ? (
                <FailurePanel
                  failure={visibleFailure}
                  onNext={handleScanNext}
                />
              ) : (
                !cameraBlocked && <ScanStatus verifying={verifying} />
              )}

              {!secureContext ? (
                <CameraProblemCard
                  problem={{
                    title: "Secure connection required",
                    message:
                      "Camera scanning only works over HTTPS. Open this page using a secure address.",
                  }}
                />
              ) : cameraError ? (
                <CameraProblemCard
                  problem={describeCameraError(cameraError.detail)}
                  onRetry={handleCameraRetry}
                />
              ) : (
                <TicketQrScanner
                  paused={scannerPaused}
                  attempt={cameraAttempt}
                  onScan={handleScan}
                  onCameraError={handleCameraError}
                />
              )}
            </>
          ) : (
            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-[#122425]/8 bg-white p-6 text-center shadow-[0_12px_40px_rgba(18,36,37,0.04)]">
              <div className="max-w-xs">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#122425]/8 bg-[#f5f1e9]">
                  <Ticket
                    className="h-6 w-6 text-[#122425]/25"
                    strokeWidth={1.4}
                  />
                </div>

                <h2 className="mt-5 font-serif text-2xl italic text-[#122425]">
                  Select an event first
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#122425]/45">
                  The camera starts once you choose the event you are checking
                  guests into.
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#122425]/8 bg-white p-5 shadow-[0_12px_40px_rgba(18,36,37,0.04)] sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
              At the gate
            </p>

            <ol className="mt-4 space-y-3 text-sm leading-6 text-[#122425]/60">
              <li>Select the event you are working at.</li>
              <li>Ask the attendee to show their ticket QR code.</li>
              <li>Hold the code inside the frame and wait for the result.</li>
              <li>
                Admit only on a green result. The server checks every ticket
                against the selected event.
              </li>
            </ol>
          </div>

          <Link
            to="/admin/tickets"
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#122425]/10 bg-white px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#122425]/65 transition hover:bg-[#f5f1e9] hover:text-[#122425]"
          >
            <Ticket className="h-4 w-4" strokeWidth={1.6} />
            Manage ticket types
          </Link>
        </aside>
      </div>
    </div>
  );
}
