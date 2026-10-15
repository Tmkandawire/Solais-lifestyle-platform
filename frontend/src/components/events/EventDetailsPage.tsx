import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PiArrowLeftBold,
  PiCalendarBlankBold,
  PiClockBold,
  PiMapPinBold,
  PiUsersThreeBold,
} from "react-icons/pi";

import { getEventById } from "../../api/event.api";
import type { Event } from "../../types/event";

import TicketSelectionCard from "./TicketSelectionCard";
import type { SelectedTicket } from "./TicketSelectionCard";

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

interface MetaItemProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
}

function MetaItem({ icon: Icon, value }: MetaItemProps) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-white/70">
      <Icon className="text-base text-[#C99A5B]" />
      {value}
    </span>
  );
}

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bumped by the "Try Again" button to trigger a refetch. Using a
  // dependency the effect reacts to (rather than calling an externally
  // defined loadEvent() from inside the effect) keeps every setState
  // call for this fetch inside the effect's own nested async function —
  // required to satisfy react-hooks/set-state-in-effect, since the
  // linter traces into closures defined in this component and flags
  // any synchronous setState reachable from the effect body, including
  // through a referenced useCallback.
  const [reloadToken, setReloadToken] = useState(0);

  const latestRequestId = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function loadEvent() {
      if (!id) {
        if (!cancelled) {
          setError("No event was specified.");
          setEvent(null);
          setLoading(false);
        }
        return;
      }

      const requestId = ++latestRequestId.current;

      if (!cancelled) {
        setLoading(true);
        setError(null);
      }

      try {
        const result = await getEventById(id);

        if (cancelled || requestId !== latestRequestId.current) {
          return;
        }

        setEvent(result);
      } catch (err) {
        if (cancelled || requestId !== latestRequestId.current) {
          return;
        }

        setEvent(null);
        setError(
          err instanceof Error ? err.message : "Failed to load this event.",
        );
      } finally {
        if (!cancelled && requestId === latestRequestId.current) {
          setLoading(false);
        }
      }
    }

    void loadEvent();

    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F5F0] px-6 py-24">
        <div className="mx-auto max-w-[1450px] animate-pulse">
          <div className="h-4 w-32 rounded bg-[#E5D8C8]" />

          <div className="mt-8 h-20 max-w-3xl rounded bg-[#E5D8C8]" />

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.35fr_.65fr]">
            <div className="h-[600px] rounded-[40px] bg-[#E5D8C8]" />

            <div className="space-y-6">
              <div className="h-24 rounded bg-[#E5D8C8]" />
              <div className="h-24 rounded bg-[#E5D8C8]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F5F0] px-6 py-24">
        <div className="max-w-xl text-center">
          <p className="text-xs uppercase tracking-[0.45em] text-[#C99A5B]">
            EVENT UNAVAILABLE
          </p>

          <h1
            className="mt-5 text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(3rem, 6vw, 4.75rem)",
            }}
          >
            We couldn't load this experience.
          </h1>

          <p className="mt-6 leading-8 text-[#626262]">
            {error ??
              "The event you're looking for could not be found or is no longer available."}
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => setReloadToken((token) => token + 1)}
              className="rounded-full bg-[#162425] px-8 py-4 text-sm uppercase tracking-[0.3em] text-white transition hover:bg-[#263839]"
            >
              Try Again
            </button>

            <Link
              to="/events"
              className="rounded-full border border-[#DCCFBE] px-8 py-4 text-sm uppercase tracking-[0.3em] text-[#162425] transition hover:border-[#C99A5B]"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const hasBannerImage = Boolean(event.bannerImageUrl);

  const handleContinueToOrder = (selections: SelectedTicket[]) => {
    navigate(`/events/${event.id}/order-summary`, { state: { selections } });
  };

  return (
    <main className="bg-[#F8F5F0]">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#162425] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,154,91,.18),transparent_55%)]" />

        <div className="relative mx-auto max-w-[1450px] px-6 pb-16 pt-28 sm:px-8 sm:pt-36 lg:px-12 lg:pb-20">
          <button
            type="button"
            onClick={() => navigate("/events")}
            className="group mb-12 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:text-[#C99A5B]"
          >
            <PiArrowLeftBold className="transition group-hover:-translate-x-1" />
            Back to Events
          </button>

          <div className="max-w-5xl">
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
              {event.status}
            </p>

            <h1
              className="leading-[0.95]"
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: "clamp(4rem, 9vw, 8rem)",
              }}
            >
              {event.title}
            </h1>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              <MetaItem
                icon={PiCalendarBlankBold}
                value={formatDate(event.startDate)}
              />
              <MetaItem
                icon={PiClockBold}
                value={`${formatTime(event.startDate)} – ${formatTime(event.endDate)}`}
              />
              <MetaItem
                icon={PiMapPinBold}
                value={`${event.venue}, ${event.city}`}
              />
            </div>

            <p className="mt-8 max-w-3xl text-base leading-8 text-white/70 sm:text-lg sm:leading-9">
              {event.description}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          EVENT CONTENT
      ===================================================== */}

      <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,154,91,.05),transparent_70%)]" />

        <div className="relative mx-auto max-w-[1450px] px-6 sm:px-8 lg:px-12">
          <div className="grid items-start gap-12 lg:grid-cols-[1.35fr_.65fr] lg:gap-20">
            {/* =================================================
                EVENT IMAGE
            ================================================= */}

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="overflow-hidden rounded-[32px] border border-[#E6D8C7] bg-[#E8DED0] shadow-[0_45px_120px_rgba(0,0,0,.08)] lg:rounded-[46px]"
            >
              <div className="relative aspect-[4/3]">
                {hasBannerImage ? (
                  <img
                    src={event.bannerImageUrl ?? undefined}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F0E5D6] via-[#DFCFBA] to-[#C7AF93]" />

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.35),transparent_65%)]" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="text-center text-[#162425]/20"
                        style={{
                          fontFamily: "Cormorant Garamond",
                          fontSize: "clamp(4rem,10vw,8rem)",
                        }}
                      >
                        Solaís
                      </span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* =================================================
                EVENT DETAILS + TICKETING
            ================================================= */}

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <p className="text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
                EVENT DETAILS
              </p>

              <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#E8DDD0] bg-white px-5 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F8F2E8]">
                  <PiUsersThreeBold className="text-xl text-[#C99A5B]" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#8A8A8A]">
                    Capacity
                  </p>

                  <p className="mt-1 text-base text-[#162425] sm:text-lg">
                    {event.capacity !== null
                      ? `${event.capacity} guests`
                      : "Limited availability"}
                  </p>
                </div>
              </div>

              {/* Per-ticket-type availability lives inside the ticketing
                  card below — it's the accurate figure, since it reflects
                  actual remaining inventory per type rather than the
                  event's overall capacity. */}

              <TicketSelectionCard
                eventId={event.id}
                onContinue={handleContinueToOrder}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CLOSING CTA
      ===================================================== */}

      <section className="bg-[#162425] px-6 py-20 text-center text-white sm:py-24 lg:py-32">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-5">
            <div className="h-px w-20 bg-white/20" />
            <span className="text-[#C99A5B]">☼</span>
            <div className="h-px w-20 bg-white/20" />
          </div>
        </div>

        <p className="text-xs uppercase tracking-[0.45em] text-[#C99A5B]">
          SOLAÍS
        </p>

        <h2
          className="mt-5"
          style={{
            fontFamily: "Cormorant Garamond",
            fontSize: "clamp(3rem, 6vw, 5rem)",
          }}
        >
          More than an event.
          <br />
          An experience.
        </h2>

        <Link
          to="/events"
          className="mt-10 inline-flex items-center gap-3 rounded-full border border-white/20 px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:border-[#C99A5B] hover:text-[#C99A5B]"
        >
          Explore More Events
          <PiArrowLeftBold className="rotate-180" />
        </Link>
      </section>
    </main>
  );
}
