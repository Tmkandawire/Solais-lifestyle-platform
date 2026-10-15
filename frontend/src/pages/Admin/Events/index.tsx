import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Ticket,
} from "lucide-react";

import EventActionsMenu from "./EventActionsMenu";

import {
  useAdminEvents,
  useCancelEvent,
  useCompleteEvent,
  useDeleteEvent,
  usePublishEvent,
} from "../../../hooks/useAdminEvent";
import { useToast } from "../../../hooks/useToast";

import type { AdminEvent, AdminEventListParams } from "../../../types/event";
import type { EventStatus } from "../../../types/event-status";
import EventConfirmationModal from "../../../components/admin/EventConfirmationModal";

const EVENT_STATUSES: Array<{
  value: EventStatus | "";
  label: string;
}> = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "COMPLETED", label: "Completed" },
];

function formatEventDate(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const startDateLabel = dateFormatter.format(start);
  const endDateLabel = dateFormatter.format(end);

  if (startDateLabel === endDateLabel) {
    return {
      date: startDateLabel,
      time: `${timeFormatter.format(start)} – ${timeFormatter.format(end)}`,
    };
  }

  return {
    date: `${startDateLabel} – ${endDateLabel}`,
    time: `${timeFormatter.format(start)} – ${timeFormatter.format(end)}`,
  };
}

function getStatusClasses(status: EventStatus) {
  switch (status) {
    case "PUBLISHED":
      return "border-[#2f6b4f]/20 bg-[#2f6b4f]/8 text-[#2f6b4f]";

    case "CANCELLED":
      return "border-[#a84b45]/20 bg-[#a84b45]/8 text-[#a84b45]";

    case "COMPLETED":
      return "border-[#476b8a]/20 bg-[#476b8a]/8 text-[#476b8a]";

    case "DRAFT":
    default:
      return "border-[#c99b55]/25 bg-[#c99b55]/10 text-[#8d692f]";
  }
}

function getStatusLabel(status: EventStatus) {
  switch (status) {
    case "PUBLISHED":
      return "Published";
    case "CANCELLED":
      return "Cancelled";
    case "COMPLETED":
      return "Completed";
    case "DRAFT":
    default:
      return "Draft";
  }
}

function getCapacityLabel(capacity: number | null) {
  if (capacity === null) {
    return "Unlimited";
  }

  return capacity.toLocaleString("en-US");
}

