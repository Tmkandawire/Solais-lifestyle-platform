import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useOrder } from "../../../hooks/useOrder";
import { useCreatePayment } from "../../../hooks/usePayment";

import type { PaymentProvider } from "../../../types/payment-provider";

const CURRENCY = "ZMW";

const PAYMENT_PROVIDERS: Record<
  PaymentProvider,
  { label: string; description: string }
> = {
  TNM_MPAMBA: {
    label: "TNM Mpamba",
    description: "Mobile money payment",
  },
  AIRTEL_MONEY: {
    label: "Airtel Money",
    description: "Mobile money payment",
  },
  BANK_CARD: {
    label: "Bank Card",
    description: "Card payment",
  },
};

function formatMoney(amount: string, currency: string) {
  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-ZM", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function getRemainingTime(expiresAt: string, now: number) {
  const remaining = Math.max(0, new Date(expiresAt).getTime() - now);

  const minutes = Math.floor(remaining / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  return {
    expired: remaining === 0,
    label: `${minutes}:${String(seconds).padStart(2, "0")}`,
  };
}

export default function AttendeeCheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    order,
    loading,
    refreshing,
    error: orderError,
    refetch,
  } = useOrder(id);

  const {
    createPayment,
    loading: creatingPayment,
    error: paymentError,
    reset: resetPaymentError,
  } = useCreatePayment();

  const [selectedProvider, setSelectedProvider] =
    useState<PaymentProvider | null>(null);
  const [paymentJustCreated, setPaymentJustCreated] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const updateNow = useCallback(() => {
    setNow(Date.now());
  }, []);

  useEffect(() => {
    const interval = window.setInterval(updateNow, 1000);

    return () => window.clearInterval(interval);
  }, [updateNow]);

  const orderStatus = order?.status;
  const paymentStatus = order?.payment?.status;

  useEffect(() => {
    if (!orderStatus || orderStatus !== "PENDING") {
      return;
    }

    if (paymentStatus && paymentStatus !== "PENDING") {
      return;
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refetch();
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [orderStatus, paymentStatus, refetch]);

  useEffect(() => {
    if (order?.status === "PAID") {
      navigate(`/account/orders/${order.id}`, { replace: true });
    }
  }, [order, navigate]);

  const handleCreatePayment = async () => {
    if (!order || !selectedProvider || creatingPayment || paymentJustCreated) {
      return;
    }

    resetPaymentError();
    setPaymentJustCreated(true);

    try {
      await createPayment({
        orderId: order.id,
        provider: selectedProvider,
      });

      refetch();
    } catch {
      setPaymentJustCreated(false);
      refetch();
    }
  };

  if (!id) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <CheckoutNotice
          title="Invalid checkout"
          message="The order reference is missing."
        />
        <BackToOrders />
      </main>
    );
  }

  if (loading && !order) {
    return (
      <main
        className="mx-auto max-w-3xl px-4 py-16"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="animate-pulse space-y-5">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-48 rounded-xl bg-gray-100" />
          <div className="h-32 rounded-xl bg-gray-100" />
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <CheckoutNotice
          title="Unable to load order"
          message={orderError ?? "We couldn't find this order."}
        />
        <button
          type="button"
          onClick={refetch}
          className="mt-5 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
        <BackToOrders />
      </main>
    );
  }

  const remaining = getRemainingTime(order.expiresAt, now);
  const payment = order.payment;

  const isExpired =
    order.status === "EXPIRED" ||
    (order.status === "PENDING" && remaining.expired);

  const canCreatePayment =
    order.status === "PENDING" &&
    !payment &&
    !remaining.expired &&
    !paymentJustCreated;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          to={`/account/orders/${order.id}`}
          className="text-sm font-medium text-gray-500 transition hover:text-black"
        >
          ← Back to order
        </Link>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Checkout
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
              Complete your order
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          {order.status === "PENDING" && !remaining.expired && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-medium text-amber-800">
                Payment window
              </p>
              <p className="mt-1 font-mono text-xl font-semibold text-amber-950">
                {remaining.label}
              </p>
            </div>
          )}
        </div>
      </div>

      {orderError && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {orderError}
        </div>
      )}

      {refreshing && (
        <p className="mb-4 text-xs text-gray-500" aria-live="polite">
          Updating order status…
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          {isExpired && (
            <CheckoutNotice
              title="Payment window expired"
              message="This order has expired and can no longer be paid. Please return to the events page to make a new booking."
              variant="warning"
            />
          )}

          {order.status === "CANCELLED" && (
            <CheckoutNotice
              title="Order cancelled"
              message="This order has been cancelled and cannot be paid."
            />
          )}

          {payment?.status === "FAILED" && (
            <CheckoutNotice
              title="Payment failed"
              // Mutation errors are transient; persisted failures may have no paymentError.
              message={
                "Your payment was unsuccessful. " +
                (paymentError ?? "This payment cannot be retried.")
              }
              variant="danger"
            />
          )}

          {payment?.status === "CANCELLED" && (
            <CheckoutNotice
              title="Payment cancelled"
              message="This payment was cancelled. A new payment cannot currently be created for this order."
            />
          )}

          {payment?.status === "SUCCESS" && order.status !== "PAID" && (
            <CheckoutNotice
              title="Payment received"
              message="Your payment was marked successful, but the order is not yet marked as paid. Please refresh or contact support."
              variant="warning"
            />
          )}

          {order.status === "PENDING" &&
            payment?.status === "PENDING" &&
            !isExpired && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-3 w-3 animate-pulse rounded-full bg-blue-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-blue-950">
                      Awaiting payment confirmation
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-blue-900">
                      Your payment has been created. We are waiting for
                      confirmation. This page will update automatically when the
                      order status changes.
                    </p>
                    <p className="mt-3 text-xs text-blue-800">
                      Selected method:{" "}
                      {PAYMENT_PROVIDERS[payment.provider].label}
                    </p>
                  </div>
                </div>
              </div>
            )}

          {canCreatePayment && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-950">
                Choose a payment method
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Select your preferred payment method to continue.
              </p>

              <fieldset className="mt-6 space-y-3">
                <legend className="sr-only">Payment methods</legend>

                {(
                  Object.entries(PAYMENT_PROVIDERS) as [
                    PaymentProvider,
                    (typeof PAYMENT_PROVIDERS)[PaymentProvider],
                  ][]
                ).map(([provider, details]) => (
                  <label
                    key={provider}
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                      selectedProvider === provider
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentProvider"
                      value={provider}
                      checked={selectedProvider === provider}
                      onChange={() => setSelectedProvider(provider)}
                      className="h-4 w-4 accent-black"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-gray-950">
                        {details.label}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        {details.description}
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>

              <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                Payment processing is not yet connected to a provider. Creating
                a payment will not charge you or complete your order.
              </div>

              {paymentError && (
                <p role="alert" className="mt-4 text-sm text-red-600">
                  {paymentError}
                </p>
              )}

              <button
                type="button"
                onClick={handleCreatePayment}
                disabled={
                  !selectedProvider || creatingPayment || paymentJustCreated
                }
                className="mt-6 w-full rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingPayment ? "Creating payment…" : "Continue"}
              </button>
            </section>
          )}
        </section>

        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-950">Order summary</h2>

          <p className="mt-1 text-sm text-gray-500">
            {order.items.length}{" "}
            {order.items.length === 1 ? "ticket type" : "ticket types"}
          </p>

          <div className="my-5 space-y-4 border-y border-gray-100 py-5">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-950">
                    {item.ticketTypeName}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.quantity} × {formatMoney(item.unitPrice, CURRENCY)}
                  </p>
                </div>
                <p className="whitespace-nowrap text-sm font-medium text-gray-950">
                  {formatMoney(
                    String(Number(item.unitPrice) * item.quantity),
                    CURRENCY,
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Total</span>
            <span className="text-xl font-semibold text-gray-950">
              {formatMoney(order.totalAmount, CURRENCY)}
            </span>
          </div>

          <div className="mt-5 space-y-2 text-xs text-gray-500">
            <p>Order created: {formatDate(order.createdAt)}</p>
            <p>Expires: {formatDate(order.expiresAt)}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function CheckoutNotice({
  title,
  message,
  variant = "default",
}: {
  title: string;
  message: string;
  variant?: "default" | "warning" | "danger" | "success";
}) {
  const styles = {
    default: "border-gray-200 bg-gray-50 text-gray-900",
    warning: "border-amber-200 bg-amber-50 text-amber-950",
    danger: "border-red-200 bg-red-50 text-red-950",
    success: "border-green-200 bg-green-50 text-green-950",
  };

  return (
    <div className={`rounded-xl border p-5 ${styles[variant]}`} role="status">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6">{message}</p>
    </div>
  );
}

function BackToOrders() {
  return (
    <Link
      to="/account/orders"
      className="mt-5 inline-block text-sm font-semibold text-gray-700 underline underline-offset-4 hover:text-black"
    >
      Back to orders
    </Link>
  );
}
