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
  ADMIN_ATTENDEES_PAGE_SIZE,
  ATTENDEE_ORDER_STATUS_LABELS,
  ATTENDEE_PAYMENT_STATUS_LABELS,
  ATTENDEE_TICKET_STATUS_LABELS,
} from "../../../constants/admin-attendee";
import { useAdminAttendees } from "../../../hooks/useAdminAttendees";
import { useAdminAttendeeDetail } from "../../../hooks/useAdminAttendeeDetail";

import type {
  AdminAttendeeDetail,
  AdminAttendeeListItem,
  AdminAttendeeOrder,
  AdminAttendeeOrderStatus,
  AdminAttendeePaymentStatus,
  AdminAttendeeTicketStatus,
} from "../../../types/admin-attendee";

import {
  formatDate,
  formatDateTime,
  formatMoney,
  multiplyMoney,
} from "../../../utils/admin-display";

import { Field, StatusBadge } from "../../../components/admin/AdminDisplay";

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const ORDER_CLASSES: Record<AdminAttendeeOrderStatus, string> = {
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-800",
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  CANCELLED: "border-red-200 bg-red-50 text-red-800",
  EXPIRED: "border-slate-200 bg-slate-100 text-slate-700",
};

const PAYMENT_CLASSES: Record<AdminAttendeePaymentStatus, string> = {
  SUCCESS: "border-emerald-200 bg-emerald-50 text-emerald-800",
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  FAILED: "border-red-200 bg-red-50 text-red-800",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-700",
};

const TICKET_CLASSES: Record<AdminAttendeeTicketStatus, string> = {
  ISSUED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  CHECKED_IN: "border-blue-200 bg-blue-50 text-blue-800",
  CANCELLED: "border-red-200 bg-red-50 text-red-800",
};

/**
 * A PENDING order past its expiry is effectively expired but stays PENDING in
 * the database until the expiry job sweeps it. Say so instead of "Pending".
 */
function getOrderDisplay(
  order: Pick<AdminAttendeeOrder, "status" | "expiresAt">,
  now: number,
): { label: string; className: string } {
  const lapsed =
    order.status === "PENDING" && new Date(order.expiresAt).getTime() <= now;

  return lapsed
    ? { label: "Expired · awaiting sweep", className: ORDER_CLASSES.EXPIRED }
    : {
        label: ATTENDEE_ORDER_STATUS_LABELS[order.status],
        className: ORDER_CLASSES[order.status],
      };
}

function attendeeName(attendee: {
  firstName: string;
  lastName: string;
  email: string;
}): string {
  return `${attendee.firstName} ${attendee.lastName}`.trim() || attendee.email;
}

