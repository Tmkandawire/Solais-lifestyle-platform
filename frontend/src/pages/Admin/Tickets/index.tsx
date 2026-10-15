import { useMemo, useState } from "react";

import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Ticket,
} from "lucide-react";

import { useAdminEvents } from "../../../hooks/useAdminEvent";

import {
  useActivateTicketType,
  useAdminTicketTypes,
  useDeactivateTicketType,
  useDeleteTicketType,
} from "../../../hooks/useAdminTicket";

import { useToast } from "../../../hooks/useToast";

import type { AdminEvent } from "../../../types/event";

import type {
  TicketStatus,
  TicketType,
  TicketTypeListParams,
} from "../../../types/ticket";

import TicketTypeActionMenu from "./TicketTypeActionMenu";

import TicketTypeConfirmationModal from "../../../components/admin/TicketTypeConfirmationModal";

const PAGE_SIZE = 10;
const EVENT_PAGE_SIZE = 20;
const CURRENCY = "ZMW";

const TICKET_STATUSES: Array<{
  value: TicketStatus | "";
  label: string;
}> = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

function formatCurrency(amount: number, currency = CURRENCY) {
  if (!Number.isFinite(amount)) {
    return "—";
  }

  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusClasses(status: TicketStatus) {
  return status === "ACTIVE"
    ? "border-[#2f6b4f]/20 bg-[#2f6b4f]/8 text-[#2f6b4f]"
    : "border-[#122425]/10 bg-[#122425]/5 text-[#122425]/55";
}

function getStatusLabel(status: TicketStatus) {
  return status === "ACTIVE" ? "Active" : "Inactive";
}

function getEventStatusLabel(status: AdminEvent["status"]) {
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

function canCreateTicketType(event: AdminEvent | undefined) {
  return Boolean(
    event && event.status !== "CANCELLED" && event.status !== "COMPLETED",
  );
}

function getCapacityLabel(ticketType: TicketType) {
  return ticketType.capacity.toLocaleString("en-ZM");
}

function getSoldLabel(ticketType: TicketType) {
  return ticketType.soldQuantity.toLocaleString("en-ZM");
}

function getAvailableLabel(ticketType: TicketType) {
  return Math.max(
    0,
    ticketType.capacity - ticketType.soldQuantity,
  ).toLocaleString("en-ZM");
}

function getSaleWindow(ticketType: TicketType) {
  const start = formatDate(ticketType.saleStartAt);
  const end = ticketType.saleEndAt
    ? formatDate(ticketType.saleEndAt)
    : "No end date";

  return { start, end };
}

function TicketTypeStatus({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${getStatusClasses(
        status,
      )}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function TicketTypeCard({
  ticketType,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: {
  ticketType: TicketType;
  onView: (ticketType: TicketType) => void;
  onEdit: (ticketType: TicketType) => void;
  onActivate: (ticketType: TicketType) => void;
  onDeactivate: (ticketType: TicketType) => void;
  onDelete: (ticketType: TicketType) => void;
}) {
  const saleWindow = getSaleWindow(ticketType);

  return (
    <article className="rounded-2xl border border-[#122425]/8 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-[#122425]">
            {ticketType.name}
          </h3>

          <p className="mt-1 text-lg font-semibold text-[#122425]">
            {formatCurrency(Number(ticketType.price))}
          </p>
        </div>

        <TicketTypeStatus status={ticketType.status} />
      </div>

      {ticketType.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#122425]/55">
          {ticketType.description}
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#f5f1e9]/70 p-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#122425]/40">
            Capacity
          </p>
          <p className="mt-1 text-sm font-semibold text-[#122425]">
            {getCapacityLabel(ticketType)}
          </p>
        </div>

        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#122425]/40">
            Sold
          </p>
          <p className="mt-1 text-sm font-semibold text-[#122425]">
            {getSoldLabel(ticketType)}
          </p>
        </div>

        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#122425]/40">
            Available
          </p>
          <p className="mt-1 text-sm font-semibold text-[#122425]">
            {getAvailableLabel(ticketType)}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-1 text-xs text-[#122425]/50">
        <p>
          <span className="font-medium text-[#122425]/70">Sale starts:</span>{" "}
          {saleWindow.start}
        </p>
        <p>
          <span className="font-medium text-[#122425]/70">Sale ends:</span>{" "}
          {saleWindow.end}
        </p>
      </div>

      <div className="mt-4 flex justify-end border-t border-[#122425]/8 pt-3">
        <TicketTypeActionMenu
          ticketType={ticketType}
          onView={onView}
          onEdit={onEdit}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}

function TicketTypeTable({
  ticketTypes,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: {
  ticketTypes: TicketType[];
  onView: (ticketType: TicketType) => void;
  onEdit: (ticketType: TicketType) => void;
  onActivate: (ticketType: TicketType) => void;
  onDeactivate: (ticketType: TicketType) => void;
  onDelete: (ticketType: TicketType) => void;
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-225 border-collapse text-left">
        <thead className="border-b border-[#122425]/8 bg-[#f5f1e9]/50">
          <tr>
            <th
              scope="col"
              className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/45"
            >
              Ticket type
            </th>
            <th
              scope="col"
              className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/45"
            >
              Price
            </th>
            <th
              scope="col"
              className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/45"
            >
              Capacity
            </th>
            <th
              scope="col"
              className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/45"
            >
              Sold
            </th>
            <th
              scope="col"
              className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/45"
            >
              Available
            </th>
            <th
              scope="col"
              className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/45"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/45"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#122425]/8">
          {ticketTypes.map((ticketType) => (
            <tr
              key={ticketType.id}
              className="transition hover:bg-[#f5f1e9]/30"
            >
              <td className="px-5 py-5">
                <div className="max-w-xs">
                  <p className="truncate text-sm font-semibold text-[#122425]">
                    {ticketType.name}
                  </p>
                  {ticketType.description && (
                    <p className="mt-1 line-clamp-1 text-xs text-[#122425]/45">
                      {ticketType.description}
                    </p>
                  )}
                </div>
              </td>

              <td className="whitespace-nowrap px-5 py-5 text-sm font-medium text-[#122425]/80">
                {formatCurrency(Number(ticketType.price))}
              </td>

              <td className="px-5 py-5 text-sm text-[#122425]/70">
                {getCapacityLabel(ticketType)}
              </td>

              <td className="px-5 py-5 text-sm text-[#122425]/70">
                {getSoldLabel(ticketType)}
              </td>

              <td className="px-5 py-5 text-sm text-[#122425]/70">
                {getAvailableLabel(ticketType)}
              </td>

              <td className="px-5 py-5">
                <TicketTypeStatus status={ticketType.status} />
              </td>

              <td className="px-5 py-5 text-right">
                <div className="flex justify-end">
                  <TicketTypeActionMenu
                    ticketType={ticketType}
                    onView={onView}
                    onEdit={onEdit}
                    onActivate={onActivate}
                    onDeactivate={onDeactivate}
                    onDelete={onDelete}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminTicketsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedEventId = searchParams.get("eventId") ?? "";

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<TicketStatus | "">("");

  const [confirmation, setConfirmation] = useState<{
    ticketType: TicketType;
    action: "activate" | "deactivate" | "delete";
  } | null>(null);

  const eventParams = useMemo(
    () => ({
      page: 1,
      limit: EVENT_PAGE_SIZE,
    }),
    [],
  );

  const {
    events,
    isLoading: isLoadingEvents,
    error: eventsError,
    refresh: refreshEvents,
  } = useAdminEvents(eventParams);

  const selectedEvent = events.find((event) => event.id === selectedEventId);

  const ticketParams = useMemo<TicketTypeListParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(status ? { status } : {}),
    }),
    [page, status],
  );

  const {
    ticketTypes,
    meta,
    isLoading: isLoadingTickets,
    isRefreshing,
    error: ticketsError,
    refresh: refreshTickets,
  } = useAdminTicketTypes(selectedEventId || undefined, ticketParams);

  const { activate, isLoading: isActivating } = useActivateTicketType();

  const { deactivate, isLoading: isDeactivating } = useDeactivateTicketType();

  const { remove, isLoading: isDeleting } = useDeleteTicketType();

  const hasTicketTypes = ticketTypes.length > 0;
  const hasPagination = meta.totalPages > 1;
  const canCreate = canCreateTicketType(selectedEvent);

  function handleEventChange(eventId: string) {
    setSearchParams(eventId ? { eventId } : {}, { replace: true });
    setPage(1);
    setStatus("");
  }

  function handleStatusChange(value: TicketStatus | "") {
    setStatus(value);
    setPage(1);
  }

  function handlePreviousPage() {
    setPage((current) => Math.max(1, current - 1));
  }

  function handleNextPage() {
    setPage((current) => Math.min(meta.totalPages, current + 1));
  }

  async function handleRefresh() {
    await Promise.all([refreshEvents(), refreshTickets()]);
  }

  function handleView(ticketType: TicketType) {
    navigate(
      `/admin/tickets/${ticketType.id}?eventId=${encodeURIComponent(
        ticketType.eventId,
      )}`,
    );
  }

  function handleEdit(ticketType: TicketType) {
    navigate(
      `/admin/tickets/${ticketType.id}/edit?eventId=${encodeURIComponent(
        ticketType.eventId,
      )}`,
    );
  }

  function handleActivate(ticketType: TicketType) {
    setConfirmation({
      ticketType,
      action: "activate",
    });
  }

  function handleDeactivate(ticketType: TicketType) {
    setConfirmation({
      ticketType,
      action: "deactivate",
    });
  }

  function handleDelete(ticketType: TicketType) {
    setConfirmation({
      ticketType,
      action: "delete",
    });
  }

  async function handleConfirmation() {
    if (!confirmation) {
      return;
    }

    try {
      if (confirmation.action === "activate") {
        await activate(confirmation.ticketType.id);

        toast.success("Ticket type activated.", {
          description: `${confirmation.ticketType.name} is now active.`,
        });
      } else if (confirmation.action === "deactivate") {
        await deactivate(confirmation.ticketType.id);

        toast.success("Ticket type deactivated.", {
          description: `${confirmation.ticketType.name} is no longer active.`,
        });
      } else {
        await remove(confirmation.ticketType.id);

        toast.success("Ticket type deleted successfully.", {
          description: `${confirmation.ticketType.name} has been removed from the active catalogue.`,
        });
      }

      setConfirmation(null);

      await refreshTickets();
    } catch {
      // Mutation hook exposes the error state.
    }
  }

  const createUrl = selectedEventId
    ? `/admin/tickets/new?eventId=${encodeURIComponent(selectedEventId)}`
    : "/admin/tickets/new";

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]">
              Management
            </p>

            {!isLoadingTickets && selectedEventId && (
              <span className="rounded-full border border-[#122425]/10 bg-white px-2.5 py-1 text-[10px] font-semibold text-[#122425]/50">
                {meta.total.toLocaleString("en-ZM")}{" "}
                {meta.total === 1 ? "ticket type" : "ticket types"}
              </span>
            )}
          </div>

          <h1 className="mt-2 font-serif text-4xl italic tracking-tight text-[#122425] sm:text-5xl">
            Ticket Types
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#122425]/55">
            Create and manage ticket types, pricing, capacity, and sale windows
            for your events.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoadingEvents || isRefreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#122425]/15 bg-white px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425] transition hover:bg-[#f5f1e9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              strokeWidth={1.6}
            />
            {isRefreshing ? "Refreshing" : "Refresh"}
          </button>

          <Link
            to={createUrl}
            aria-disabled={!canCreate}
            tabIndex={canCreate ? undefined : -1}
            onClick={(event) => {
              if (!canCreate) {
                event.preventDefault();
              }
            }}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[10px] font-semibold uppercase tracking-[0.18em] transition ${
              canCreate
                ? "bg-[#122425] text-[#eee8dd] hover:bg-[#1b3435]"
                : "cursor-not-allowed bg-[#122425]/10 text-[#122425]/35"
            }`}
          >
            <Plus className="h-4 w-4" strokeWidth={1.7} />
            Create ticket type
          </Link>
        </div>
      </div>

      {/* EVENT SELECTOR */}
      <section className="rounded-2xl border border-[#122425]/8 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="ticket-event"
              className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#122425]/50"
            >
              Select event
            </label>

            <select
              id="ticket-event"
              value={selectedEventId}
              onChange={(event) => handleEventChange(event.target.value)}
              disabled={isLoadingEvents}
              className="h-12 w-full rounded-xl border border-[#122425]/12 bg-[#fbfaf7] px-4 text-sm text-[#122425] outline-none transition focus:border-[#c99b55] disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-xl"
            >
              <option value="">
                {isLoadingEvents ? "Loading events..." : "Choose an event"}
              </option>

              {events.map((event: AdminEvent) => (
                <option key={event.id} value={event.id}>
                  {event.title} ({getEventStatusLabel(event.status)})
                </option>
              ))}
            </select>

            {selectedEvent && (
              <p className="mt-2 text-xs text-[#122425]/45">
                {selectedEvent.venue}, {selectedEvent.city}
              </p>
            )}
          </div>

          {selectedEvent && (
            <div className="flex items-center gap-2 self-start rounded-full border border-[#122425]/10 bg-[#f5f1e9]/60 px-3 py-2 sm:self-auto">
              <span
                className={`h-2 w-2 rounded-full ${
                  selectedEvent.status === "PUBLISHED"
                    ? "bg-[#2f6b4f]"
                    : selectedEvent.status === "CANCELLED"
                      ? "bg-[#a84b45]"
                      : selectedEvent.status === "COMPLETED"
                        ? "bg-[#476b8a]"
                        : "bg-[#c99b55]"
                }`}
              />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#122425]/60">
                {getEventStatusLabel(selectedEvent.status)}
              </span>
            </div>
          )}
        </div>

        {eventsError && (
          <div
            role="alert"
            className="mt-4 flex flex-col gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{eventsError}</span>
            <button
              type="button"
              onClick={refreshEvents}
              className="self-start font-medium underline sm:self-auto"
            >
              Retry
            </button>
          </div>
        )}

        {selectedEvent &&
          (selectedEvent.status === "CANCELLED" ||
            selectedEvent.status === "COMPLETED") && (
            <p
              role="status"
              className="mt-4 rounded-xl border border-[#c99b55]/20 bg-[#c99b55]/10 px-4 py-3 text-sm text-[#8d692f]"
            >
              New ticket types cannot be created for a{" "}
              {selectedEvent.status.toLowerCase()} event.
            </p>
          )}
      </section>

      {/* TICKET TYPES */}
      <section className="overflow-hidden rounded-2xl border border-[#122425]/8 bg-white shadow-sm">
        {!selectedEventId ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
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
              Select an event
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-[#122425]/45">
              Choose an event above to view and manage its ticket types.
            </p>
          </div>
        ) : (
          <>
            {/* ERROR BANNER: retain existing data after refresh failures */}
            {ticketsError && (
              <div
                role="alert"
                className="flex flex-col gap-2 border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <span>{ticketsError}</span>
                <button
                  type="button"
                  onClick={refreshTickets}
                  className="self-start font-medium underline sm:self-auto"
                >
                  Retry
                </button>
              </div>
            )}

            {/* INITIAL ERROR */}
            {ticketsError && !hasTicketTypes && !isLoadingTickets ? (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-red-100 bg-red-50">
                  <Ticket className="h-6 w-6 text-red-400" />
                </div>

                <h2 className="mt-5 font-serif text-2xl italic text-[#122425]">
                  Could not load ticket types
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#122425]/50">
                  We couldn't retrieve ticket types for this event. Please try
                  again.
                </p>

                <button
                  type="button"
                  onClick={refreshTickets}
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#122425] px-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#eee8dd] transition hover:bg-[#1b3435]"
                >
                  Try again
                </button>
              </div>
            ) : isLoadingTickets && !hasTicketTypes ? (
              <div
                aria-label="Loading ticket types"
                aria-busy="true"
                className="space-y-3 p-4"
              >
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`ticket-skeleton-${index}`}
                    className="animate-pulse rounded-2xl border border-[#122425]/8 p-5"
                  >
                    <div className="h-4 w-1/3 rounded bg-[#f5f1e9]" />
                    <div className="mt-3 h-3 w-1/2 rounded bg-[#f5f1e9]" />
                    <div className="mt-5 h-10 rounded bg-[#f5f1e9]" />
                  </div>
                ))}
              </div>
            ) : !hasTicketTypes ? (
              <div className="flex flex-col items-center px-6 py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#122425]/8 bg-[#f5f1e9]">
                  <Ticket
                    className="h-6 w-6 text-[#122425]/25"
                    strokeWidth={1.4}
                  />
                </div>

                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
                  Ticket catalogue
                </p>

                <h2 className="mt-2 font-serif text-2xl italic text-[#122425]">
                  No ticket types found
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#122425]/45">
                  This event doesn't have any ticket types yet.
                  {canCreate
                    ? " Create one to begin configuring ticket sales."
                    : " Ticket types cannot be created for this event."}
                </p>

                {canCreate && (
                  <Link
                    to={createUrl}
                    className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#122425] px-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#eee8dd] transition hover:bg-[#1b3435]"
                  >
                    <Plus className="h-4 w-4" />
                    Create ticket type
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* FILTERS */}
                <div className="flex flex-col gap-3 border-b border-[#122425]/8 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div>
                    <h2 className="font-serif text-xl italic text-[#122425]">
                      Ticket catalogue
                    </h2>
                    <p className="mt-1 text-xs text-[#122425]/45">
                      Manage ticket pricing, capacity, and availability.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label htmlFor="ticket-status" className="sr-only">
                      Filter by ticket status
                    </label>

                    <select
                      id="ticket-status"
                      value={status}
                      onChange={(event) =>
                        handleStatusChange(
                          event.target.value as TicketStatus | "",
                        )
                      }
                      className="h-10 rounded-full border border-[#122425]/12 bg-white px-4 text-xs text-[#122425] outline-none transition focus:border-[#c99b55]"
                    >
                      {TICKET_STATUSES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* DESKTOP TABLE */}
                <div
                  aria-busy={isRefreshing}
                  className={`transition-opacity duration-200 ${
                    isRefreshing ? "opacity-60" : "opacity-100"
                  }`}
                >
                  <TicketTypeTable
                    ticketTypes={ticketTypes}
                    onView={handleView}
                    onEdit={handleEdit}
                    onActivate={handleActivate}
                    onDeactivate={handleDeactivate}
                    onDelete={handleDelete}
                  />
                </div>

                {/* MOBILE CARDS */}
                <div
                  aria-busy={isRefreshing}
                  className={`space-y-3 p-4 transition-opacity duration-200 md:hidden ${
                    isRefreshing ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {ticketTypes.map((ticketType) => (
                    <TicketTypeCard
                      key={ticketType.id}
                      ticketType={ticketType}
                      onView={handleView}
                      onEdit={handleEdit}
                      onActivate={handleActivate}
                      onDeactivate={handleDeactivate}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>

                {/* PAGINATION */}
                {hasPagination && (
                  <div className="flex flex-col gap-3 border-t border-[#122425]/8 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="text-xs text-[#122425]/45">
                      Showing{" "}
                      <span className="font-medium text-[#122425]/75">
                        {(meta.page - 1) * meta.limit + 1}
                      </span>
                      {"–"}
                      <span className="font-medium text-[#122425]/75">
                        {Math.min(meta.page * meta.limit, meta.total)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-[#122425]/75">
                        {meta.total.toLocaleString("en-ZM")}
                      </span>{" "}
                      ticket types
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePreviousPage}
                        disabled={meta.page <= 1 || isLoadingTickets}
                        aria-label="Previous page"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#122425]/12 text-[#122425]/70 transition hover:bg-[#f5f1e9] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      <span className="px-2 text-xs text-[#122425]/60">
                        Page {meta.page} of {meta.totalPages}
                      </span>

                      <button
                        type="button"
                        onClick={handleNextPage}
                        disabled={
                          meta.page >= meta.totalPages || isLoadingTickets
                        }
                        aria-label="Next page"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#122425]/12 text-[#122425]/70 transition hover:bg-[#f5f1e9] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>

      <TicketTypeConfirmationModal
        ticketType={confirmation?.ticketType ?? null}
        action={confirmation?.action ?? "activate"}
        isOpen={confirmation !== null}
        isLoading={isActivating || isDeactivating || isDeleting}
        onClose={() => setConfirmation(null)}
        onConfirm={handleConfirmation}
      />
    </div>
  );
}
