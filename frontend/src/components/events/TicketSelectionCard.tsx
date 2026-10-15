import { useMemo, useState } from "react";
import {
  PiMinusBold,
  PiPlusBold,
  PiTicketBold,
  PiWarningCircleBold,
} from "react-icons/pi";

import { useEventTickets } from "../../hooks/useTicket";
import type { PublicTicketType } from "../../types/ticket";

/**
 * Client-side UX cap only, so the stepper doesn't scroll forever.
 * This is NOT the business rule for max tickets per order — that's a
 * backend decision still pending (see Phase 8.1 gap #5). The backend
 * remains authoritative and will reject anything it doesn't allow.
 */
const STEPPER_UX_CAP = 10;

export interface SelectedTicket {
  ticketTypeId: string;
  name: string;
  price: string;
  currency: string;
  quantity: number;
}

interface TicketSelectionCardProps {
  eventId: string;
  onContinue: (selections: SelectedTicket[]) => void;
}

function formatPrice(price: string, currency: string): string {
  const amount = Number(price);
  if (Number.isNaN(amount)) {
    return `${currency} ${price}`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}

/**
 * Client-side read of sale status, for display only. This mirrors what
 * the backend already filtered on when it returned the ticket (per
 * getTicketsByEvent's contract), so this should rarely disagree with
 * the list itself — it exists to explain *why* a ticket that IS in the
 * list might still show 0 remaining or a not-yet-open sale window,
 * not to re-implement the purchasable filter client-side.
 */
function saleStatusLabel(ticket: PublicTicketType): string | null {
  const now = Date.now();

  if (ticket.status !== "ACTIVE") {
    return "Not available";
  }
  if (ticket.saleStartAt && new Date(ticket.saleStartAt).getTime() > now) {
    return "Sale not started";
  }
  if (ticket.saleEndAt && new Date(ticket.saleEndAt).getTime() < now) {
    return "Sale ended";
  }
  if (ticket.availableQuantity <= 0) {
    return "Sold out";
  }
  return null;
}

function QuantityStepper({
  value,
  max,
  disabled,
  onChange,
}: {
  value: number;
  max: number;
  disabled: boolean;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        disabled={disabled || value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        aria-label="Decrease quantity"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DCCFBE] text-[#162425] transition hover:border-[#C99A5B] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <PiMinusBold />
      </button>

      <span className="w-6 text-center text-base text-[#162425]">{value}</span>

      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase quantity"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DCCFBE] text-[#162425] transition hover:border-[#C99A5B] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <PiPlusBold />
      </button>
    </div>
  );
}

export default function TicketSelectionCard({
  eventId,
  onContinue,
}: TicketSelectionCardProps) {
  const { tickets, loading, error } = useEventTickets(eventId, {
    limit: 50,
    status: "ACTIVE",
  });

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const setQuantity = (ticketTypeId: string, next: number) => {
    setQuantities((current) => ({ ...current, [ticketTypeId]: next }));
  };

  const selections = useMemo<SelectedTicket[]>(() => {
    return tickets
      .map((ticket) => ({
        ticketTypeId: ticket.id,
        name: ticket.name,
        price: ticket.price,
        currency: ticket.currency,
        quantity: quantities[ticket.id] ?? 0,
      }))
      .filter((selection) => selection.quantity > 0);
  }, [tickets, quantities]);

  const totalQuantity = selections.reduce((sum, s) => sum + s.quantity, 0);

  if (loading) {
    return (
      <div className="mt-12 rounded-[28px] border border-[#E6D8C7] bg-white p-7 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-[#C99A5B]">
          TICKETING
        </p>
        <div className="mt-6 animate-pulse space-y-4">
          <div className="h-20 rounded-2xl bg-[#F0E9DD]" />
          <div className="h-20 rounded-2xl bg-[#F0E9DD]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12 rounded-[28px] border border-[#E6D8C7] bg-white p-7 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-[#C99A5B]">
          TICKETING
        </p>
        <div className="mt-4 flex items-start gap-3 text-sm text-[#8A4B3B]">
          <PiWarningCircleBold className="mt-0.5 shrink-0 text-lg" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="mt-12 rounded-[28px] border border-[#E6D8C7] bg-white p-7 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-[#C99A5B]">
          TICKETING
        </p>
        <h3
          className="mt-3 text-3xl text-[#162425]"
          style={{ fontFamily: "Cormorant Garamond" }}
        >
          Reservations are opening soon.
        </h3>
        <p className="mt-4 text-sm leading-7 text-[#626262]">
          Ticket sales for this event haven&apos;t opened yet. Check back closer
          to the date.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-[28px] border border-[#E6D8C7] bg-white p-7 sm:p-8">
      <p className="text-xs uppercase tracking-[0.35em] text-[#C99A5B]">
        TICKETING
      </p>
      <h3
        className="mt-3 text-3xl text-[#162425]"
        style={{ fontFamily: "Cormorant Garamond" }}
      >
        Select your tickets.
      </h3>

      <div className="mt-6 space-y-4">
        {tickets.map((ticket) => {
          const statusLabel = saleStatusLabel(ticket);
          const available = statusLabel === null;
          const currentQuantity = quantities[ticket.id] ?? 0;
          const maxSelectable = Math.min(
            STEPPER_UX_CAP,
            ticket.availableQuantity,
          );

          return (
            <div
              key={ticket.id}
              className="flex flex-col gap-4 rounded-2xl border border-[#EDE2D2] p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-base text-[#162425]">{ticket.name}</p>

                {ticket.description && (
                  <p className="mt-1 text-sm text-[#8A8A8A]">
                    {ticket.description}
                  </p>
                )}

                <p className="mt-2 text-sm text-[#626262]">
                  {formatPrice(ticket.price, ticket.currency)}
                  {available && (
                    <span className="ml-2 text-[#8A8A8A]">
                      · {ticket.availableQuantity} remaining
                    </span>
                  )}
                  {statusLabel && (
                    <span className="ml-2 text-[#B5763F]">· {statusLabel}</span>
                  )}
                </p>
              </div>

              <QuantityStepper
                value={currentQuantity}
                max={maxSelectable}
                disabled={!available}
                onChange={(next) => setQuantity(ticket.id, next)}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={totalQuantity === 0}
        onClick={() => onContinue(selections)}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#162425] px-8 py-4 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-[#263839] disabled:cursor-not-allowed disabled:bg-[#D8D0C5] disabled:text-[#777] sm:w-fit"
      >
        <PiTicketBold />
        {totalQuantity > 0
          ? `Continue · ${totalQuantity} ticket${totalQuantity > 1 ? "s" : ""}`
          : "Select tickets to continue"}
      </button>
    </div>
  );
}
