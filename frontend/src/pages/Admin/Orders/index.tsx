import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  ADMIN_ORDERS_PAGE_SIZE,
  ISSUED_TICKET_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_PROVIDER_LABELS,
  PAYMENT_STATUS_LABELS,
  optionsFrom,
} from "../../../constants/admin-order";
import { useAdminOrderDetail } from "../../../hooks/useAdminOrderDetail";
import { useAdminOrders } from "../../../hooks/useAdminOrders";

import type { SelectOption } from "../../../constants/admin-order";
import type {
  AdminIssuedTicketStatus,
  AdminOrder,
  AdminOrderListParams,
  AdminPaymentProvider,
  AdminPaymentStatus,
} from "../../../types/admin-order";
import type { OrderStatus } from "../../../types/order-status";

import {
  formatDate,
  formatDateTime,
  formatMoney,
  multiplyMoney,
} from "../../../utils/admin-display";

import { Field, StatusBadge } from "../../../components/admin/AdminDisplay";

const ORDER_STATUS_OPTIONS = optionsFrom(ORDER_STATUS_LABELS);
const PAYMENT_STATUS_OPTIONS = optionsFrom(PAYMENT_STATUS_LABELS);
const PAYMENT_PROVIDER_OPTIONS = optionsFrom(PAYMENT_PROVIDER_LABELS);

const ORDER_STATUS_CLASSES: Record<OrderStatus, string> = {
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-800",
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  CANCELLED: "border-red-200 bg-red-50 text-red-800",
  EXPIRED: "border-slate-200 bg-slate-100 text-slate-700",
};

const PAYMENT_STATUS_CLASSES: Record<AdminPaymentStatus, string> = {
  SUCCESS: "border-emerald-200 bg-emerald-50 text-emerald-800",
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  FAILED: "border-red-200 bg-red-50 text-red-800",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-700",
};

const TICKET_STATUS_CLASSES: Record<AdminIssuedTicketStatus, string> = {
  ISSUED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  CHECKED_IN: "border-blue-200 bg-blue-50 text-blue-800",
  CANCELLED: "border-red-200 bg-red-50 text-red-800",
};

/**
 * A PENDING order past its expiry is effectively expired but still PENDING in
 * the database until the expiry job sweeps it. Show that honestly.
 */
function getOrderDisplayState(
  order: AdminOrder,
  now: number,
): { label: string; className: string } {
  if (
    order.status === "PENDING" &&
    new Date(order.expiresAt).getTime() <= now
  ) {
    return {
      label: "Expired · awaiting sweep",
      className: ORDER_STATUS_CLASSES.EXPIRED,
    };
  }

  return {
    label: ORDER_STATUS_LABELS[order.status],
    className: ORDER_STATUS_CLASSES[order.status],
  };
}

function getCustomerName(order: AdminOrder): string {
  const name = `${order.account.firstName} ${order.account.lastName}`.trim();
  return name || order.account.email;
}

function getTicketCount(order: AdminOrder): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

/** Re-renders on an interval so "expired" labels stay current without refetching. */
function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}

