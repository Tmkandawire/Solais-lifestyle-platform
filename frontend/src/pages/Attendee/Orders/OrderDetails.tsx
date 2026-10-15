import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Ticket,
  XCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useCancelOrder, useOrder } from "../../../hooks/useOrder";
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

function OrderStatusBanner({ status }: { status: OrderStatus }) {
  const iconClass =
    status === "PAID"
      ? "text-[#c9a96a]"
      : status === "CANCELLED" || status === "EXPIRED"
        ? "text-red-200/80"
        : "text-[#eee8dd]/80";

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#12100d] px-6 py-5 sm:px-7">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#c9a96a]/15 bg-[#c9a96a]/5">
        {status === "PAID" && (
          <CheckCircle2 size={20} strokeWidth={1.4} className={iconClass} />
        )}

        {status === "PENDING" && (
          <Clock3 size={20} strokeWidth={1.4} className={iconClass} />
        )}

        {(status === "CANCELLED" || status === "EXPIRED") && (
          <XCircle size={20} strokeWidth={1.4} className={iconClass} />
        )}
      </div>

      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]/70">
          Order Status
        </p>

        <p className="mt-1 text-sm text-[#eee8dd]">{getStatusLabel(status)}</p>
      </div>
    </div>
  );
}

function OrderSummary({ order }: { order: Order }) {
  const itemCount = getItemCount(order);

  return (
    <section className="overflow-hidden rounded-2xl border border-[#122425]/10 bg-[#12100d]">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]/70">
              Order Reference
            </p>

            <p className="mt-2 break-all font-mono text-sm tracking-[0.08em] text-[#eee8dd]">
              #{order.id}
            </p>
          </div>

          <span
            className={[
              "self-start rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em]",
              getStatusClasses(order.status),
            ].join(" ")}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>
      </div>

      {/* Event */}
      <div className="border-b border-white/10 px-6 py-7 sm:px-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]/70">
          Experience
        </p>

        <h2 className="mt-2 font-serif text-3xl leading-tight text-[#f3eee5] sm:text-4xl">
          SOLAÍS Experience
        </h2>

        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#918879]">
          Event reference · {order.eventId}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <CalendarDays
              size={17}
              strokeWidth={1.4}
              className="shrink-0 text-[#c9a96a]"
            />

            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#918879]">
                Ordered
              </p>

              <p className="mt-1 text-xs text-[#d8d0c4]">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Ticket
              size={17}
              strokeWidth={1.4}
              className="shrink-0 text-[#c9a96a]"
            />

            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#918879]">
                Tickets
              </p>

              <p className="mt-1 text-xs text-[#d8d0c4]">
                {itemCount} {itemCount === 1 ? "ticket" : "tickets"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket breakdown */}
      <div className="px-6 py-7 sm:px-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]/70">
          Ticket Breakdown
        </p>

        <div className="mt-5 divide-y divide-white/10">
          {order.items.map((item) => {
            const subtotal = Number(item.unitPrice) * Number(item.quantity);

            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm text-[#eee8dd]">
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

        {/* Total */}
        <div className="mt-7 flex items-end justify-between border-t border-white/10 pt-6">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#918879]">
              Total
            </p>

            <p className="mt-1 text-xs text-[#918879]">
              {itemCount} {itemCount === 1 ? "ticket" : "tickets"}
            </p>
          </div>

          <p className="font-serif text-3xl text-[#f3eee5]">
            ZMW {formatAmount(order.totalAmount)}
          </p>
        </div>
      </div>
    </section>
  );
}

function OrderMetadata({ order }: { order: Order }) {
  return (
    <section className="rounded-2xl border border-[#122425]/10 bg-[#ebe4d8] p-6 sm:p-7">
      <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#b48643]">
        Order Information
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#806f59]">
            Order ID
          </p>

          <p className="mt-1 break-all font-mono text-xs text-[#122425]">
            {order.id}
          </p>
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#806f59]">
            Created
          </p>

          <p className="mt-1 text-xs text-[#4d5b59]">
            {formatDateTime(order.createdAt)}
          </p>
        </div>

        {order.status === "PENDING" && (
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-[#806f59]">
              Payment Window
            </p>

            <p className="mt-1 text-xs text-[#4d5b59]">
              Expires {formatDateTime(order.expiresAt)}
            </p>
          </div>
        )}

        {order.paidAt && (
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-[#806f59]">
              Paid
            </p>

            <p className="mt-1 text-xs text-[#4d5b59]">
              {formatDateTime(order.paidAt)}
            </p>
          </div>
        )}

        {order.cancelledAt && (
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-[#806f59]">
              Cancelled
            </p>

            <p className="mt-1 text-xs text-[#4d5b59]">
              {formatDateTime(order.cancelledAt)}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function OrderSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-20 rounded-2xl bg-[#12100d]" />

      <div className="overflow-hidden rounded-2xl bg-[#12100d]">
        <div className="border-b border-white/10 px-6 py-7 sm:px-8">
          <div className="h-2 w-28 rounded bg-white/10" />
          <div className="mt-3 h-5 w-40 rounded bg-white/10" />
        </div>

        <div className="px-6 py-8 sm:px-8">
          <div className="h-2 w-20 rounded bg-white/10" />
          <div className="mt-3 h-9 w-64 rounded bg-white/10" />
          <div className="mt-3 h-3 w-48 rounded bg-white/10" />

          <div className="mt-8 space-y-4">
            <div className="h-12 rounded bg-white/5" />
            <div className="h-12 rounded bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderError({
  onRetry,
  onBack,
}: {
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#122425]/10 bg-[#12100d] px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a96a]/20 bg-[#c9a96a]/5">
        <RefreshCw size={24} strokeWidth={1.3} className="text-[#c9a96a]/70" />
      </div>

      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]/70">
        ORDER
      </p>

      <h2 className="mt-3 font-serif text-3xl text-[#f3eee5]">
        We couldn't load this order.
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#918879]">
        The order could not be retrieved. It may no longer be available or
        something went wrong while loading it.
      </p>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e9dfcf] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#17130e] transition hover:bg-[#f3eee5]"
        >
          <RefreshCw size={14} strokeWidth={1.5} />
          Try Again
        </button>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#eee8dd] transition hover:border-[#c9a96a]/50"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Orders
        </button>
      </div>
    </div>
  );
}

function CancelOrderModal({
  open,
  loading,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#122425]/70 px-5 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-order-title"
        className="w-full max-w-md rounded-2xl border border-[#122425]/10 bg-[#f5f1e9] p-7 shadow-2xl sm:p-8"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-900/10 bg-red-900/5">
          <XCircle size={22} strokeWidth={1.4} className="text-red-900/65" />
        </div>

        <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#b48643]">
          Cancel Order
        </p>

        <h2
          id="cancel-order-title"
          className="mt-2 font-serif text-3xl text-[#122425]"
        >
          Cancel this reservation?
        </h2>

        <p className="mt-4 text-sm leading-6 text-[#5f6663]">
          This will cancel your pending order and release the reserved tickets.
          This action cannot be undone.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-900/10 bg-red-900/5 px-4 py-3">
            <p className="text-xs leading-5 text-red-900/75">{error}</p>
          </div>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-[#122425]/10 px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4d5b59] transition hover:border-[#122425]/25 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Keep Order
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#122425] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#eee8dd] transition hover:bg-[#1c3031] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <RefreshCw size={14} className="animate-spin" />}
            {loading ? "Cancelling..." : "Cancel Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AttendeeOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const { order, loading, error, refetch } = useOrder(id);

  const {
    cancelOrder,
    loading: cancelLoading,
    error: cancelError,
  } = useCancelOrder();

  async function handleCancelOrder() {
    if (!order) {
      return;
    }

    try {
      await cancelOrder(order.id);
      setCancelModalOpen(false);
      refetch();
    } catch {
      // The hook exposes the cancellation error for the modal.
    }
  }

  return (
    <>
      <div className="space-y-10">
        {/* =========================================================
            BACK NAVIGATION
        ========================================================= */}
        <div>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#806f59] transition hover:text-[#122425]"
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            Back to Orders
          </Link>
        </div>

        {/* =========================================================
            PAGE INTRODUCTION
        ========================================================= */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]/70">
            SOLAÍS Lifestyle
          </p>

          <h1 className="mt-3 font-serif text-5xl tracking-[-0.02em] text-[#122425] sm:text-6xl">
            Order Details
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#5f6663]">
            Review your reservation, ticket selection and order information.
          </p>
        </section>

        {/* =========================================================
            CONTENT
        ========================================================= */}
        {loading && <OrderSkeleton />}

        {!loading && error && (
          <OrderError
            onRetry={refetch}
            onBack={() => navigate("/account/orders")}
          />
        )}

        {!loading && !error && order && (
          <>
            <OrderStatusBanner status={order.status} />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <OrderSummary order={order} />

              <div className="space-y-6">
                <OrderMetadata order={order} />

                {order.status === "PENDING" && (
                  <section className="rounded-2xl border border-[#c9a96a]/20 bg-[#c9a96a]/5 p-6 sm:p-7">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#c9a96a]/20 bg-[#c9a96a]/5">
                      <Clock3
                        size={19}
                        strokeWidth={1.4}
                        className="text-[#b48643]"
                      />
                    </div>

                    <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#b48643]">
                      Payment Required
                    </p>

                    <h2 className="mt-2 font-serif text-2xl text-[#122425]">
                      Your reservation is pending.
                    </h2>

                    <p className="mt-3 text-xs leading-5 text-[#5f6663]">
                      Complete payment before the reservation expires.
                    </p>

                    <Link
                      to={`/account/orders/${order.id}/checkout`}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#122425] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#eee8dd] transition hover:bg-[#1c3031]"
                    >
                      Pay Now
                      <ArrowUpRight size={15} strokeWidth={1.5} />
                    </Link>
                  </section>
                )}

                {order.status === "PENDING" && (
                  <button
                    type="button"
                    onClick={() => setCancelModalOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-[#122425]/10 px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4d5b59] transition hover:border-red-900/20 hover:text-red-900/70"
                  >
                    Cancel Order
                  </button>
                )}

                {order.status === "PAID" && (
                  <Link
                    to="/account/tickets"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#122425] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#eee8dd] transition hover:bg-[#1c3031]"
                  >
                    View My Tickets
                    <ArrowUpRight size={15} strokeWidth={1.5} />
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <CancelOrderModal
        open={cancelModalOpen}
        loading={cancelLoading}
        error={cancelError}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
      />
    </>
  );
}
