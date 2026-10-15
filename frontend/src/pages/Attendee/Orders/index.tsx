import { useState } from "react";

import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RefreshCw,
  ShoppingBag,
  Ticket,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useOrders } from "../../../hooks/useOrder";
import type { Order } from "../../../types/order";
import type { OrderStatus } from "../../../types/order-status";

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatAmount(value: string): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return value;
  }

  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
      return "Awaiting Payment";
    case "PAID":
      return "Paid";
    case "CANCELLED":
      return "Cancelled";
    case "EXPIRED":
      return "Expired";
    default:
      return status;
  }
}

function getStatusClasses(status: OrderStatus): string {
  switch (status) {
    case "PAID":
      return "border-[#c9a96a]/25 bg-[#c9a96a]/10 text-[#c9a96a]";

    case "PENDING":
      return "border-[#eee8dd]/15 bg-white/5 text-[#eee8dd]";

    case "CANCELLED":
      return "border-red-300/15 bg-red-300/5 text-red-200";

    case "EXPIRED":
      return "border-white/10 bg-white/5 text-[#918879]";

    default:
      return "border-white/10 bg-white/5 text-[#918879]";
  }
}

function getItemCount(order: Order): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

function OrderCard({ order }: { order: Order }) {
  const itemCount = getItemCount(order);

  return (
    <article className="overflow-hidden rounded-2xl border border-[#122425]/10 bg-[#12100d]">
      {/* Header */}
      <div className="flex flex-col gap-5 border-b border-white/10 px-6 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]/70">
            Order
          </p>

          <p className="mt-2 font-mono text-sm tracking-[0.08em] text-[#eee8dd]">
            #{order.id}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={[
              "rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em]",
              getStatusClasses(order.status),
            ].join(" ")}
          >
            {getStatusLabel(order.status)}
          </span>

          <span className="text-xs text-[#918879]">
            {formatDate(order.createdAt)}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]/70">
              Experience
            </p>

            <h2 className="mt-2 font-serif text-3xl leading-tight text-[#f3eee5] sm:text-4xl">
              SOLAÍS Experience
            </h2>

            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#918879]">
              Event reference · {order.eventId}
            </p>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              <div className="flex items-center gap-2.5">
                <Ticket
                  size={16}
                  strokeWidth={1.4}
                  className="text-[#c9a96a]"
                />

                <span className="text-xs text-[#d8d0c4]">
                  {itemCount} {itemCount === 1 ? "ticket" : "tickets"}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <ShoppingBag
                  size={16}
                  strokeWidth={1.4}
                  className="text-[#c9a96a]"
                />

                <span className="text-xs text-[#d8d0c4]">
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "ticket type" : "ticket types"}
                </span>
              </div>

              {order.status === "PENDING" && (
                <div className="flex items-center gap-2.5">
                  <Clock3
                    size={16}
                    strokeWidth={1.4}
                    className="text-[#c9a96a]"
                  />

                  <span className="text-xs text-[#d8d0c4]">
                    Expires {formatDateTime(order.expiresAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-white/10 pt-6 lg:min-w-[180px] lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 lg:text-right">
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#918879]">
              Order Total
            </p>

            <p className="mt-2 font-serif text-3xl text-[#f3eee5]">
              ZMW {formatAmount(order.totalAmount)}
            </p>
          </div>
        </div>

        {/* Ticket items */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]/70">
            Ticket Breakdown
          </p>

          <div className="mt-4 divide-y divide-white/10">
            {order.items.map((item) => {
              const subtotal = Number(item.unitPrice) * Number(item.quantity);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-[#eee8dd]">
                      {item.ticketTypeName}
                    </p>

                    <p className="mt-1 text-xs text-[#918879]">
                      {item.quantity} × ZMW {formatAmount(item.unitPrice)}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm text-[#d8d0c4]">
                    ZMW {formatAmount(subtotal.toFixed(2))}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#918879]">
            Placed {formatDateTime(order.createdAt)}
          </p>

          <Link
            to={`/account/orders/${order.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#eee8dd] transition hover:border-[#c9a96a]/50 hover:text-[#e9dfcf]"
          >
            View Order
            <ArrowUpRight size={15} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function OrderSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[var(--attendee-border)] bg-[#12100d]">
      <div className="border-b border-white/10 px-6 py-6 sm:px-8">
        <div className="h-2 w-16 rounded bg-white/10" />
        <div className="mt-3 h-4 w-32 rounded bg-white/10" />
      </div>

      <div className="px-6 py-7 sm:px-8">
        <div className="h-2 w-20 rounded bg-white/10" />
        <div className="mt-3 h-9 w-64 rounded bg-white/10" />
        <div className="mt-3 h-3 w-48 rounded bg-white/10" />

        <div className="mt-7 flex gap-5">
          <div className="h-3 w-24 rounded bg-white/10" />
          <div className="h-3 w-28 rounded bg-white/10" />
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="h-2 w-28 rounded bg-white/10" />

          <div className="mt-5 space-y-4">
            <div className="h-12 rounded bg-white/5" />
            <div className="h-12 rounded bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="rounded-2xl border border-[#122425]/10 bg-[#12100d] px-6 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a96a]/20 bg-[#c9a96a]/5">
        <ShoppingBag
          size={24}
          strokeWidth={1.3}
          className="text-[#c9a96a]/70"
        />
      </div>

      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]/70">
        YOUR ORDERS
      </p>

      <h2 className="mt-3 font-serif text-3xl text-[#f3eee5]">
        Nothing here yet.
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#918879]">
        Once you reserve your place at a SOLAÍS experience, your order history
        will appear here.
      </p>

      <Link
        to="/events"
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#e9dfcf] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#17130e] transition hover:bg-[#f3eee5]"
      >
        Discover Events
        <ArrowUpRight size={15} strokeWidth={1.5} />
      </Link>
    </div>
  );
}

export default function AttendeeOrdersPage() {
  const [page, setPage] = useState(1);

  const { orders, meta, loading, error, refetch } = useOrders({
    page,
    limit: 6,
  });

  function handlePreviousPage() {
    setPage((current) => Math.max(1, current - 1));
  }

  function handleNextPage() {
    if (meta && page < meta.totalPages) {
      setPage((current) => current + 1);
    }
  }

  return (
    <div className="space-y-12">
      {/* =========================================================
          PAGE INTRODUCTION
      ========================================================= */}
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]/70">
          SOLAÍS Lifestyle
        </p>

        <h1 className="mt-3 font-serif text-5xl tracking-[-0.02em] text-[var(--attendee-text)] sm:text-6xl">
          My Orders
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--attendee-text-muted)]">
          A record of your SOLAÍS reservations, ticket purchases and upcoming
          experiences.
        </p>
      </section>

      {/* =========================================================
          ORDER LIST
      ========================================================= */}
      <section>
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]/70">
              Purchase History
            </p>

            <h2 className="mt-2 font-serif text-3xl tracking-[-0.01em] text-[var(--attendee-text)] sm:text-4xl">
              Your reservations
            </h2>
          </div>

          {!loading && !error && meta && meta.total > 0 && (
            <span className="hidden text-xs text-[var(--attendee-text-muted)] sm:block">
              {meta.total} {meta.total === 1 ? "order" : "orders"}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <OrderSkeleton key={`order-skeleton-${index}`} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-[#122425]/10 bg-[#12100d] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a96a]/20 bg-[#c9a96a]/5">
              <RefreshCw
                size={24}
                strokeWidth={1.3}
                className="text-[#c9a96a]/70"
              />
            </div>

            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]/70">
              ORDERS
            </p>

            <h2 className="mt-3 font-serif text-3xl text-[#f3eee5]">
              We couldn't load your orders.
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#918879]">
              Something went wrong while retrieving your SOLAÍS purchase
              history. Please try again.
            </p>

            <button
              type="button"
              onClick={refetch}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#e9dfcf] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#17130e] transition hover:bg-[#f3eee5]"
            >
              <RefreshCw size={14} strokeWidth={1.5} />
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && <EmptyOrders />}

        {/* Orders */}
        {!loading && !error && orders.length > 0 && (
          <>
            <div className="space-y-6">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-[var(--attendee-border)] pt-6">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={page <= 1 || loading}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--attendee-border)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--attendee-text)] transition hover:border-[#c9a96a]/40 hover:text-[var(--attendee-accent)] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft size={15} strokeWidth={1.5} />
                  Previous
                </button>

                <span className="text-xs text-[var(--attendee-text-muted)]">
                  Page {meta.page} of {meta.totalPages}
                </span>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={page >= meta.totalPages || loading}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--attendee-border)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--attendee-text)] transition hover:border-[#c9a96a]/40 hover:text-[var(--attendee-accent)] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Next
                  <ChevronRight size={15} strokeWidth={1.5} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