function FilterSelect<T extends string>({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: T | "";
  options: SelectOption<T>[];
  onChange: (value: T | "") => void;
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T | "")}
        className="w-full rounded-xl border border-[#122425]/15 bg-white px-3 py-3 text-sm text-[#122425] outline-none focus:border-[#c9a96a]"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function OrderDetailsModal({
  order,
  loading,
  error,
  now,
  onClose,
  onRetry,
}: {
  order: AdminOrder | null;
  loading: boolean;
  error: string | null;
  now: number;
  onClose: () => void;
  onRetry: () => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);

  // Mounted only while open: lock page scroll, move focus in, trap Tab,
  // close on Escape, and restore focus to the trigger on unmount.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable =
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!focusable || focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (
        event.shiftKey &&
        (active === first || active === dialogRef.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  const issuedCount = order
    ? order.items.reduce((total, item) => total + item.issuedTickets.length, 0)
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#080b0b]/75 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-order-detail-title"
        className="my-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-[#122425]/10 bg-[#f8f6f0] shadow-2xl outline-none"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#122425]/10 px-5 py-5 sm:px-8">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#a68a50]">
              Order management
            </p>
            <h2
              id="admin-order-detail-title"
              className="mt-2 font-serif text-2xl text-[#122425] sm:text-3xl"
            >
              Order details
            </h2>
            {order && (
              <p className="mt-2 break-all font-mono text-xs text-[#5f6663]">
                {order.id}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="rounded-full p-2 text-[#122425]/70 transition hover:bg-[#122425]/5 hover:text-[#122425]"
          >
            <X size={20} />
          </button>
        </header>

        <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-8">
          {loading && (
            <div
              role="status"
              className="py-16 text-center text-sm text-[#5f6663]"
            >
              Loading order details…
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <p>{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="w-fit font-semibold underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          )}

          {order && (
            <div className="space-y-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#122425]/10 bg-white p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#5f6663]">
                    Customer
                  </p>
                  <p className="mt-3 font-medium text-[#122425]">
                    {getCustomerName(order)}
                  </p>
                  <p className="mt-1 break-all text-sm text-[#5f6663]">
                    {order.account.email}
                  </p>
                  <p className="mt-2 text-xs text-[#5f6663]">
                    Account: {order.account.isActive ? "Active" : "Inactive"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#122425]/10 bg-white p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#5f6663]">
                    Event
                  </p>
                  <p className="mt-3 font-medium text-[#122425]">
                    {order.event.title}
                  </p>
                  <p className="mt-1 text-sm text-[#5f6663]">
                    {order.event.venue}, {order.event.city}
                  </p>
                  <p className="mt-2 text-xs text-[#5f6663]">
                    {formatDateTime(order.event.startDate)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Order status">
                  {(() => {
                    const state = getOrderDisplayState(order, now);
                    return (
                      <StatusBadge className={state.className}>
                        {state.label}
                      </StatusBadge>
                    );
                  })()}
                </Field>

                <Field label="Order total">
                  <span className="text-lg font-semibold">
                    {formatMoney(order.totalAmount, order.currency)}
                  </span>
                </Field>

                <Field label="Created">{formatDateTime(order.createdAt)}</Field>

                <Field label="Reservation expires">
                  {formatDateTime(order.expiresAt)}
                </Field>

                {order.paidAt && (
                  <Field label="Paid">{formatDateTime(order.paidAt)}</Field>
                )}

                {order.cancelledAt && (
                  <Field label="Cancelled">
                    {formatDateTime(order.cancelledAt)}
                  </Field>
                )}
              </div>

              <section>
                <h3 className="font-serif text-xl text-[#122425]">
                  Ticket items
                </h3>

                <div className="mt-3 overflow-x-auto rounded-xl border border-[#122425]/10 bg-white">
                  <table className="w-full min-w-[540px] text-left text-sm">
                    <thead className="bg-[#122425]/5 text-[9px] uppercase tracking-[0.15em] text-[#5f6663]">
                      <tr>
                        <th className="px-4 py-3">Ticket type</th>
                        <th className="px-4 py-3">Quantity</th>
                        <th className="px-4 py-3">Unit price</th>
                        <th className="px-4 py-3">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#122425]/10">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-4 font-medium text-[#122425]">
                            {item.ticketTypeName}
                          </td>
                          <td className="px-4 py-4 text-[#5f6663]">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-4 text-[#5f6663]">
                            {formatMoney(item.unitPrice, order.currency)}
                          </td>
                          <td className="px-4 py-4 font-medium text-[#122425]">
                            {formatMoney(
                              multiplyMoney(item.unitPrice, item.quantity),
                              order.currency,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-serif text-xl text-[#122425]">Payment</h3>

                {order.payment ? (
                  <div className="mt-3 rounded-xl border border-[#122425]/10 bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-medium text-[#122425]">
                        {PAYMENT_PROVIDER_LABELS[order.payment.provider]}
                      </p>
                      <StatusBadge
                        className={PAYMENT_STATUS_CLASSES[order.payment.status]}
                      >
                        {PAYMENT_STATUS_LABELS[order.payment.status]}
                      </StatusBadge>
                    </div>

                    <p className="mt-3 text-lg font-semibold text-[#122425]">
                      {formatMoney(
                        order.payment.amount,
                        order.payment.currency,
                      )}
                    </p>

                    {order.payment.providerReference && (
                      <p className="mt-2 break-all text-xs text-[#5f6663]">
                        Reference: {order.payment.providerReference}
                      </p>
                    )}

                    {order.payment.paidAt && (
                      <p className="mt-2 text-xs text-[#5f6663]">
                        Paid: {formatDateTime(order.payment.paidAt)}
                      </p>
                    )}

                    {order.payment.failureReason && (
                      <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                        {order.payment.failureReason}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-[#122425]/10 bg-white p-5 text-sm text-[#5f6663]">
                    No payment record exists for this order.
                  </p>
                )}
              </section>

              <section>
                <h3 className="font-serif text-xl text-[#122425]">
                  Issued tickets
                </h3>
                <p className="mt-1 text-xs text-[#5f6663]">
                  {issuedCount} ticket record(s)
                </p>

                <div className="mt-3 space-y-2">
                  {order.items.flatMap((item) =>
                    item.issuedTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#122425]/10 bg-white p-4"
                      >
                        <div>
                          <p className="font-mono text-xs text-[#122425]">
                            {ticket.ticketNumber}
                          </p>
                          <p className="mt-1 text-xs text-[#5f6663]">
                            {item.ticketTypeName}
                            {ticket.checkedInAt
                              ? ` · Checked in ${formatDateTime(ticket.checkedInAt)}`
                              : ""}
                          </p>
                        </div>

                        <StatusBadge
                          className={TICKET_STATUS_CLASSES[ticket.status]}
                        >
                          {ISSUED_TICKET_STATUS_LABELS[ticket.status]}
                        </StatusBadge>
                      </div>
                    )),
                  )}

                  {issuedCount === 0 && (
                    <p className="rounded-xl border border-[#122425]/10 bg-white p-5 text-sm text-[#5f6663]">
                      No issued tickets are recorded for this order.
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [paymentStatus, setPaymentStatus] = useState<AdminPaymentStatus | "">(
    "",
  );
  const [paymentProvider, setPaymentProvider] = useState<
    AdminPaymentProvider | ""
  >("");

  const now = useNow(30_000);
  const detail = useAdminOrderDetail();

  // Debounce search; only reset to page 1 when the trimmed term really changed.
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const next = searchInput.trim();
      if (next !== search) {
        setSearch(next);
        setPage(1);
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput, search]);

  const params: AdminOrderListParams = {
    page,
    limit: ADMIN_ORDERS_PAGE_SIZE,
    ...(status ? { status } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(paymentProvider ? { paymentProvider } : {}),
    ...(search ? { search } : {}),
  };

  const { orders, meta, loading, error, refetch } = useAdminOrders(params);

  function resetFilters() {
    setPage(1);
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPaymentStatus("");
    setPaymentProvider("");
  }

  const hasFilters = Boolean(
    searchInput || status || paymentStatus || paymentProvider,
  );

  const totalPages = Math.max(meta.totalPages, 1);
  const rangeStart = (meta.page - 1) * meta.limit + 1;
  const rangeEnd = Math.min(meta.page * meta.limit, meta.total);

  const showSkeleton = loading && orders.length === 0;
  const showLoadFailure = !loading && Boolean(error) && orders.length === 0;
  const showEmpty = !loading && !error && orders.length === 0;
  const pastLastPage = meta.total > 0 && page > 1;

  return (
    <div className="space-y-8">
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]/75">
          SOLAÍS Administration
        </p>

        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-5xl tracking-[-0.02em] text-[#122425] sm:text-6xl">
              Orders
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f6663]">
              Review customer orders, payment records, and issued tickets.
            </p>
          </div>

          <button
            type="button"
            onClick={refetch}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-[#122425] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#eee8dd] transition hover:bg-[#1f3234] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#122425]/10 bg-white/65 p-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5f6663]">
            Matching orders
          </p>
          <p className="mt-3 font-serif text-3xl text-[#122425]">
            {meta.total.toLocaleString("en-GB")}
          </p>
        </div>

        <div className="rounded-2xl border border-[#122425]/10 bg-white/65 p-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5f6663]">
            Current page
          </p>
          <p className="mt-3 font-serif text-3xl text-[#122425]">
            {page}{" "}
            <span className="text-lg text-[#5f6663]">/ {totalPages}</span>
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[#122425]/10 bg-white/65 p-4 sm:p-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1.5fr)_repeat(3,minmax(140px,1fr))]">
          <label className="relative block">
            <span className="sr-only">Search orders</span>
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5f6663]"
            />
            <input
              type="search"
              value={searchInput}
              maxLength={100}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search order, customer, email…"
              className="w-full rounded-xl border border-[#122425]/15 bg-white py-3 pl-11 pr-4 text-sm text-[#122425] outline-none transition placeholder:text-[#5f6663]/65 focus:border-[#c9a96a]"
            />
          </label>

          <FilterSelect
            label="Order status"
            placeholder="All order statuses"
            value={status}
            options={ORDER_STATUS_OPTIONS}
            onChange={(value) => {
              setPage(1);
              setStatus(value);
            }}
          />

          <FilterSelect
            label="Payment status"
            placeholder="All payment statuses"
            value={paymentStatus}
            options={PAYMENT_STATUS_OPTIONS}
            onChange={(value) => {
              setPage(1);
              setPaymentStatus(value);
            }}
          />

          <FilterSelect
            label="Payment provider"
            placeholder="All providers"
            value={paymentProvider}
            options={PAYMENT_PROVIDER_OPTIONS}
            onChange={(value) => {
              setPage(1);
              setPaymentProvider(value);
            }}
          />
        </div>

        {hasFilters && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-medium text-[#5f6663] underline decoration-[#c9a96a]/60 underline-offset-4 transition hover:text-[#122425]"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="w-fit font-semibold underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      <section
        aria-busy={loading}
        className="overflow-hidden rounded-2xl border border-[#122425]/10 bg-white/70"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#122425]/10 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-serif text-xl text-[#122425]">Order records</h2>
            <p className="mt-1 text-xs text-[#5f6663]" aria-live="polite">
              {loading
                ? "Loading orders…"
                : `${orders.length} order(s) on this page`}
            </p>
          </div>
        </div>

        {showSkeleton ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-xl bg-[#122425]/5"
              />
            ))}
          </div>
        ) : showLoadFailure ? (
          <div className="px-6 py-16 text-center text-sm text-[#5f6663]">
            Orders could not be loaded.
          </div>
        ) : showEmpty ? (
          <div className="px-6 py-16 text-center">
            <p className="font-serif text-2xl text-[#122425]">
              No orders found
            </p>
            <p className="mt-3 text-sm text-[#5f6663]">
              {pastLastPage
                ? "This page is past the end of the results."
                : "Try changing your search or filters."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {pastLastPage && (
                <button
                  type="button"
                  onClick={() => setPage(Math.max(meta.totalPages, 1))}
                  className="rounded-full border border-[#122425]/20 px-5 py-2.5 text-xs font-semibold text-[#122425] transition hover:bg-[#122425]/5"
                >
                  Go to last page
                </button>
              )}
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full border border-[#122425]/20 px-5 py-2.5 text-xs font-semibold text-[#122425] transition hover:bg-[#122425]/5"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}
          >
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="border-b border-[#122425]/10 bg-[#122425]/[0.025]">
                  <tr className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#5f6663]">
                    <th className="px-5 py-4">Order / customer</th>
                    <th className="px-5 py-4">Event</th>
                    <th className="px-5 py-4">Tickets</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Order status</th>
                    <th className="px-5 py-4">Payment</th>
                    <th className="px-5 py-4 text-right">Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#122425]/10">
                  {orders.map((order) => {
                    const state = getOrderDisplayState(order, now);

                    return (
                      <tr
                        key={order.id}
                        className="transition hover:bg-[#122425]/[0.025]"
                      >
                        <td className="px-5 py-5">
                          <p className="max-w-[190px] truncate text-sm font-medium text-[#122425]">
                            {getCustomerName(order)}
                          </p>
                          <p className="mt-1 max-w-[190px] truncate text-xs text-[#5f6663]">
                            {order.account.email}
                          </p>
                          <p
                            className="mt-2 font-mono text-[10px] text-[#5f6663]"
                            title={order.id}
                          >
                            {order.id.slice(0, 12)}…
                          </p>
                          <p className="mt-1 text-[10px] text-[#5f6663]">
                            {formatDate(order.createdAt)}
                          </p>
                        </td>

                        <td className="max-w-[220px] px-5 py-5">
                          <p className="truncate text-sm font-medium text-[#122425]">
                            {order.event.title}
                          </p>
                          <p className="mt-1 truncate text-xs text-[#5f6663]">
                            {order.event.venue}, {order.event.city}
                          </p>
                        </td>

                        <td className="px-5 py-5 text-sm text-[#122425]">
                          {getTicketCount(order)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-sm font-semibold text-[#122425]">
                          {formatMoney(order.totalAmount, order.currency)}
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge className={state.className}>
                            {state.label}
                          </StatusBadge>
                        </td>

                        <td className="px-5 py-5">
                          {order.payment ? (
                            <div className="space-y-2">
                              <StatusBadge
                                className={
                                  PAYMENT_STATUS_CLASSES[order.payment.status]
                                }
                              >
                                {PAYMENT_STATUS_LABELS[order.payment.status]}
                              </StatusBadge>
                              <p className="text-[10px] text-[#5f6663]">
                                {
                                  PAYMENT_PROVIDER_LABELS[
                                    order.payment.provider
                                  ]
                                }
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-[#5f6663]">
                              No payment
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => void detail.openOrder(order.id)}
                            aria-label={`View order ${order.id}`}
                            className="inline-flex items-center gap-2 rounded-full border border-[#122425]/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#122425] transition hover:border-[#c9a96a] hover:bg-[#c9a96a]/10"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 lg:hidden">
              {orders.map((order) => {
                const state = getOrderDisplayState(order, now);

                return (
                  <article
                    key={order.id}
                    className="rounded-xl border border-[#122425]/10 bg-white p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#122425]">
                          {getCustomerName(order)}
                        </p>
                        <p className="mt-1 truncate text-xs text-[#5f6663]">
                          {order.account.email}
                        </p>
                      </div>

                      <StatusBadge className={state.className}>
                        {state.label}
                      </StatusBadge>
                    </div>

                    <div className="mt-4 border-t border-[#122425]/10 pt-4">
                      <p className="text-sm font-medium text-[#122425]">
                        {order.event.title}
                      </p>
                      <p className="mt-1 text-xs text-[#5f6663]">
                        {formatDate(order.createdAt)} · {getTicketCount(order)}{" "}
                        ticket(s)
                      </p>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#5f6663]">
                          Order total
                        </p>
                        <p className="mt-1 text-base font-semibold text-[#122425]">
                          {formatMoney(order.totalAmount, order.currency)}
                        </p>
                        {order.payment && (
                          <p className="mt-1 text-[10px] text-[#5f6663]">
                            Payment:{" "}
                            {PAYMENT_STATUS_LABELS[order.payment.status]}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => void detail.openOrder(order.id)}
                        aria-label={`View order ${order.id}`}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#122425] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#eee8dd] transition hover:bg-[#1f3234]"
                      >
                        <Eye size={14} />
                        View order
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        <footer className="flex flex-col gap-3 border-t border-[#122425]/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-[#5f6663]">
            {meta.total === 0 || orders.length === 0
              ? "No records to display"
              : `Showing ${rangeStart}–${rangeEnd} of ${meta.total.toLocaleString("en-GB")} orders`}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="inline-flex items-center gap-1 rounded-full border border-[#122425]/15 px-4 py-2 text-xs font-medium text-[#122425] transition hover:bg-[#122425]/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} />
              Previous
            </button>

            <span className="min-w-16 text-center text-xs text-[#5f6663]">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= meta.totalPages || loading}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="inline-flex items-center gap-1 rounded-full border border-[#122425]/15 px-4 py-2 text-xs font-medium text-[#122425] transition hover:bg-[#122425]/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </footer>
      </section>

      {detail.isOpen && (
        <OrderDetailsModal
          order={detail.order}
          loading={detail.loading}
          error={detail.error}
          now={now}
          onClose={detail.closeOrder}
          onRetry={detail.retry}
        />
      )}
    </div>
  );
}
