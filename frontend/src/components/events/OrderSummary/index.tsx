import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  PiArrowLeftBold,
  PiArrowRightBold,
  PiSpinnerBold,
  PiTicketBold,
} from "react-icons/pi";

import { getTicketById } from "../../../api/ticket.api";
import { useCreateOrder } from "../../../hooks/useOrder";

import type { PublicTicketType } from "../../../types/ticket";
import type { SelectedTicket } from "../TicketSelectionCard";

interface OrderSummaryLocationState {
  selections?: SelectedTicket[];
}

interface SelectedTicketSummary {
  ticket: PublicTicketType;
  ticketTypeId: string;
  quantity: number;
  lineTotal: number;
}

export default function OrderSummary() {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    createOrder,
    loading: creatingOrder,
    error: createOrderError,
  } = useCreateOrder();

  const selections = useMemo(() => {
    const state = location.state as OrderSummaryLocationState | null;

    return state?.selections ?? [];
  }, [location.state]);

  const [ticketsById, setTicketsById] = useState<
    Record<string, PublicTicketType>
  >({});
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadSelectedTickets() {
      if (selections.length === 0) {
        setTicketsById({});
        setTicketsLoading(false);
        return;
      }

      setTicketsLoading(true);
      setTicketsError(null);

      try {
        // Fetch each selected ticket type by its own ID rather than
        // re-listing the event's tickets. A list re-fetch can hide a
        // valid selection behind pagination, or silently include a
        // ticket type that's since been deactivated (getTicketsByEvent
        // has no per-call guarantee of ACTIVE-only unless explicitly
        // filtered). Fetching by ID is what this page actually needs
        // to check: "is each specific selection still good right now."
        const results = await Promise.allSettled(
          selections.map((selection) =>
            getTicketById(selection.ticketTypeId, {
              signal: controller.signal,
            }),
          ),
        );

        if (cancelled) {
          return;
        }

        const nextTicketsById: Record<string, PublicTicketType> = {};

        for (const result of results) {
          if (result.status === "fulfilled") {
            nextTicketsById[result.value.id] = result.value;
          }
          // A rejected fetch (404, deactivated, deleted) means that
          // ticket type simply won't appear in ticketsById — which
          // hasInvalidSelection below already treats as a stale
          // selection. No separate error handling needed per-item.
        }

        setTicketsById(nextTicketsById);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setTicketsError(
          err instanceof Error ? err.message : "Failed to load ticket details.",
        );
      } finally {
        if (!cancelled) {
          setTicketsLoading(false);
        }
      }
    }

    void loadSelectedTickets();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [selections]);

  const selectedTickets = useMemo<SelectedTicketSummary[]>(() => {
    if (selections.length === 0 || Object.keys(ticketsById).length === 0) {
      return [];
    }

    const results: SelectedTicketSummary[] = [];

    for (const selection of selections) {
      const ticket = ticketsById[selection.ticketTypeId];

      if (!ticket) {
        continue;
      }

      results.push({
        ticket,
        ticketTypeId: selection.ticketTypeId,
        quantity: selection.quantity,
        lineTotal: Number(ticket.price) * selection.quantity,
      });
    }

    return results;
  }, [selections, ticketsById]);

  const subtotal = useMemo(
    () => selectedTickets.reduce((total, item) => total + item.lineTotal, 0),
    [selectedTickets],
  );

  const hasInvalidSelection =
    selections.length === 0 ||
    selectedTickets.length !== selections.length ||
    selectedTickets.some(
      ({ ticket, quantity }) =>
        ticket.status !== "ACTIVE" ||
        quantity < 1 ||
        quantity > ticket.availableQuantity,
    );

  const handleCreateOrder = async () => {
    if (!eventId || hasInvalidSelection || creatingOrder) {
      return;
    }

    try {
      const order = await createOrder({
        eventId,
        items: selectedTickets.map(({ ticketTypeId, quantity }) => ({
          ticketTypeId,
          quantity,
        })),
      });

      navigate(`/account/orders/${order.id}`, {
        replace: true,
      });
    } catch {
      // useCreateOrder exposes the backend error through createOrderError.
    }
  };

  if (!eventId) {
    return (
      <main className="min-h-screen bg-[#F8F5F0] px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#C99A5B]">
            ORDER SUMMARY
          </p>

          <h1 className="mt-4 font-[Cormorant_Garamond] text-4xl text-[#171717]">
            This order cannot be loaded.
          </h1>

          <Link
            to="/events"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#171717] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2b2b2b]"
          >
            <PiArrowLeftBold />
            Back to events
          </Link>
        </div>
      </main>
    );
  }

  if (ticketsLoading) {
    return (
      <main className="min-h-screen bg-[#F8F5F0] px-6 py-20">
        <div className="flex min-h-[40vh] items-center justify-center">
          <PiSpinnerBold className="animate-spin text-2xl text-[#C99A5B]" />
        </div>
      </main>
    );
  }

  if (ticketsError) {
    return (
      <main className="min-h-screen bg-[#F8F5F0] px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#C99A5B]">
            ORDER SUMMARY
          </p>

          <h1 className="mt-4 font-[Cormorant_Garamond] text-4xl text-[#171717]">
            We couldn't load the tickets.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#6B6258]">
            {ticketsError}
          </p>

          <button
            type="button"
            onClick={() => navigate(`/events/${eventId}`)}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#171717] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2b2b2b]"
          >
            <PiArrowLeftBold />
            Back to event
          </button>
        </div>
      </main>
    );
  }

  if (hasInvalidSelection) {
    return (
      <main className="min-h-screen bg-[#F8F5F0] px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#C99A5B]">
            ORDER SUMMARY
          </p>

          <h1 className="mt-4 font-[Cormorant_Garamond] text-4xl text-[#171717]">
            Your ticket selection is no longer available.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#6B6258]">
            One or more of the tickets you selected is no longer available.
            Please return to the event and make a fresh selection.
          </p>

          <button
            type="button"
            onClick={() => navigate(`/events/${eventId}`)}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#171717] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2b2b2b]"
          >
            <PiArrowLeftBold />
            Return to event
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F5F0] px-6 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link
          to={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-sm text-[#6B6258] transition hover:text-[#171717]"
        >
          <PiArrowLeftBold />
          Back to event
        </Link>

        <div className="mt-10">
          <p className="text-xs uppercase tracking-[0.35em] text-[#C99A5B]">
            ORDER SUMMARY
          </p>

          <h1 className="mt-3 font-[Cormorant_Garamond] text-5xl text-[#171717] sm:text-6xl">
            Review your tickets.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6B6258]">
            Review your selection before continuing to checkout. Ticket
            availability and final pricing are confirmed by Solaís when your
            order is created.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="rounded-[28px] border border-[#E6D8C7] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <PiTicketBold className="text-xl text-[#C99A5B]" />

              <h2 className="font-[Cormorant_Garamond] text-2xl text-[#171717]">
                Selected tickets
              </h2>
            </div>

            <div className="mt-7 divide-y divide-[#E6D8C7]">
              {selectedTickets.map(({ ticket, quantity, lineTotal }) => (
                <div
                  key={ticket.id}
                  className="flex flex-col gap-4 py-6 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-[Cormorant_Garamond] text-2xl text-[#171717]">
                      {ticket.name}
                    </h3>

                    {ticket.description && (
                      <p className="mt-1 max-w-xl text-sm leading-6 text-[#6B6258]">
                        {ticket.description}
                      </p>
                    )}

                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8A7D70]">
                      Quantity: {quantity}
                    </p>
                  </div>

                  <p className="text-lg font-medium text-[#171717]">
                    {ticket.currency} {lineTotal.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <aside className="h-fit rounded-[28px] border border-[#E6D8C7] bg-white p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#C99A5B]">
              TOTAL
            </p>

            <div className="mt-5 flex items-end justify-between gap-4">
              <span className="text-sm text-[#6B6258]">Subtotal</span>

              {/* Assumes a single currency per order — all ticket
                  types on Solaís currently share one currency (ZMW). */}
              <span className="font-[Cormorant_Garamond] text-3xl text-[#171717]">
                {selectedTickets[0]?.ticket.currency ?? "ZMW"}{" "}
                {subtotal.toFixed(2)}
              </span>
            </div>

            <p className="mt-4 text-xs leading-5 text-[#8A7D70]">
              This subtotal is a display estimate. The backend will calculate
              and validate the final order total when your order is created.
            </p>

            {createOrderError && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                {createOrderError}
              </div>
            )}

            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={creatingOrder}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#171717] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creatingOrder ? (
                <>
                  <PiSpinnerBold className="animate-spin" />
                  Creating order...
                </>
              ) : (
                <>
                  Continue to checkout
                  <PiArrowRightBold />
                </>
              )}
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