function OrderHistory({ attendee }: { attendee: AdminAttendeeDetail }) {
  // Snapshot at mount: the history only mounts after the data has loaded.
  const [now] = useState(() => Date.now());

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h3 className="font-serif text-xl text-[#122425]">Order history</h3>
        <p className="text-xs text-[#5f6663]">
          Showing {attendee.orders.length} of {attendee._count.orders} orders
        </p>
      </div>

      {attendee.orders.length === 0 ? (
        <p className="mt-3 rounded-xl border border-[#122425]/10 bg-white p-5 text-sm text-[#5f6663]">
          This attendee has no order history.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {attendee.orders.map((order) => {
            const display = getOrderDisplay(order, now);

            return (
              <article
                key={order.id}
                className="rounded-xl border border-[#122425]/10 bg-white p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-[#122425]">
                      {order.event.title}
                    </p>
                    <p className="mt-1 text-xs text-[#5f6663]">
                      {order.event.venue}, {order.event.city}
                    </p>
                    <p className="mt-2 break-all font-mono text-[10px] text-[#5f6663]">
                      Order {order.id}
                    </p>
                  </div>

                  <StatusBadge className={display.className}>
                    {display.label}
                  </StatusBadge>
                </div>

                <div className="mt-4 grid gap-4 border-t border-[#122425]/10 pt-4 sm:grid-cols-3">
                  <Field label="Order total">
                    <span className="font-semibold">
                      {formatMoney(order.totalAmount, order.currency)}
                    </span>
                  </Field>
                  <Field label="Ordered">
                    {formatDateTime(order.createdAt)}
                  </Field>
                  <Field label="Event date">
                    {formatDateTime(order.event.startDate)}
                  </Field>
                </div>

                <div className="mt-4 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap justify-between gap-2 text-xs"
                    >
                      <span className="text-[#5f6663]">
                        {item.ticketTypeName} × {item.quantity}
                      </span>
                      <span className="font-medium text-[#122425]">
                        {formatMoney(
                          multiplyMoney(item.unitPrice, item.quantity),
                          order.currency,
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {order.payment && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#122425]/10 pt-4">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#5f6663]">
                        Payment
                      </p>
                      <p className="mt-1 text-sm text-[#122425]">
                        {formatMoney(
                          order.payment.amount,
                          order.payment.currency,
                        )}
                      </p>
                    </div>
                    <StatusBadge
                      className={PAYMENT_CLASSES[order.payment.status]}
                    >
                      {ATTENDEE_PAYMENT_STATUS_LABELS[order.payment.status]}
                    </StatusBadge>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {attendee.orders.length < attendee._count.orders && (
        <p className="mt-3 text-xs leading-5 text-[#5f6663]">
          Only the {attendee.orders.length} most recent orders are shown.
        </p>
      )}
    </section>
  );
}

function TicketHistory({ attendee }: { attendee: AdminAttendeeDetail }) {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h3 className="font-serif text-xl text-[#122425]">Ticket history</h3>
        <p className="text-xs text-[#5f6663]">
          Showing {attendee.issuedTickets.length} of{" "}
          {attendee._count.issuedTickets} tickets
        </p>
      </div>

      {attendee.issuedTickets.length === 0 ? (
        <p className="mt-3 rounded-xl border border-[#122425]/10 bg-white p-5 text-sm text-[#5f6663]">
          No issued tickets are recorded for this attendee.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {attendee.issuedTickets.map((ticket) => (
            <article
              key={ticket.id}
              className="rounded-xl border border-[#122425]/10 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-[#122425]">
                    {ticket.orderItem.ticketTypeName}
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-[#5f6663]">
                    {ticket.ticketNumber}
                  </p>
                </div>

                <StatusBadge className={TICKET_CLASSES[ticket.status]}>
                  {ATTENDEE_TICKET_STATUS_LABELS[ticket.status]}
                </StatusBadge>
              </div>

              <p className="mt-3 text-sm text-[#122425]">
                {ticket.orderItem.order.event.title}
              </p>
              <p className="mt-1 text-xs text-[#5f6663]">
                {ticket.orderItem.order.event.venue},{" "}
                {ticket.orderItem.order.event.city}
              </p>

              <div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-[#122425]/10 pt-3 text-xs">
                <span className="text-[#5f6663]">
                  Purchased price:{" "}
                  {formatMoney(
                    ticket.orderItem.unitPrice,
                    ticket.orderItem.order.currency,
                  )}
                </span>

                <span className="text-[#5f6663]">
                  {ticket.checkedInAt
                    ? `Checked in ${formatDateTime(ticket.checkedInAt)}`
                    : `Created ${formatDateTime(ticket.createdAt)}`}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {attendee.issuedTickets.length < attendee._count.issuedTickets && (
        <p className="mt-3 text-xs leading-5 text-[#5f6663]">
          Only the {attendee.issuedTickets.length} most recent tickets are
          shown.
        </p>
      )}
    </section>
  );
}

function AttendeeDetailsModal({
  attendee,
  loading,
  error,
  onClose,
  onRetry,
}: {
  attendee: AdminAttendeeDetail | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);

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

      const dialog = dialogRef.current;
      const focusable = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE);

      if (!dialog || !focusable || focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === dialog)) {
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
        aria-labelledby="admin-attendee-detail-title"
        className="my-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-[#122425]/10 bg-[#f8f6f0] shadow-2xl outline-none"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#122425]/10 px-5 py-5 sm:px-8">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#a68a50]">
              SOLAÍS administration
            </p>
            <h2
              id="admin-attendee-detail-title"
              className="mt-2 font-serif text-2xl text-[#122425] sm:text-3xl"
            >
              Attendee details
            </h2>
            {attendee && (
              <p className="mt-2 break-all font-mono text-xs text-[#5f6663]">
                {attendee.id}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close attendee details"
            className="rounded-full p-2 text-[#122425]/70 transition hover:bg-[#122425]/5"
          >
            <X size={20} />
          </button>
        </header>

        <div className="max-h-[75vh] space-y-8 overflow-y-auto p-5 sm:p-8">
          {loading && (
            <div
              role="status"
              className="py-16 text-center text-sm text-[#5f6663]"
            >
              Loading attendee details…
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

          {attendee && (
            <>
              <section className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#122425]/10 bg-white p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#5f6663]">
                    Account
                  </p>
                  <p className="mt-3 break-words font-medium text-[#122425]">
                    {attendeeName(attendee)}
                  </p>
                  <p className="mt-1 break-all text-sm text-[#5f6663]">
                    {attendee.email}
                  </p>
                  <p className="mt-3 text-xs text-[#5f6663]">
                    {attendee.isActive ? "Active account" : "Inactive account"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#122425]/10 bg-white p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#5f6663]">
                    Registration
                  </p>
                  <p className="mt-3 text-sm text-[#122425]">
                    Registered {formatDateTime(attendee.createdAt)}
                  </p>
                  <p className="mt-2 text-xs text-[#5f6663]">
                    Email verified:{" "}
                    {attendee.emailVerifiedAt
                      ? formatDateTime(attendee.emailVerifiedAt)
                      : "Not verified"}
                  </p>
                  <p className="mt-2 text-xs text-[#5f6663]">
                    Last login: {formatDateTime(attendee.lastLoginAt)}
                  </p>
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#122425]/10 bg-white p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#5f6663]">
                    All orders
                  </p>
                  <p className="mt-2 font-serif text-3xl text-[#122425]">
                    {attendee._count.orders.toLocaleString("en-GB")}
                  </p>
                </div>
                <div className="rounded-xl border border-[#122425]/10 bg-white p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#5f6663]">
                    All issued tickets
                  </p>
                  <p className="mt-2 font-serif text-3xl text-[#122425]">
                    {attendee._count.issuedTickets.toLocaleString("en-GB")}
                  </p>
                </div>
              </section>

              <OrderHistory attendee={attendee} />
              <TicketHistory attendee={attendee} />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function AdminAttendeesPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");

  const detail = useAdminAttendeeDetail();

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

  const params = {
    page,
    limit: ADMIN_ATTENDEES_PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(activeFilter ? { isActive: activeFilter === "true" } : {}),
  };

  const { attendees, meta, loading, error, refetch } =
    useAdminAttendees(params);

  function resetFilters() {
    setPage(1);
    setSearchInput("");
    setSearch("");
    setActiveFilter("");
  }

  const hasFilters = Boolean(searchInput || activeFilter);
  const totalPages = Math.max(meta.totalPages, 1);
  const rangeStart = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const rangeEnd = Math.min(meta.page * meta.limit, meta.total);
  const showSkeleton = loading && attendees.length === 0;
  const showLoadFailure = !loading && Boolean(error) && attendees.length === 0;
  const showEmpty = !loading && !error && attendees.length === 0;
  const pastLastPage = meta.total > 0 && page > totalPages;

  function openAttendee(attendee: AdminAttendeeListItem) {
    void detail.openAttendee(attendee.id);
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]/75">
          SOLAÍS Administration
        </p>

        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-5xl tracking-[-0.02em] text-[#122425] sm:text-6xl">
              Attendees
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f6663]">
              Manage attendee accounts and review their orders, payments and
              ticket history.
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
            Matching attendees
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
        <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_220px]">
          <label className="relative block">
            <span className="sr-only">Search attendees</span>
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5f6663]"
            />
            <input
              type="search"
              value={searchInput}
              maxLength={100}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name, email or account ID…"
              className="w-full rounded-xl border border-[#122425]/15 bg-white py-3 pl-11 pr-4 text-sm text-[#122425] outline-none transition placeholder:text-[#5f6663]/65 focus:border-[#c9a96a]"
            />
          </label>

          <label>
            <span className="sr-only">Account status</span>
            <select
              value={activeFilter}
              onChange={(event) => {
                setPage(1);
                setActiveFilter(event.target.value as "" | "true" | "false");
              }}
              className="w-full rounded-xl border border-[#122425]/15 bg-white px-3 py-3 text-sm text-[#122425] outline-none focus:border-[#c9a96a]"
            >
              <option value="">All account statuses</option>
              <option value="true">Active accounts</option>
              <option value="false">Inactive accounts</option>
            </select>
          </label>
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
            <h2 className="font-serif text-xl text-[#122425]">
              Attendee records
            </h2>
            <p className="mt-1 text-xs text-[#5f6663]" aria-live="polite">
              {loading
                ? "Loading attendees…"
                : `${attendees.length} attendee(s) on this page`}
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
            Attendees could not be loaded.
          </div>
        ) : showEmpty ? (
          <div className="px-6 py-16 text-center">
            <p className="font-serif text-2xl text-[#122425]">
              No attendees found
            </p>
            <p className="mt-3 text-sm text-[#5f6663]">
              {pastLastPage
                ? "This page is past the end of the results."
                : "Try changing your search or account status filter."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {pastLastPage && (
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
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
              <table className="w-full min-w-[1050px] text-left">
                <thead className="border-b border-[#122425]/10 bg-[#122425]/[0.025]">
                  <tr className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#5f6663]">
                    <th className="px-5 py-4">Attendee</th>
                    <th className="px-5 py-4">Registered</th>
                    <th className="px-5 py-4">Paid orders</th>
                    <th className="px-5 py-4">Active tickets</th>
                    <th className="px-5 py-4">Account status</th>
                    <th className="px-5 py-4 text-right">Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#122425]/10">
                  {attendees.map((attendee) => (
                    <tr
                      key={attendee.id}
                      className="transition hover:bg-[#122425]/[0.025]"
                    >
                      <td className="px-5 py-5">
                        <p className="max-w-[240px] truncate text-sm font-medium text-[#122425]">
                          {attendeeName(attendee)}
                        </p>
                        <p className="mt-1 max-w-[240px] truncate text-xs text-[#5f6663]">
                          {attendee.email}
                        </p>
                        <p
                          className="mt-2 font-mono text-[10px] text-[#5f6663]"
                          title={attendee.id}
                        >
                          {attendee.id.slice(0, 12)}…
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-sm text-[#5f6663]">
                        {formatDate(attendee.createdAt)}
                      </td>

                      <td className="px-5 py-5 text-sm text-[#122425]">
                        {attendee._count.orders}
                      </td>

                      <td className="px-5 py-5 text-sm text-[#122425]">
                        {attendee._count.issuedTickets}
                      </td>

                      <td className="px-5 py-5">
                        <StatusBadge
                          className={
                            attendee.isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-slate-200 bg-slate-100 text-slate-700"
                          }
                        >
                          {attendee.isActive ? "Active" : "Inactive"}
                        </StatusBadge>
                      </td>

                      <td className="px-5 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => openAttendee(attendee)}
                          aria-label={`View ${attendeeName(attendee)}`}
                          className="inline-flex items-center gap-2 rounded-full border border-[#122425]/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#122425] transition hover:border-[#c9a96a] hover:bg-[#c9a96a]/10"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 lg:hidden">
              {attendees.map((attendee) => (
                <article
                  key={attendee.id}
                  className="rounded-xl border border-[#122425]/10 bg-white p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-[#122425]">
                        {attendeeName(attendee)}
                      </p>
                      <p className="mt-1 break-all text-xs text-[#5f6663]">
                        {attendee.email}
                      </p>
                    </div>

                    <StatusBadge
                      className={
                        attendee.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-slate-100 text-slate-700"
                      }
                    >
                      {attendee.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </div>

                  <p className="mt-3 text-xs text-[#5f6663]">
                    Registered {formatDate(attendee.createdAt)}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#122425]/10 pt-4">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#5f6663]">
                        Paid orders
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#122425]">
                        {attendee._count.orders}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#5f6663]">
                        Active tickets
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#122425]">
                        {attendee._count.issuedTickets}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openAttendee(attendee)}
                    aria-label={`View ${attendeeName(attendee)}`}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#122425] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#eee8dd] transition hover:bg-[#1f3234]"
                  >
                    <Eye size={14} />
                    View attendee
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}

        <footer className="flex flex-col gap-3 border-t border-[#122425]/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-[#5f6663]">
            {meta.total === 0 || attendees.length === 0
              ? "No records to display"
              : `Showing ${rangeStart}–${rangeEnd} of ${meta.total.toLocaleString("en-GB")} attendees`}
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
              disabled={page >= totalPages || loading}
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
        <AttendeeDetailsModal
          attendee={detail.attendee}
          loading={detail.loading}
          error={detail.error}
          onClose={detail.closeAttendee}
          onRetry={detail.retry}
        />
      )}
    </div>
  );
}
