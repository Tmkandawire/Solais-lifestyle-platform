import { useSyncExternalStore } from "react";
import { ArrowUpRight, CalendarDays, ShoppingBag, Ticket } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

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

function CurrentGreeting({ name }: { name: string }) {
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
    <>
      <h1 className="mt-3 font-serif text-5xl tracking-[-0.02em] text-[var(--attendee-text)] sm:text-6xl">
        {greeting}, {name}
      </h1>

      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#5f6663]">
        {formattedDate}
      </p>
    </>
  );
}

export default function AttendeeDashboard() {
  const { user, profile } = useAuth();

  return (
    <div className="space-y-14">
      {/* =========================================================
          PAGE INTRODUCTION
      ========================================================= */}
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]/70">
          SOLAÍS Lifestyle
        </p>

        <CurrentGreeting name={profile?.firstName?.trim() || "there"} />

        <p className="mt-5 max-w-xl text-sm leading-7 text-[#5f6663]">
          Your events, tickets, orders and SOLAÍS experiences — all in one
          place.
        </p>

        {user && (
          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-[#5f6663]">
            Member account · {user.role}
          </p>
        )}
      </section>

      {/* =========================================================
          QUICK STATISTICS
      ========================================================= */}
      <section className="grid gap-4 sm:grid-cols-3">
        <DashboardCard
          icon={CalendarDays}
          label="Upcoming Events"
          value="—"
          description="Your upcoming experiences"
          to="/account/events"
        />

        <DashboardCard
          icon={Ticket}
          label="Active Tickets"
          value="—"
          description="Tickets ready for your next event"
          to="/account/tickets"
        />

        <DashboardCard
          icon={ShoppingBag}
          label="Orders"
          value="—"
          description="Your SOLAÍS purchases"
          to="/account/orders"
        />
      </section>

      {/* =========================================================
          NEXT EXPERIENCE
      ========================================================= */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]/70">
              Next Experience
            </p>

            <h2 className="mt-2 font-serif text-3xl tracking-[-0.01em] text-[var(--attendee-text)] sm:text-4xl">
              Your next SOLAÍS event
            </h2>
          </div>

          <Link
            to="/events"
            className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a99f90] transition hover:text-[#e9dfcf] sm:flex"
          >
            Explore events
            <ArrowUpRight size={15} strokeWidth={1.4} />
          </Link>
        </div>

        <div className="rounded-2xl border border-[#c9a96a]/15 bg-[#12100d]">
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a96a]/20 bg-[#c9a96a]/5">
              <CalendarDays
                size={24}
                strokeWidth={1.3}
                className="text-[#c9a96a]/70"
              />
            </div>

            <h3 className="mt-6 font-serif text-3xl text-[#f3eee5]">
              Nothing booked yet
            </h3>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#918879]">
              Discover an upcoming SOLAÍS experience and reserve your place.
            </p>

            <Link
              to="/events"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#e9dfcf] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#17130e] transition hover:bg-[#f3eee5]"
            >
              Discover Events
              <ArrowUpRight size={15} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          RECENT ACTIVITY
      ========================================================= */}
      <section>
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]/70">
            Recent Activity
          </p>

          <h2 className="mt-2 font-serif text-3xl tracking-[-0.01em] text-[var(--attendee-text)] sm:text-4xl">
            Your activity
          </h2>
        </div>

        <div className="rounded-2xl border border-[#122425]/10 bg-[#12100d]">
          <div className="flex min-h-44 flex-col items-center justify-center px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c9a96a]/15 bg-[#c9a96a]/5">
              <ShoppingBag
                size={21}
                strokeWidth={1.3}
                className="text-[#c9a96a]/65"
              />
            </div>

            <p className="mt-4 text-sm text-[#918879]">
              Your SOLAÍS activity will appear here.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =============================================================
   DASHBOARD STAT CARD
============================================================= */

interface DashboardCardProps {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  description: string;
  to: string;
}

function DashboardCard({
  icon: Icon,
  label,
  value,
  description,
  to,
}: DashboardCardProps) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-[#d8cdbd] bg-[#ebe4d8] p-7 transition-all duration-200 hover:border-[#c9a96a]/50 hover:bg-[#e6ddcf]"
    >
      <div className="flex items-start justify-between">
        <Icon
          size={22}
          strokeWidth={1.4}
          className="text-[#b48643] transition-colors group-hover:text-[#9d7135]"
        />

        <ArrowUpRight
          size={16}
          strokeWidth={1.4}
          className="text-[#806f59] transition-colors group-hover:text-[#b48643]"
        />
      </div>

      <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#4d5b59]">
        {label}
      </p>

      <p className="mt-2 font-serif text-4xl text-[var(--attendee-text)]">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-[#66706d]">{description}</p>
    </Link>
  );
}
