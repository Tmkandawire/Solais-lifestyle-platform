import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RefreshCw,
  Ticket,
} from "lucide-react";

import { useMyIssuedTickets } from "../../../hooks/useIssuedTickets";
import type { IssuedTicketStatus } from "../../../types/issued-ticket";

import IssuedTicketQrCode from "../../../components/attendee/IssuedTicketQrCode";

const PAGE_SIZE = 10;

function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Date unavailable";
  }

  const sameDay = start.toDateString() === end.toDateString();

  if (sameDay) {
    return formatDate(startDate);
  }

  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

function formatStatus(status: IssuedTicketStatus): string {
  switch (status) {
    case "ISSUED":
      return "Issued";
    case "CHECKED_IN":
      return "Checked In";
    case "CANCELLED":
      return "Cancelled";
  }
}

function getStatusClass(status: IssuedTicketStatus): string {
  switch (status) {
    case "ISSUED":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "CHECKED_IN":
      return "border-blue-200 bg-blue-50 text-blue-800";
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-800";
  }
}

export default function AttendeeMyTicketsPage() {
  const [page, setPage] = useState(1);

  const { tickets, meta, loading, error, refetch } = useMyIssuedTickets({
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="space-y-12">
      {/* Page header */}
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]/70">
          SOLAÍS Lifestyle
        </p>

        <h1 className="mt-3 font-serif text-5xl tracking-[-0.02em] text-[var(--attendee-text)] sm:text-6xl">
          My Tickets
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--attendee-text-muted)]">
          View your SOLAÍS admission tickets and keep track of your upcoming
          experiences.
        </p>
      </section>

      {/* Ticket count and refresh */}
      <section className="flex flex-col gap-4 border-b border-[var(--attendee-border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8a8175]">
            Your collection
          </p>

          <p className="mt-2 font-serif text-2xl text-[var(--attendee-text)]">
            {loading && meta.total === 0
              ? "Loading tickets..."
              : `${meta.total} ${meta.total === 1 ? "ticket" : "tickets"}`}
          </p>
        </div>

        <button
          type="button"
          onClick={refetch}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-[var(--attendee-border)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--attendee-text)] transition-colors hover:bg-[var(--attendee-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </section>

      {/* Error state */}
      {error && (
        <section
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6"
        >
          <h2 className="font-semibold text-red-900">
            Unable to load your tickets
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-700">{error}</p>

          <button
            type="button"
            onClick={refetch}
            className="mt-5 rounded-full border border-red-300 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-red-800 transition-colors hover:bg-red-100"
          >
            Try again
          </button>
        </section>
      )}

      {/* Loading state */}
      {loading && tickets.length === 0 && !error && (
        <section
          aria-label="Loading tickets"
          className="grid gap-5 md:grid-cols-2"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`ticket-skeleton-${index}`}
              className="animate-pulse rounded-2xl border border-[var(--attendee-border)] bg-[var(--attendee-surface)] p-6"
            >
              <div className="h-3 w-28 rounded bg-[var(--attendee-surface-muted)]" />
              <div className="mt-5 h-7 w-3/4 rounded bg-[var(--attendee-surface-muted)]" />
              <div className="mt-4 h-4 w-1/2 rounded bg-[var(--attendee-surface-muted)]" />
              <div className="mt-8 h-4 w-2/3 rounded bg-[var(--attendee-surface-muted)]" />
              <div className="mt-6 h-12 rounded bg-[var(--attendee-surface-muted)]" />
            </div>
          ))}
        </section>
      )}

      {/* Empty state */}
      {!loading && !error && tickets.length === 0 && (
        <section className="rounded-2xl bg-[#12100d] px-6 py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a96a]/20 bg-[#c9a96a]/5">
            <Ticket size={24} strokeWidth={1.3} className="text-[#c9a96a]/70" />
          </div>

          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]/70">
            MY TICKETS
          </p>

          <h2 className="mt-3 font-serif text-3xl text-[#f3eee5]">
            Your tickets will appear here.
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#918879]">
            Once you purchase tickets for a SOLAÍS experience, your admission
            passes will be available here.
          </p>
        </section>
      )}

      {/* Ticket list */}
      {tickets.length > 0 && (
        <section aria-label="Your tickets" className="space-y-5">
          {tickets.map((ticket) => (
            <article
              key={ticket.id}
              className="overflow-hidden rounded-2xl border border-[var(--attendee-border)] bg-[var(--attendee-surface)] shadow-sm"
            >
              {/* Event banner */}
              {ticket.event.bannerImageUrl && (
                <div className="h-40 overflow-hidden bg-[var(--attendee-surface-muted)] sm:h-48">
                  <img
                    src={ticket.event.bannerImageUrl}
                    alt={ticket.event.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="p-6 sm:p-8">
                {/* Event title and status */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b08d50]">
                      SOLAÍS EXPERIENCE
                    </p>

                    <h2 className="mt-2 font-serif text-2xl text-[#122425] sm:text-3xl">
                      {ticket.event.title}
                    </h2>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${getStatusClass(ticket.status)}`}
                  >
                    {formatStatus(ticket.status)}
                  </span>
                </div>

                {/* Event information */}
                <div className="mt-6 grid gap-4 border-b border-[#122425]/10 pb-6 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <CalendarDays
                      size={18}
                      className="mt-0.5 shrink-0 text-[#b08d50]"
                    />

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a8175]">
                        Event date
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#122425]">
                        {formatDateRange(
                          ticket.event.startDate,
                          ticket.event.endDate,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-[#b08d50]"
                    />

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a8175]">
                        Venue
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#122425]">
                        {ticket.event.venue}, {ticket.event.city}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ticket details */}
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a8175]">
                      Ticket type
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#122425]">
                      {ticket.ticketType.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a8175]">
                      Ticket number
                    </p>

                    <p className="mt-1 break-all font-mono text-sm font-medium text-[#122425]">
                      {ticket.ticketNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a8175]">
                      Ticket price
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#122425]">
                      {ticket.ticketType.price}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a8175]">
                      Issued on
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#122425]">
                      {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Secure admission QR code */}
                <IssuedTicketQrCode
                  ticketId={ticket.id}
                  ticketStatus={ticket.status}
                />
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <nav
          aria-label="Ticket pagination"
          className="flex items-center justify-between border-t border-[var(--attendee-border)] pt-6"
        >
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => current - 1)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--attendee-border)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--attendee-text)] transition-colors hover:bg-[var(--attendee-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={15} />
            Previous
          </button>

          <p className="text-xs text-[var(--attendee-text-muted)]">
            Page {meta.page} of {meta.totalPages}
          </p>

          <button
            type="button"
            disabled={page >= meta.totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--attendee-border)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--attendee-text)] transition-colors hover:bg-[var(--attendee-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={15} />
          </button>
        </nav>
      )}
    </div>
  );
}
