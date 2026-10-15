import { useMemo, useSyncExternalStore } from "react";

import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  RefreshCw,
  ShoppingBag,
  Ticket,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useEvents } from "../../../hooks/useEvents";
import { useAdminEvents } from "../../../hooks/useAdminEvent";
import { useOrders } from "../../../hooks/useOrder";
import type { Event } from "../../../types/event";
import type { Order } from "../../../types/order";
import type { OrderStatus } from "../../../types/order-status";

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatLongDate(value: string): string {
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

function formatTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(value: string): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Amount unavailable";
  }

  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getGreeting(hour: number): string {
  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function getStatusLabel(status: Event["status"]): string {
  return status.replace("_", " ");
}

function getStatusClasses(status: Event["status"]): string {
  switch (status) {
    case "PUBLISHED":
      return "border-[#8ab99b]/25 bg-[#8ab99b]/10 text-[#315f49]";

    case "DRAFT":
      return "border-[#c9a96a]/25 bg-[#c9a96a]/10 text-[#806238]";

    case "CANCELLED":
      return "border-[#a97979]/25 bg-[#a97979]/10 text-[#704545]";

    case "COMPLETED":
      return "border-[#122425]/10 bg-[#122425]/5 text-[#122425]/60";

    default:
      return "border-[#122425]/10 bg-[#122425]/5 text-[#122425]/60";
  }
}

function getOrderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
      return "Awaiting payment";
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

function getOrderStatusClasses(status: OrderStatus): string {
  switch (status) {
    case "PAID":
      return "border-[#8ab99b]/25 bg-[#8ab99b]/10 text-[#315f49]";
    case "PENDING":
      return "border-[#c9a96a]/25 bg-[#c9a96a]/10 text-[#806238]";
    case "CANCELLED":
      return "border-[#a97979]/25 bg-[#a97979]/10 text-[#704545]";
    case "EXPIRED":
      return "border-[#122425]/10 bg-[#122425]/5 text-[#122425]/55";
    default:
      return "border-[#122425]/10 bg-[#122425]/5 text-[#122425]/55";
  }
}

function getEventProgress(event: Event): number {
  if (!event.capacity || event.capacity <= 0) {
    return 0;
  }

  return 0;
}

function EventStatusBadge({ status }: { status: Event["status"] }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1.5",
        "text-[8px] font-semibold uppercase tracking-[0.2em]",
        getStatusClasses(status),
      ].join(" ")}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1",
        "text-[8px] font-semibold uppercase tracking-[0.16em]",
        getOrderStatusClasses(status),
      ].join(" ")}
    >
      {getOrderStatusLabel(status)}
    </span>
  );
}

