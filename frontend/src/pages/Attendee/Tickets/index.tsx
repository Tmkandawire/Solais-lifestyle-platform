import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  LoaderCircle,
  Minus,
  Plus,
  Ticket,
  Users,
} from "lucide-react";

import { useEventTickets } from "../../../hooks/useTicket";
import type { PublicTicketType } from "../../../types/ticket";

interface TicketSelection {
  ticketTypeId: string;
  quantity: number;
}

interface AttendeeTicketsPageProps {
  /**
   * Hands the complete ticket selection to the Orders flow.
   *
   * Orders owns order creation and checkout. This page does not
   * invent a checkout route.
   */
  onSelectTickets?: (selections: TicketSelection[]) => void;
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_QUANTITY_PER_TICKET_TYPE = 20;

export default function AttendeeTicketsPage({
  onSelectTickets,
}: AttendeeTicketsPageProps) {
  const { eventId } = useParams<{ eventId: string }>();

  const [page, setPage] = useState(1);

  const [selectedQuantities, setSelectedQuantities] = useState<
    Record<string, number>
  >({});

  const { tickets, meta, loading, error, refetch } = useEventTickets(
    eventId ?? "",
    {
      page,
      limit: DEFAULT_PAGE_SIZE,
      status: "ACTIVE",
    },
  );

  const selections = useMemo<TicketSelection[]>(
    () =>
      Object.entries(selectedQuantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([ticketTypeId, quantity]) => ({
          ticketTypeId,
          quantity,
        })),
    [selectedQuantities],
  );

  const totalSelectedQuantity = useMemo(
    () =>
      selections.reduce((total, selection) => total + selection.quantity, 0),
    [selections],
  );

  function getQuantity(ticketTypeId: string): number {
    return selectedQuantities[ticketTypeId] ?? 0;
  }

  function updateQuantity(ticket: PublicTicketType, requestedQuantity: number) {
    const maximum = Math.min(
      ticket.availableQuantity,
      MAX_QUANTITY_PER_TICKET_TYPE,
    );

    const nextQuantity = Math.max(0, Math.min(requestedQuantity, maximum));

    setSelectedQuantities((current) => {
      if (nextQuantity === 0) {
        const next = { ...current };
        delete next[ticket.id];
        return next;
      }

      return {
        ...current,
        [ticket.id]: nextQuantity,
      };
    });
  }

  function handleContinue() {
    if (selections.length === 0) {
      return;
    }

    onSelectTickets?.(selections);
  }

  function formatPrice(ticket: PublicTicketType): string {
    const numericPrice = Number(ticket.price);

    if (!Number.isFinite(numericPrice)) {
      return ticket.price;
    }

    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: ticket.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericPrice);
    } catch {
      return `${ticket.currency} ${ticket.price}`;
    }
  }

  if (!eventId) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-900">
            Event not found
          </h1>

          <p className="mt-2 text-sm text-red-700">
            A valid event ID is required to view available tickets.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <header className="mb-8">
        <Link
          to="/account/events"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to event
        </Link>

        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Tickets
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Choose your tickets
        </h1>

        <p className="mt-2 max-w-2xl text-muted-foreground">
          Select one or more ticket types and choose the quantity you would like
          to purchase.
        </p>
      </header>

      {/* Error */}
      {error && (
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-red-900">Unable to load tickets</p>

            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>

          <button
            type="button"
            onClick={refetch}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      {/* Initial loading */}
      {loading && tickets.length === 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`ticket-skeleton-${index}`}
              className="animate-pulse rounded-2xl border p-6"
            >
              <div className="h-5 w-32 rounded bg-muted" />
              <div className="mt-4 h-4 w-3/4 rounded bg-muted" />
              <div className="mt-6 h-8 w-28 rounded bg-muted" />
              <div className="mt-8 h-10 w-full rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && tickets.length === 0 && (
        <div className="rounded-2xl border p-10 text-center">
          <Ticket className="mx-auto h-10 w-10 text-muted-foreground" />

          <h2 className="mt-4 text-xl font-semibold">No tickets available</h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            There are currently no purchasable ticket types available for this
            event.
          </p>
        </div>
      )}

      {/* Ticket cards */}
      {tickets.length > 0 && (
        <>
          <section
            aria-label="Available ticket types"
            className="relative grid gap-5 md:grid-cols-2"
          >
            {loading && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-background/30 pt-6 backdrop-blur-[1px]">
                <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-xs font-medium shadow-sm">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Updating tickets
                </div>
              </div>
            )}

            {tickets.map((ticket) => {
              const quantity = getQuantity(ticket.id);
              const available = ticket.availableQuantity;
              const soldOut = available <= 0;

              const maximumQuantity = Math.min(
                available,
                MAX_QUANTITY_PER_TICKET_TYPE,
              );

              const atMaximum = quantity >= maximumQuantity;

              return (
                <article
                  key={ticket.id}
                  className="flex flex-col rounded-2xl border bg-background p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">{ticket.name}</h2>

                      {ticket.description && (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {ticket.description}
                        </p>
                      )}
                    </div>

                    <Ticket className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-2xl font-bold">
                        {formatPrice(ticket)}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Price per ticket
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />

                      <span>
                        {soldOut ? "Sold out" : `${available} remaining`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium">Quantity</span>

                      <div className="flex items-center rounded-lg border">
                        <button
                          type="button"
                          aria-label={`Decrease ${ticket.name} quantity`}
                          disabled={quantity === 0}
                          onClick={() => updateQuantity(ticket, quantity - 1)}
                          className="p-2 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <span
                          aria-live="polite"
                          className="min-w-10 text-center text-sm font-semibold"
                        >
                          {quantity}
                        </span>

                        <button
                          type="button"
                          aria-label={`Increase ${ticket.name} quantity`}
                          disabled={soldOut || atMaximum}
                          onClick={() => updateQuantity(ticket, quantity + 1)}
                          className="p-2 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {atMaximum && !soldOut && (
                      <p className="mt-3 text-right text-xs text-muted-foreground">
                        Maximum quantity reached.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <nav
              aria-label="Ticket pagination"
              className="mt-8 flex items-center justify-between"
            >
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages}
              </p>

              <button
                type="button"
                disabled={page >= meta.totalPages || loading}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}

      {/* Selection summary */}
      {selections.length > 0 && (
        <div className="sticky bottom-4 z-20 mt-8 flex flex-col gap-4 rounded-2xl border bg-background p-4 shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              {totalSelectedQuantity}{" "}
              {totalSelectedQuantity === 1 ? "ticket" : "tickets"} selected
            </p>

            <p className="text-xs text-muted-foreground">
              {selections.length}{" "}
              {selections.length === 1 ? "ticket type" : "ticket types"}{" "}
              selected.
            </p>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!onSelectTickets}
            className="inline-flex items-center justify-center rounded-xl bg-[#122425] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}
    </main>
  );
}
