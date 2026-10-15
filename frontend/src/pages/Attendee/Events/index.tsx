import { CalendarDays, MapPin, ArrowUpRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

import { useEvents } from "../../../hooks/useEvents";

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

export default function AttendeeEventsPage() {
  const { events, loading, error, refetch } = useEvents({
    page: 1,
    limit: 6,
  });

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
          My Events
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--attendee-text-muted)]">
          Discover upcoming SOLAÍS experiences and keep track of the events
          you're attending.
        </p>
      </section>

      {/* =========================================================
          EVENT LIST
      ========================================================= */}
      <section>
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c9a96a]/70">
              Upcoming Experiences
            </p>

            <h2 className="mt-2 font-serif text-3xl tracking-[-0.01em] text-[var(--attendee-text)] sm:text-4xl">
              What's coming up
            </h2>
          </div>

          {!loading && !error && events.length > 0 && (
            <span className="hidden text-xs text-[var(--attendee-text-muted)] sm:block">
              {events.length}{" "}
              {events.length === 1 ? "experience" : "experiences"}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`event-skeleton-${index}`}
                className="h-[520px] animate-pulse rounded-2xl border border-[var(--attendee-border)] bg-[var(--attendee-surface-muted)]"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-[#122425]/10 bg-[#12100d] px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a96a]/20 bg-[#c9a96a]/5">
              <CalendarDays
                size={24}
                strokeWidth={1.3}
                className="text-[#c9a96a]/70"
              />
            </div>

            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]/70">
              EVENTS
            </p>

            <h3 className="mt-3 font-serif text-3xl text-[#f3eee5]">
              We couldn't load the experiences.
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#918879]">
              Something went wrong while retrieving the latest SOLAÍS events.
              Please try again.
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
        {!loading && !error && events.length === 0 && (
          <div className="rounded-2xl border border-[#122425]/10 bg-[#12100d] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a96a]/20 bg-[#c9a96a]/5">
              <CalendarDays
                size={24}
                strokeWidth={1.3}
                className="text-[#c9a96a]/70"
              />
            </div>

            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]/70">
              COMING SOON
            </p>

            <h3 className="mt-3 font-serif text-3xl text-[#f3eee5]">
              New experiences are being prepared.
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#918879]">
              Check back soon for upcoming SOLAÍS experiences and invitations.
            </p>

            <Link
              to="/events"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#e9dfcf] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#17130e] transition hover:bg-[#f3eee5]"
            >
              Explore SOLAÍS
              <ArrowUpRight size={15} strokeWidth={1.5} />
            </Link>
          </div>
        )}

        {/* Events */}
        {!loading && !error && events.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="group overflow-hidden rounded-2xl border border-[#122425]/10 bg-[#12100d]"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#ebe4d8]">
                  {event.bannerImageUrl ? (
                    <img
                      src={event.bannerImageUrl}
                      alt={event.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#e9dfcf] via-[#d8cbb8] to-[#b9a78e]">
                      <span className="font-serif text-5xl text-[#122425]/20">
                        Solaís
                      </span>
                    </div>
                  )}

                  <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-[#122425]/80 px-4 py-2 backdrop-blur-sm">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#eee8dd]">
                      {event.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-serif text-3xl leading-tight text-[#f3eee5]">
                    {event.title}
                  </h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#918879]">
                    {event.description}
                  </p>

                  <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
                    <div className="flex items-center gap-3">
                      <CalendarDays
                        size={17}
                        strokeWidth={1.4}
                        className="shrink-0 text-[#c9a96a]"
                      />

                      <span className="text-xs text-[#d8d0c4]">
                        {formatDate(event.startDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <CalendarDays
                        size={17}
                        strokeWidth={1.4}
                        className="shrink-0 text-[#c9a96a]"
                      />

                      <span className="text-xs text-[#d8d0c4]">
                        {formatTime(event.startDate)} –{" "}
                        {formatTime(event.endDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin
                        size={17}
                        strokeWidth={1.4}
                        className="shrink-0 text-[#c9a96a]"
                      />

                      <span className="text-xs text-[#d8d0c4]">
                        {event.venue}, {event.city}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/account/events/${event.id}/tickets`}
                    className="mt-7 flex items-center justify-between rounded-full border border-white/10 px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#eee8dd] transition hover:border-[#c9a96a]/50 hover:text-[#e9dfcf]"
                  >
                    Choose Tickets
                    <ArrowUpRight size={15} strokeWidth={1.5} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