export default function AdminEventsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<EventStatus | "">("");
  const [city, setCity] = useState("");
  const [confirmation, setConfirmation] = useState<{
    event: AdminEvent;
    action: "cancel" | "complete" | "delete";
  } | null>(null);

  const params = useMemo<AdminEventListParams>(
    () => ({
      page,
      limit: 20,
      ...(status ? { status } : {}),
      ...(city.trim() ? { city: city.trim() } : {}),
    }),
    [page, status, city],
  );

  const { events, meta, isLoading, error, refresh } = useAdminEvents(params);

  const { publish } = usePublishEvent();
  const { cancel, isLoading: isCancelling } = useCancelEvent();
  const { complete } = useCompleteEvent();
  const { remove, isLoading: isDeleting } = useDeleteEvent();

  const hasEvents = events.length > 0;
  const hasPagination = meta.totalPages > 1;

  function handleStatusChange(value: EventStatus | "") {
    setStatus(value);
    setPage(1);
  }

  function handleCityChange(value: string) {
    setCity(value);
    setPage(1);
  }

  function handlePreviousPage() {
    setPage((current) => Math.max(1, current - 1));
  }

  function handleNextPage() {
    setPage((current) => Math.min(meta.totalPages, current + 1));
  }

  function handleView(event: { id: string }) {
    navigate(`/admin/events/${event.id}`);
  }

  function handleEdit(event: { id: string }) {
    navigate(`/admin/events/${event.id}/edit`);
  }

  async function handlePublish(event: { id: string }) {
    try {
      await publish(event.id);

      toast.success("Event published successfully.", {
        description: "The event is now available to attendees.",
      });

      refresh();
    } catch {
      // Mutation hook exposes the error state.
    }
  }

  function handleCancel(event: AdminEvent) {
    setConfirmation({
      event,
      action: "cancel",
    });
  }

  function handleComplete(event: AdminEvent) {
    setConfirmation({
      event,
      action: "complete",
    });
  }

  function handleDelete(event: AdminEvent) {
    setConfirmation({
      event,
      action: "delete",
    });
  }

  async function handleConfirmation() {
    if (!confirmation) {
      return;
    }

    try {
      if (confirmation.action === "cancel") {
        await cancel(confirmation.event.id);

        toast.success("Event cancelled successfully.", {
          description:
            "The event is no longer publicly available to attendees.",
        });
      } else if (confirmation.action === "complete") {
        await complete(confirmation.event.id);

        toast.success("Event marked as completed.", {
          description: "The event is now recorded as completed.",
        });
      } else {
        await remove(confirmation.event.id);

        toast.success("Event deleted successfully.", {
          description: "The event has been removed from the active catalogue.",
        });
      }

      setConfirmation(null);
      await refresh();
    } catch {
      // Mutation hook exposes the error state.
    }
  }

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]">
              Management
            </p>

            {!isLoading && (
              <span className="rounded-full border border-[#122425]/10 bg-white px-2.5 py-1 text-[10px] font-semibold text-[#122425]/50">
                {meta.total.toLocaleString("en-US")}{" "}
                {meta.total === 1 ? "event" : "events"}
              </span>
            )}
          </div>

          <h1 className="mt-2 font-serif text-4xl italic tracking-tight text-[#122425] sm:text-5xl">
            Events
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#122425]/55">
            Create, manage and monitor your SOLAÍS experiences from one place.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#122425] px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#eee8dd] transition hover:bg-[#1b3435]"
          onClick={() => navigate("/admin/events/new")}
        >
          <Plus className="h-4 w-4" strokeWidth={1.8} />
          Create event
        </button>
      </div>

      {/* FILTER BAR */}
      <section className="rounded-2xl border border-[#122425]/8 bg-white p-4 shadow-[0_12px_40px_rgba(18,36,37,0.04)]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_200px_134px] md:items-center">
          <div className="relative min-w-0">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#122425]/30"
              strokeWidth={1.7}
            />

            <input
              type="text"
              value={city}
              onChange={(event) => handleCityChange(event.target.value)}
              placeholder="Filter by city..."
              className="h-11 w-full rounded-xl border border-[#122425]/8 bg-[#f5f1e9]/55 pl-12 pr-4 text-sm text-[#122425] outline-none transition placeholder:text-[#122425]/30 focus:border-[#c99b55]/50 focus:bg-white"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              handleStatusChange(event.target.value as EventStatus | "")
            }
            className="h-11 w-full rounded-xl border border-[#122425]/8 bg-[#f5f1e9]/55 px-4 text-sm text-[#122425] outline-none transition focus:border-[#c99b55]/50 focus:bg-white"
          >
            {EVENT_STATUSES.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#122425]/8 bg-[#f5f1e9]/55 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#122425]/55 transition hover:bg-[#f5f1e9] hover:text-[#122425] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              strokeWidth={1.7}
            />
            Refresh
          </button>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <section className="rounded-2xl border border-[#a84b45]/20 bg-[#a84b45]/5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#8f3f39]">
                Unable to load events
              </p>

              <p className="mt-1 text-sm text-[#8f3f39]/65">{error}</p>
            </div>

            <button
              type="button"
              onClick={refresh}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[#a84b45]/20 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f3f39] transition hover:bg-[#a84b45]/8"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={1.7} />
              Try again
            </button>
          </div>
        </section>
      )}

      {/* EVENTS TABLE */}
      <section className="overflow-hidden rounded-2xl border border-[#122425]/8 bg-white shadow-[0_12px_40px_rgba(18,36,37,0.04)]">
        <div className="flex items-center justify-between border-b border-[#122425]/8 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
              Event catalogue
            </p>

            <p className="mt-1 text-sm text-[#122425]/55">
              {meta.total > 0
                ? `${meta.total.toLocaleString("en-US")} events`
                : "No events available"}
            </p>
          </div>

          {isLoading && hasEvents && (
            <div className="flex items-center gap-2 text-xs text-[#122425]/40">
              <RefreshCw
                className="h-3.5 w-3.5 animate-spin"
                strokeWidth={1.7}
              />
              Updating
            </div>
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr className="border-b border-[#122425]/8 bg-[#f5f1e9]/45">
                <th className="px-6 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
                  Event
                </th>

                <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
                  Date
                </th>

                <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
                  Location
                </th>

                <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
                  Capacity
                </th>

                <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
                  Status
                </th>

                <th className="w-16 px-5 py-4" />
              </tr>
            </thead>

            <tbody className="divide-y divide-[#122425]/6">
              {isLoading && !hasEvents ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`event-skeleton-${index}`}>
                    <td className="px-6 py-5" colSpan={6}>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-[#f5f1e9]" />

                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 w-1/3 animate-pulse rounded bg-[#f5f1e9]" />
                          <div className="h-3 w-1/5 animate-pulse rounded bg-[#f5f1e9]" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : hasEvents ? (
                events.map((event) => {
                  const eventDate = formatEventDate(
                    event.startDate,
                    event.endDate,
                  );

                  return (
                    <tr
                      key={event.id}
                      className="group transition-colors hover:bg-[#f5f1e9]/45"
                    >
                      <td className="px-6 py-5">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#122425]/8 bg-[#f5f1e9]">
                            {event.bannerImageUrl ? (
                              <img
                                src={event.bannerImageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <CalendarDays
                                className="h-5 w-5 text-[#122425]/25"
                                strokeWidth={1.5}
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#122425]">
                              {event.title}
                            </p>

                            <p className="mt-1 truncate font-mono text-[10px] text-[#122425]/30">
                              {event.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-start gap-3">
                          <CalendarDays
                            className="mt-0.5 h-4 w-4 shrink-0 text-[#c99b55]"
                            strokeWidth={1.5}
                          />

                          <div>
                            <p className="text-sm font-medium text-[#122425]/80">
                              {eventDate.date}
                            </p>

                            <p className="mt-1 text-xs text-[#122425]/40">
                              {eventDate.time}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-start gap-3">
                          <MapPin
                            className="mt-0.5 h-4 w-4 shrink-0 text-[#c99b55]"
                            strokeWidth={1.5}
                          />

                          <div>
                            <p className="text-sm font-medium text-[#122425]/80">
                              {event.venue}
                            </p>

                            <p className="mt-1 text-xs text-[#122425]/40">
                              {event.city}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <Ticket
                            className="h-4 w-4 text-[#122425]/30"
                            strokeWidth={1.5}
                          />

                          <span className="text-sm text-[#122425]/70">
                            {getCapacityLabel(event.capacity)}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${getStatusClasses(
                            event.status,
                          )}`}
                        >
                          {getStatusLabel(event.status)}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-5 text-right">
                        <EventActionsMenu
                          event={event}
                          onView={handleView}
                          onEdit={handleEdit}
                          onPublish={handlePublish}
                          onCancel={handleCancel}
                          onComplete={handleComplete}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#122425]/8 bg-[#f5f1e9]">
                        <CalendarDays
                          className="h-6 w-6 text-[#122425]/25"
                          strokeWidth={1.4}
                        />
                      </div>

                      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
                        Event catalogue
                      </p>

                      <h2 className="mt-2 font-serif text-2xl italic text-[#122425]">
                        No events found
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-[#122425]/45">
                        Try adjusting your filters or create your first SOLAÍS
                        event.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE EVENT CARDS */}
        <div className="space-y-3 p-4 md:hidden">
          {isLoading && !hasEvents ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`mobile-event-skeleton-${index}`}
                className="animate-pulse rounded-2xl border border-[#122425]/8 bg-white p-4"
              >
                <div className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 rounded-xl bg-[#f5f1e9]" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-[#f5f1e9]" />
                    <div className="h-3 w-1/2 rounded bg-[#f5f1e9]" />
                    <div className="h-3 w-2/3 rounded bg-[#f5f1e9]" />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded bg-[#f5f1e9]" />
                  <div className="h-3 w-4/5 rounded bg-[#f5f1e9]" />
                </div>
              </div>
            ))
          ) : hasEvents ? (
            events.map((event) => {
              const eventDate = formatEventDate(event.startDate, event.endDate);

              return (
                <article
                  key={`mobile-${event.id}`}
                  className="overflow-hidden rounded-2xl border border-[#122425]/8 bg-white shadow-[0_8px_30px_rgba(18,36,37,0.04)]"
                >
                  {/* CARD HEADER */}
                  <div className="flex gap-3 p-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#122425]/8 bg-[#f5f1e9]">
                      {event.bannerImageUrl ? (
                        <img
                          src={event.bannerImageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <CalendarDays
                            className="h-5 w-5 text-[#122425]/25"
                            strokeWidth={1.5}
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold leading-5 text-[#122425]">
                            {event.title}
                          </p>

                          <p className="mt-1 truncate font-mono text-[9px] text-[#122425]/30">
                            {event.id}
                          </p>
                        </div>

                        <div className="shrink-0">
                          <EventActionsMenu
                            event={event}
                            onView={handleView}
                            onEdit={handleEdit}
                            onPublish={handlePublish}
                            onCancel={handleCancel}
                            onComplete={handleComplete}
                            onDelete={handleDelete}
                          />
                        </div>
                      </div>

                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${getStatusClasses(
                            event.status,
                          )}`}
                        >
                          {getStatusLabel(event.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CARD DETAILS */}
                  <div className="border-t border-[#122425]/6 px-4 py-3">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CalendarDays
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#c99b55]"
                          strokeWidth={1.5}
                        />

                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[#122425]/80">
                            {eventDate.date}
                          </p>

                          <p className="mt-0.5 text-[11px] text-[#122425]/40">
                            {eventDate.time}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#c99b55]"
                          strokeWidth={1.5}
                        />

                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-[#122425]/80">
                            {event.venue}
                          </p>

                          <p className="mt-0.5 text-[11px] text-[#122425]/40">
                            {event.city}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Ticket
                          className="h-4 w-4 shrink-0 text-[#122425]/30"
                          strokeWidth={1.5}
                        />

                        <p className="text-xs text-[#122425]/70">
                          {getCapacityLabel(event.capacity)}
                          {event.capacity !== null ? " capacity" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-[#122425]/8 bg-white px-5 py-16 text-center">
              <div className="mx-auto flex max-w-sm flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#122425]/8 bg-[#f5f1e9]">
                  <CalendarDays
                    className="h-6 w-6 text-[#122425]/25"
                    strokeWidth={1.4}
                  />
                </div>

                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
                  Event catalogue
                </p>

                <h2 className="mt-2 font-serif text-2xl italic text-[#122425]">
                  No events found
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#122425]/45">
                  Try adjusting your filters or create your first SOLAÍS event.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {hasPagination && (
          <div className="flex flex-col gap-4 border-t border-[#122425]/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-[#122425]/40">
              Showing page{" "}
              <span className="font-medium text-[#122425]/65">{meta.page}</span>{" "}
              of{" "}
              <span className="font-medium text-[#122425]/65">
                {meta.totalPages}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={meta.page <= 1 || isLoading}
                className="inline-flex h-10 items-center gap-1 rounded-full border border-[#122425]/10 px-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#122425]/55 transition hover:bg-[#f5f1e9] hover:text-[#122425] disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.7} />
                Previous
              </button>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={meta.page >= meta.totalPages || isLoading}
                className="inline-flex h-10 items-center gap-1 rounded-full border border-[#122425]/10 px-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#122425]/55 transition hover:bg-[#f5f1e9] hover:text-[#122425] disabled:cursor-not-allowed disabled:opacity-25"
              >
                Next
                <ChevronRight className="h-4 w-4" strokeWidth={1.7} />
              </button>
            </div>
          </div>
        )}
      </section>

      <EventConfirmationModal
        event={confirmation?.event ?? null}
        action={confirmation?.action ?? "cancel"}
        isOpen={confirmation !== null}
        isLoading={isCancelling || isDeleting}
        onClose={() => setConfirmation(null)}
        onConfirm={handleConfirmation}
      />
    </div>
  );
}