function EventThumbnail({ event }: { event: Event }) {
  return (
    <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-[#e8dfd2]">
      {event.bannerImageUrl ? (
        <img
          src={event.bannerImageUrl}
          alt={event.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#e9dfcf] via-[#d8cbb8] to-[#b9a78e]">
          <span className="font-serif text-xl text-[#122425]/25">Solaís</span>
        </div>
      )}
    </div>
  );
}

/*
 * Current date/time is maintained outside render so the dashboard can remain
 * pure while still updating when the browser crosses into a new day.
 */
let currentDateSnapshot = new Date();
const currentDateListeners = new Set<() => void>();
let currentDateTimer: ReturnType<typeof setInterval> | null = null;

function subscribeToCurrentDate(listener: () => void): () => void {
  currentDateListeners.add(listener);

  if (currentDateTimer === null) {
    currentDateTimer = setInterval(() => {
      currentDateSnapshot = new Date();
      currentDateListeners.forEach((callback) => callback());
    }, 60_000);
  }

  return () => {
    currentDateListeners.delete(listener);

    if (currentDateListeners.size === 0 && currentDateTimer !== null) {
      clearInterval(currentDateTimer);
      currentDateTimer = null;
    }
  };
}

function getCurrentDateSnapshot(): Date {
  return currentDateSnapshot;
}

function CurrentDate() {
  const currentDate = useSyncExternalStore(
    subscribeToCurrentDate,
    getCurrentDateSnapshot,
    getCurrentDateSnapshot,
  );

  const greeting = getGreeting(currentDate.getHours());
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(currentDate);

  return (
    <div className="text-left xl:text-right">
      <p className="font-serif text-2xl tracking-[-0.02em] text-[#122425] sm:text-3xl">
        {greeting}, Administrator
      </p>
      <p className="mt-2 text-xs leading-5 text-[#5f6663]">
        Here&apos;s what&apos;s happening across SOLAÍS.
      </p>
      <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#122425]/40">
        {formattedDate}
      </p>
    </div>
  );
}

function sumOrderTickets(orders: Order[]): number {
  return orders.reduce(
    (total, order) =>
      total +
      order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0),
    0,
  );
}

function getEventOrderActivity(orders: Order[]) {
  const activity = new Map<
    string,
    { eventId: string; orders: number; tickets: number }
  >();

  orders.forEach((order) => {
    const current = activity.get(order.eventId) ?? {
      eventId: order.eventId,
      orders: 0,
      tickets: 0,
    };

    current.orders += 1;
    current.tickets += order.items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    activity.set(order.eventId, current);
  });

  return Array.from(activity.values()).sort((a, b) => {
    if (b.tickets !== a.tickets) {
      return b.tickets - a.tickets;
    }

    return b.orders - a.orders;
  });
}

export default function AdminDashboardPage() {
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useEvents({
    page: 1,
    limit: 6,
  });

  const { meta: adminEventsMeta, isLoading: adminEventsLoading } =
    useAdminEvents({
      page: 1,
      limit: 1,
    });

  const { meta: publishedEventsMeta, isLoading: publishedEventsLoading } =
    useAdminEvents({
      page: 1,
      limit: 1,
      status: "PUBLISHED",
    });

  const { meta: draftEventsMeta, isLoading: draftEventsLoading } =
    useAdminEvents({
      page: 1,
      limit: 1,
      status: "DRAFT",
    });

  const { meta: completedEventsMeta, isLoading: completedEventsLoading } =
    useAdminEvents({
      page: 1,
      limit: 1,
      status: "COMPLETED",
    });

  const { meta: cancelledEventsMeta, isLoading: cancelledEventsLoading } =
    useAdminEvents({
      page: 1,
      limit: 1,
      status: "CANCELLED",
    });

  const totalEventCount = adminEventsMeta.total;
  const publishedEventCount = publishedEventsMeta.total;
  const draftEventCount = draftEventsMeta.total;
  const completedEventCount = completedEventsMeta.total;
  const cancelledEventCount = cancelledEventsMeta.total;

  const eventStatsLoading =
    adminEventsLoading ||
    publishedEventsLoading ||
    draftEventsLoading ||
    completedEventsLoading ||
    cancelledEventsLoading;

  const {
    orders,
    meta: orderMeta,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useOrders({
    page: 1,
    limit: 6,
  });

  const loading = eventsLoading || ordersLoading;

  const upcomingEvents = useMemo(() => {
    return events
      .filter((event) => event.status === "PUBLISHED")
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );
  }, [events]);

  const featuredEvent = upcomingEvents[0] ?? events[0] ?? null;

  const recentEvents = useMemo(() => {
    return [...events]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 4);
  }, [events]);

  const recentOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [orders]);

  const paidOrders = orders.filter((order) => order.status === "PAID");
  const pendingOrders = orders.filter((order) => order.status === "PENDING");
  const paidTicketUnits = sumOrderTickets(paidOrders);

  const eventOrderActivity = useMemo(() => {
    const activity = getEventOrderActivity(orders);

    return activity
      .map((item) => ({
        ...item,
        event: events.find((event) => event.id === item.eventId),
      }))
      .filter((item) => item.event);
  }, [events, orders]);

  const maxEventTicketActivity =
    eventOrderActivity.reduce(
      (maximum, item) => Math.max(maximum, item.tickets),
      0,
    ) || 1;

  const refreshDashboard = () => {
    refetchEvents();
    refetchOrders();
  };

  const hasDataError = Boolean(eventsError || ordersError);

  return (
    <div className="space-y-10 pb-10 sm:space-y-12">
      {/* =========================================================
          HEADER
      ========================================================= */}
      <section className="rounded-[2rem] border border-[#122425]/10 bg-white/55 px-6 py-7 sm:px-8 sm:py-9 lg:px-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#c9a96a]/90">
              SOLAÍS Administration
            </p>

            <h1 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.035em] text-[#122425] sm:text-6xl lg:text-[4.7rem]">
              Overview
            </h1>

            <div className="mt-5">
              <CurrentDate />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={refreshDashboard}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-[#122425]/10 bg-white/70 px-5 py-3.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#122425]/60 transition hover:border-[#c9a96a]/50 hover:text-[#122425] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                strokeWidth={1.5}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              to="/admin/events"
              className="group inline-flex items-center gap-3 rounded-full bg-[#122425] px-6 py-3.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#eee8dd] transition duration-300 hover:bg-[#1f3234]"
            >
              + Create Event
              <ArrowUpRight
                size={14}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          PLATFORM SNAPSHOT
          Event totals are currently backed by Events API. Commerce
          aggregates are intentionally deferred to Analytics until
          aggregate endpoints are available.
      ========================================================= */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#122425]/10 bg-white/70 p-6">
          <div className="flex items-start justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#122425]/40">
              Total experiences
            </p>
            <CalendarDays
              size={18}
              strokeWidth={1.4}
              className="text-[#b48643]"
            />
          </div>
          <p className="mt-6 font-serif text-4xl text-[#122425]">
            {eventStatsLoading ? "—" : totalEventCount}
          </p>
          <p className="mt-2 text-xs leading-5 text-[#122425]/45">
            All experiences in the platform.
          </p>
        </div>

        <div className="rounded-2xl border border-[#122425]/10 bg-white/70 p-6">
          <div className="flex items-start justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#122425]/40">
              Tickets sold
            </p>
            <Ticket size={18} strokeWidth={1.4} className="text-[#b48643]" />
          </div>
          <p className="mt-6 font-serif text-4xl text-[#122425]">—</p>
          <p className="mt-2 text-xs leading-5 text-[#122425]/45">
            Awaiting the Analytics aggregate.
          </p>
        </div>

        <div className="rounded-2xl border border-[#122425]/10 bg-white/70 p-6">
          <div className="flex items-start justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#122425]/40">
              Orders
            </p>
            <ShoppingBag
              size={18}
              strokeWidth={1.4}
              className="text-[#b48643]"
            />
          </div>
          <p className="mt-6 font-serif text-4xl text-[#122425]">
            {ordersLoading ? "—" : (orderMeta?.total ?? 0)}
          </p>
          <p className="mt-2 text-xs leading-5 text-[#122425]/45">
            Orders currently visible to administration.
          </p>
        </div>

        <div className="rounded-2xl border border-[#122425]/10 bg-white/70 p-6">
          <div className="flex items-start justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#122425]/40">
              Attendees
            </p>
            <Users size={18} strokeWidth={1.4} className="text-[#b48643]" />
          </div>
          <p className="mt-6 font-serif text-4xl text-[#122425]">—</p>
          <p className="mt-2 text-xs leading-5 text-[#122425]/45">
            Awaiting the Attendees aggregate.
          </p>
        </div>
      </section>

      {/* =========================================================
          NEXT EXPERIENCE + TICKET ACTIVITY
      ========================================================= */}
      <section className="grid gap-5 xl:grid-cols-[1.55fr_0.65fr]">
        <div>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]/75">
                The calendar
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.02em] text-[#122425] sm:text-4xl">
                The next experience
              </h2>
            </div>
            <Link
              to="/admin/events"
              className="hidden items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#122425]/50 transition hover:text-[#122425] sm:inline-flex"
            >
              All events
              <ArrowUpRight size={14} strokeWidth={1.5} />
            </Link>
          </div>

          {eventsLoading && (
            <div className="h-[420px] animate-pulse rounded-[2rem] bg-[#e9e1d5]" />
          )}

          {!eventsLoading && eventsError && (
            <div className="rounded-[2rem] bg-[#12100d] px-6 py-16 text-center">
              <RefreshCw
                size={27}
                strokeWidth={1.3}
                className="mx-auto text-[#c9a96a]/70"
              />
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]/70">
                Platform data
              </p>
              <h3 className="mt-3 font-serif text-3xl text-[#f3eee5]">
                We couldn&apos;t refresh the experiences.
              </h3>
              <button
                type="button"
                onClick={refetchEvents}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#e9dfcf] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#17130e] transition hover:bg-[#f3eee5]"
              >
                <RefreshCw size={14} strokeWidth={1.5} />
                Try Again
              </button>
            </div>
          )}

          {!eventsLoading && !eventsError && featuredEvent && (
            <article className="group overflow-hidden rounded-[2rem] bg-[#12100d]">
              <div className="grid lg:grid-cols-[1.18fr_0.82fr]">
                <div className="relative min-h-[360px] overflow-hidden lg:min-h-[430px]">
                  {featuredEvent.bannerImageUrl ? (
                    <img
                      src={featuredEvent.bannerImageUrl}
                      alt={featuredEvent.title}
                      className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#302a20] via-[#1b1814] to-[#0e0d0b]">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-serif text-7xl italic text-[#c9a96a]/20 sm:text-8xl">
                          Solaís
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  <div className="absolute left-6 top-6">
                    <EventStatusBadge status={featuredEvent.status} />
                  </div>

                  <div className="absolute bottom-7 left-7 right-7">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]">
                      {upcomingEvents.length > 0
                        ? "Next experience"
                        : "Featured experience"}
                    </p>
                    <h3 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-[#f3eee5] sm:text-5xl">
                      {featuredEvent.title}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col justify-between p-7 sm:p-9 lg:p-10">
                  <div>
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]/75">
                          Experience details
                        </p>
                        <p className="mt-4 font-serif text-3xl italic text-[#f3eee5]">
                          {formatLongDate(featuredEvent.startDate)}
                        </p>
                      </div>
                      <CalendarDays
                        size={22}
                        strokeWidth={1.3}
                        className="shrink-0 text-[#c9a96a]"
                      />
                    </div>

                    <div className="mt-8 space-y-5 border-t border-white/10 pt-7">
                      <div className="flex items-start gap-4">
                        <Clock3
                          size={17}
                          strokeWidth={1.4}
                          className="mt-0.5 shrink-0 text-[#c9a96a]"
                        />
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#918879]">
                            Time
                          </p>
                          <p className="mt-1 text-sm text-[#d8d0c4]">
                            {formatTime(featuredEvent.startDate)} –{" "}
                            {formatTime(featuredEvent.endDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <MapPin
                          size={17}
                          strokeWidth={1.4}
                          className="mt-0.5 shrink-0 text-[#c9a96a]"
                        />
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#918879]">
                            Location
                          </p>
                          <p className="mt-1 text-sm text-[#d8d0c4]">
                            {featuredEvent.venue}
                          </p>
                          <p className="mt-0.5 text-xs text-[#918879]">
                            {featuredEvent.city}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <Users
                          size={17}
                          strokeWidth={1.4}
                          className="mt-0.5 shrink-0 text-[#c9a96a]"
                        />
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#918879]">
                            Capacity
                          </p>
                          <p className="mt-1 text-sm text-[#d8d0c4]">
                            {featuredEvent.capacity
                              ? `${featuredEvent.capacity.toLocaleString()} guests`
                              : "Capacity not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10">
                    {featuredEvent.capacity && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.18em]">
                          <span className="text-[#918879]">
                            Capacity planning
                          </span>
                          <span className="text-[#c9a96a]">
                            {featuredEvent.capacity.toLocaleString()} places
                          </span>
                        </div>
                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-[#c9a96a]"
                            style={{
                              width: `${getEventProgress(featuredEvent)}%`,
                            }}
                          />
                        </div>
                        <p className="mt-2 text-[10px] text-[#918879]">
                          Ticket sales will appear here once ticket inventory
                          analytics are connected.
                        </p>
                      </div>
                    )}

                    <Link
                      to="/admin/events"
                      className="group flex items-center justify-between rounded-full border border-white/10 px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#eee8dd] transition hover:border-[#c9a96a]/50 hover:text-[#f3eee5]"
                    >
                      Manage experience
                      <ArrowUpRight
                        size={15}
                        strokeWidth={1.5}
                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )}

          {!eventsLoading && !eventsError && !featuredEvent && (
            <div className="rounded-[2rem] bg-[#12100d] px-6 py-20 text-center">
              <CalendarDays
                size={28}
                strokeWidth={1.3}
                className="mx-auto text-[#c9a96a]/70"
              />
              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]/70">
                Your calendar is ready
              </p>
              <h3 className="mt-3 font-serif text-4xl text-[#f3eee5]">
                Create your first experience.
              </h3>
              <Link
                to="/admin/events"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#e9dfcf] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#17130e] transition hover:bg-[#f3eee5]"
              >
                Manage Events
                <ArrowUpRight size={15} strokeWidth={1.5} />
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-[2rem] bg-[#122425] p-6 text-[#eee8dd] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]">
                Ticket activity
              </p>
              <h2 className="mt-2 font-serif text-3xl italic">
                Live order pulse
              </h2>
            </div>
            <Ticket size={21} strokeWidth={1.3} className="text-[#c9a96a]" />
          </div>

          {ordersLoading ? (
            <div className="mt-9 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`ticket-pulse-skeleton-${index}`}
                  className="h-16 animate-pulse rounded-2xl bg-white/[0.06]"
                />
              ))}
            </div>
          ) : ordersError ? (
            <div className="mt-9 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-[#d8d0c4]">
                Ticket activity is temporarily unavailable.
              </p>
              <button
                type="button"
                onClick={refetchOrders}
                className="mt-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#c9a96a]"
              >
                Try again →
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#918879]">
                  Paid orders in view
                </p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <span className="font-serif text-3xl text-[#f3eee5]">
                    {paidOrders.length}
                  </span>
                  <span className="text-[10px] text-[#918879]">
                    {paidTicketUnits} ticket units
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#918879]">
                  Pending orders
                </p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <span className="font-serif text-3xl text-[#f3eee5]">
                    {pendingOrders.length}
                  </span>
                  <span className="text-[10px] text-[#918879]">
                    awaiting payment
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#918879]">
                  Order activity
                </p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <span className="font-serif text-3xl text-[#f3eee5]">
                    {orders.length}
                  </span>
                  <span className="text-[10px] text-[#918879]">
                    latest records
                  </span>
                </div>
              </div>

              <Link
                to="/admin/tickets"
                className="group mt-2 flex items-center justify-between border-t border-white/10 pt-6 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#c9a96a]"
              >
                View ticket management
                <ArrowUpRight
                  size={14}
                  strokeWidth={1.5}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          RECENT ORDERS + EVENT PERFORMANCE
          The performance panel uses real order activity only. Full
          sales-performance aggregates belong to Analytics.
      ========================================================= */}
      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[2rem] border border-[#122425]/10 bg-white/70 p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]/75">
                Commerce
              </p>
              <h2 className="mt-2 font-serif text-3xl text-[#122425]">
                Recent orders
              </h2>
            </div>
            <Link
              to="/admin/orders"
              className="hidden items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#122425]/50 transition hover:text-[#122425] sm:inline-flex"
            >
              View all
              <ArrowUpRight size={13} strokeWidth={1.5} />
            </Link>
          </div>

          {ordersLoading && (
            <div className="mt-7 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`order-skeleton-${index}`}
                  className="h-14 animate-pulse rounded-xl bg-[#e8dfd2]"
                />
              ))}
            </div>
          )}

          {!ordersLoading && ordersError && (
            <div className="mt-7 rounded-2xl bg-[#f0e8dc] p-6">
              <p className="font-serif text-2xl text-[#122425]">
                Order activity couldn&apos;t be loaded.
              </p>
              <button
                type="button"
                onClick={refetchOrders}
                className="mt-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8d6937]"
              >
                Try again →
              </button>
            </div>
          )}

          {!ordersLoading && !ordersError && recentOrders.length > 0 && (
            <div className="mt-7 divide-y divide-[#122425]/10">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to="/admin/orders"
                  className="group grid grid-cols-[1fr_auto] gap-4 py-4 first:pt-0 sm:grid-cols-[1.2fr_1fr_auto_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-[#122425]">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#122425]/45">
                      {order.items.length} ticket type
                      {order.items.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="hidden min-w-0 sm:block">
                    <p className="truncate text-xs text-[#122425]/60">
                      Event {order.eventId.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-[10px] text-[#122425]/35">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <OrderStatusBadge status={order.status} />

                  <div className="text-right">
                    <p className="font-serif text-lg text-[#122425]">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <ArrowUpRight
                      size={13}
                      strokeWidth={1.5}
                      className="ml-auto mt-1 text-[#122425]/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#b48643]"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!ordersLoading && !ordersError && recentOrders.length === 0 && (
            <div className="mt-7 rounded-2xl bg-[#f0e8dc] px-6 py-12 text-center">
              <ShoppingBag
                size={23}
                strokeWidth={1.3}
                className="mx-auto text-[#b48643]/70"
              />
              <p className="mt-4 font-serif text-2xl text-[#122425]">
                No orders yet.
              </p>
              <p className="mt-2 text-xs leading-5 text-[#122425]/45">
                Purchases will appear here as attendees place orders.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-[#122425]/10 bg-white/70 p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]/75">
                Analytics preview
              </p>
              <h2 className="mt-2 font-serif text-3xl text-[#122425]">
                Event performance
              </h2>
            </div>
            <Link
              to="/admin/analytics"
              className="hidden text-[9px] font-semibold uppercase tracking-[0.18em] text-[#122425]/50 transition hover:text-[#122425] sm:block"
            >
              Analytics →
            </Link>
          </div>

          {eventOrderActivity.length > 0 ? (
            <div className="mt-8 space-y-5">
              {eventOrderActivity.slice(0, 4).map((item) => {
                if (!item.event) {
                  return null;
                }

                const width = `${Math.max(
                  8,
                  Math.round((item.tickets / maxEventTicketActivity) * 100),
                )}%`;

                return (
                  <div key={item.eventId}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <EventThumbnail event={item.event} />
                        <div className="min-w-0">
                          <p className="truncate font-serif text-lg text-[#122425]">
                            {item.event.title}
                          </p>
                          <p className="mt-1 text-[10px] text-[#122425]/40">
                            {item.orders} order{item.orders === 1 ? "" : "s"} in
                            current view
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 font-serif text-xl text-[#122425]">
                        {item.tickets}
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#122425]/8">
                      <div
                        className="h-full rounded-full bg-[#c9a96a] transition-all duration-700"
                        style={{ width }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-[#122425]/10 pt-5">
                <p className="text-[10px] leading-5 text-[#122425]/40">
                  This preview reflects current order activity. Full
                  ticket-sales, revenue and attendance performance will be
                  powered by Analytics.
                </p>
                <Link
                  to="/admin/analytics"
                  className="mt-4 inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8d6937]"
                >
                  Open detailed analytics
                  <ArrowUpRight size={13} strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-[#f0e8dc] px-5 py-12 text-center">
              <FileText
                size={23}
                strokeWidth={1.3}
                className="mx-auto text-[#b48643]/70"
              />
              <p className="mt-4 font-serif text-2xl text-[#122425]">
                Performance will appear here.
              </p>
              <p className="mt-2 text-xs leading-5 text-[#122425]/45">
                Analytics will turn ticket, order and attendance data into a
                complete performance view.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          EVENT PORTFOLIO + STATUS
      ========================================================= */}
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[2rem] border border-[#122425]/10 bg-white/70 p-6 sm:p-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]/75">
                Event portfolio
              </p>
              <h2 className="mt-2 font-serif text-3xl text-[#122425]">
                Recent experiences
              </h2>
            </div>
            <Link
              to="/admin/events"
              className="hidden items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#122425]/50 transition hover:text-[#122425] sm:inline-flex"
            >
              View all
              <ArrowUpRight size={13} strokeWidth={1.5} />
            </Link>
          </div>

          <div className="mt-7 divide-y divide-[#122425]/10">
            {eventsLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`recent-event-skeleton-${index}`}
                  className="flex animate-pulse items-center gap-4 py-5 first:pt-0"
                >
                  <div className="h-20 w-24 rounded-xl bg-[#e8dfd2]" />
                  <div className="flex-1">
                    <div className="h-4 w-1/2 rounded bg-[#e8dfd2]" />
                    <div className="mt-3 h-3 w-1/3 rounded bg-[#e8dfd2]" />
                  </div>
                </div>
              ))}

            {!eventsLoading &&
              recentEvents.map((event) => (
                <Link
                  key={event.id}
                  to="/admin/events"
                  className="group flex gap-4 py-5 first:pt-0"
                >
                  <EventThumbnail event={event} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate font-serif text-xl text-[#122425] transition group-hover:text-[#8d6937]">
                          {event.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[#122425]/45">
                          <span>{formatDate(event.startDate)}</span>
                          <span className="hidden h-1 w-1 rounded-full bg-[#122425]/20 sm:block" />
                          <span className="truncate">
                            {event.venue}, {event.city}
                          </span>
                        </div>
                      </div>
                      <EventStatusBadge status={event.status} />
                    </div>
                  </div>
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.4}
                    className="mt-1 hidden shrink-0 text-[#122425]/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#b48643] sm:block"
                  />
                </Link>
              ))}

            {!eventsLoading && recentEvents.length === 0 && (
              <div className="py-12 text-center">
                <CalendarDays
                  size={23}
                  strokeWidth={1.3}
                  className="mx-auto text-[#b48643]/70"
                />
                <p className="mt-4 font-serif text-2xl text-[#122425]">
                  No experiences yet.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] bg-[#122425] p-6 text-[#eee8dd] sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]">
            Event pulse
          </p>
          <h2 className="mt-2 font-serif text-3xl italic">
            Where things stand
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#918879]">
            A live snapshot of the event portfolio currently visible to
            administration.
          </p>

          <div className="mt-8 space-y-3">
            {[
              {
                label: "Published",
                value: eventStatsLoading ? "—" : publishedEventCount,
                icon: CheckCircle2,
                description: "Live experiences",
              },
              {
                label: "Drafts",
                value: eventStatsLoading ? "—" : draftEventCount,
                icon: Clock3,
                description: "Still being prepared",
              },
              {
                label: "Completed",
                value: eventStatsLoading ? "—" : completedEventCount,
                icon: CalendarDays,
                description: "Past experiences",
              },
              {
                label: "Cancelled",
                value: eventStatsLoading ? "—" : cancelledEventCount,
                icon: CalendarDays,
                description: "No longer active",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c9a96a]/10">
                      <Icon
                        size={16}
                        strokeWidth={1.4}
                        className="text-[#c9a96a]"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-[#eee8dd]">{item.label}</p>
                      <p className="mt-0.5 text-[10px] text-[#918879]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <span className="font-serif text-2xl text-[#f3eee5]">
                    {eventsLoading ? "—" : item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          QUICK ACTIONS
      ========================================================= */}
      <section>
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]/75">
            Quick actions
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#122425] sm:text-4xl">
            Move through the platform
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            to="/admin/events"
            className="group rounded-2xl bg-[#12100d] p-6 text-[#eee8dd] transition duration-300 hover:-translate-y-0.5"
          >
            <CalendarDays
              size={20}
              strokeWidth={1.4}
              className="text-[#c9a96a]"
            />
            <div className="mt-10 flex items-end justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl">Create Event</h3>
                <p className="mt-2 text-xs leading-5 text-[#918879]">
                  Start a new experience.
                </p>
              </div>
              <ArrowUpRight size={17} strokeWidth={1.4} />
            </div>
          </Link>

          <Link
            to="/admin/tickets"
            className="group rounded-2xl border border-[#122425]/10 bg-white/70 p-6 transition duration-300 hover:-translate-y-0.5 hover:bg-white"
          >
            <Ticket size={20} strokeWidth={1.4} className="text-[#b48643]" />
            <div className="mt-10 flex items-end justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl text-[#122425]">
                  Manage Tickets
                </h3>
                <p className="mt-2 text-xs leading-5 text-[#122425]/45">
                  Configure ticket types and inventory.
                </p>
              </div>
              <ArrowUpRight
                size={17}
                strokeWidth={1.4}
                className="text-[#122425]/45"
              />
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="group rounded-2xl border border-[#122425]/10 bg-white/70 p-6 transition duration-300 hover:-translate-y-0.5 hover:bg-white"
          >
            <ShoppingBag
              size={20}
              strokeWidth={1.4}
              className="text-[#b48643]"
            />
            <div className="mt-10 flex items-end justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl text-[#122425]">
                  View Orders
                </h3>
                <p className="mt-2 text-xs leading-5 text-[#122425]/45">
                  Review purchases and order activity.
                </p>
              </div>
              <ArrowUpRight
                size={17}
                strokeWidth={1.4}
                className="text-[#122425]/45"
              />
            </div>
          </Link>

          <Link
            to="/admin/attendees"
            className="group rounded-2xl border border-[#122425]/10 bg-[#e9e3d8] p-6 transition duration-300 hover:-translate-y-0.5"
          >
            <Users size={20} strokeWidth={1.4} className="text-[#b48643]" />
            <div className="mt-10 flex items-end justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl text-[#122425]">
                  Attendees
                </h3>
                <p className="mt-2 text-xs leading-5 text-[#122425]/50">
                  Manage guest accounts and attendance.
                </p>
              </div>
              <ArrowUpRight
                size={17}
                strokeWidth={1.4}
                className="text-[#122425]/45"
              />
            </div>
          </Link>
        </div>
      </section>

      {hasDataError && (
        <div className="rounded-2xl border border-[#c9a96a]/20 bg-[#c9a96a]/8 px-5 py-4 text-xs leading-6 text-[#6f5834]">
          Some dashboard data could not be refreshed. The sections with
          available data remain visible. Use the refresh control above to try
          again.
        </div>
      )}
    </div>
  );
}
