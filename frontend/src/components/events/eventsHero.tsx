import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import { PiCalendarBlankBold, PiMapPinBold } from "react-icons/pi";

import { useEvents } from "../../hooks/useEvents";

function formatEventDate(value: string): string {
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

export default function EventsHero() {
  const { events, loading, error } = useEvents({
    page: 1,
    limit: 1,
  });

  const featuredEvent = events[0] ?? null;

  return (
    <section className="relative overflow-hidden bg-[#F7F3ED]">
      {/* Ambient Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,154,91,.12),transparent_65%)]" />

      <div className="relative mx-auto max-w-[1650px] px-6 pt-32 pb-20 sm:px-8 md:pt-36 md:pb-24 lg:px-12 lg:pt-44 lg:pb-32">
        {/* Heading */}

        <motion.div
          initial={{
            opacity: 0,
            y: 50,
            filter: "blur(8px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.9,
          }}
          className="mx-auto max-w-5xl text-center"
        >
          <p className="mb-6 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
            UPCOMING EVENTS
          </p>

          <h1
            className="leading-none text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(3.2rem,7vw,7rem)",
            }}
          >
            Every invitation
            <br />
            <span className="italic text-[#C99A5B]">
              begins with possibility.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-[#626262] sm:text-lg sm:leading-9 lg:mt-12 lg:text-xl lg:leading-10">
            Discover beautifully curated experiences designed to inspire
            meaningful conversations, unforgettable evenings and lasting
            memories.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 lg:mt-16">
            <Link
              to="/contact"
              className="w-full rounded-full bg-[#162425] px-10 py-5 text-center text-sm uppercase tracking-[0.3em] text-white transition-all duration-500 hover:-translate-y-1 hover:bg-[#203536] sm:w-auto"
            >
              Reserve Your Place
            </Link>

            <Link
              to="/experiences"
              className="flex w-full items-center justify-center gap-3 rounded-full border border-[#D7C9B8] px-10 py-5 text-sm uppercase tracking-[0.3em] text-[#162425] transition-all duration-500 hover:border-[#C99A5B] sm:w-auto"
            >
              Explore Experiences
              <FaArrowRight />
            </Link>
          </div>
        </motion.div>

        {/* Featured Event */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.35,
            duration: 0.9,
          }}
          className="group relative mt-16 overflow-hidden rounded-[28px] border border-[#E5D8C7] shadow-[0_35px_90px_rgba(0,0,0,.08)] sm:mt-20 lg:mt-28 lg:rounded-[48px]"
        >
          <div className="relative h-[420px] overflow-hidden bg-gradient-to-br from-[#F0E4D5] via-[#E7D9C6] to-[#DDCDB8] sm:h-[520px] lg:h-[760px]">
            {/* Floating Glow */}

            <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#D6A969]/20 blur-[120px]" />

            <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-white/20 blur-[100px]" />

            {/* Luxury Pattern */}

            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "radial-gradient(circle,#C99A5B 1px,transparent 1px)",
                backgroundSize: "34px 34px",
              }}
            />

            {/* Loading State */}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute left-4 top-4 rounded-[24px] border border-white/40 bg-white/75 p-5 shadow-2xl backdrop-blur-xl sm:left-8 sm:top-8 sm:p-7 lg:left-14 lg:top-14 lg:rounded-[34px] lg:p-10"
              >
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#C99A5B] sm:text-xs">
                  Featured Event
                </p>

                <div className="mt-5 h-10 w-48 animate-pulse rounded bg-[#E5D8C8]" />

                <div className="mt-6 space-y-3">
                  <div className="h-5 w-44 animate-pulse rounded bg-[#E5D8C8]" />
                  <div className="h-5 w-52 animate-pulse rounded bg-[#E5D8C8]" />
                </div>
              </motion.div>
            )}

            {/* Error State */}

            {!loading && error && (
              <div className="absolute inset-0 flex items-center justify-center px-6">
                <div className="max-w-lg rounded-[28px] border border-white/40 bg-white/75 p-8 text-center shadow-2xl backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.4em] text-[#C99A5B]">
                    FEATURED EVENT
                  </p>

                  <h2
                    className="mt-4 text-[#162425]"
                    style={{
                      fontFamily: "Cormorant Garamond",
                      fontSize: "clamp(2rem,4vw,3.25rem)",
                    }}
                  >
                    We couldn't load the latest event.
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-[#626262]">
                    Please check back shortly to discover the latest Solaís
                    experience.
                  </p>
                </div>
              </div>
            )}

            {/* Empty State */}

            {!loading && !error && !featuredEvent && (
              <div className="absolute inset-0 flex items-center justify-center px-6">
                <div className="max-w-lg rounded-[28px] border border-white/40 bg-white/75 p-8 text-center shadow-2xl backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.4em] text-[#C99A5B]">
                    COMING SOON
                  </p>

                  <h2
                    className="mt-4 text-[#162425]"
                    style={{
                      fontFamily: "Cormorant Garamond",
                      fontSize: "clamp(2rem,4vw,3.25rem)",
                    }}
                  >
                    Something beautiful is coming.
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-[#626262]">
                    New experiences are being prepared. Check back soon to
                    discover what Solaís has planned.
                  </p>
                </div>
              </div>
            )}

            {/* Event Card */}

            {!loading && !error && featuredEvent && (
              <Link to={`/events/${featuredEvent.id}`} className="block">
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                  }}
                  className="absolute left-4 top-4 rounded-[24px] border border-white/40 bg-white/75 p-5 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:bg-white/85 sm:left-8 sm:top-8 sm:p-7 lg:left-14 lg:top-14 lg:rounded-[34px] lg:p-10"
                >
                  <p className="text-[10px] uppercase tracking-[0.4em] text-[#C99A5B] sm:text-xs">
                    Featured Event
                  </p>

                  <h2
                    className="mt-3 max-w-[320px] text-[#162425]"
                    style={{
                      fontFamily: "Cormorant Garamond",
                      fontSize: "clamp(2rem,4vw,3.75rem)",
                    }}
                  >
                    {featuredEvent.title}
                  </h2>

                  <div className="mt-6 space-y-3 sm:space-y-4 lg:mt-8 lg:space-y-5">
                    <div className="flex items-center gap-3 text-sm text-[#555] sm:text-base">
                      <PiCalendarBlankBold className="text-lg text-[#C99A5B] sm:text-xl" />
                      {formatEventDate(featuredEvent.startDate)}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-[#555] sm:text-base">
                      <PiMapPinBold className="text-lg text-[#C99A5B] sm:text-xl" />
                      {featuredEvent.venue}, {featuredEvent.city}
                    </div>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* Editorial Quote */}

            <motion.div
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
              }}
              className="absolute bottom-4 right-4 rounded-[22px] border border-white/40 bg-white/75 px-5 py-5 shadow-xl backdrop-blur-xl sm:bottom-8 sm:right-8 sm:px-7 sm:py-6 lg:bottom-16 lg:right-16 lg:rounded-[30px] lg:px-10 lg:py-8"
            >
              <p
                className="text-[#C99A5B]"
                style={{
                  fontFamily: "Cormorant Garamond",
                  fontSize: "clamp(1.5rem,2.5vw,2.5rem)",
                }}
              >
                Where unforgettable
              </p>

              <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-[#162425] sm:text-xs">
                Evenings Begin
              </p>
            </motion.div>

            {/* Center Branding */}

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <h2
                className="text-[#FFFFFF]/20"
                style={{
                  fontFamily: "Cormorant Garamond",
                  fontSize: "clamp(4rem,10vw,8rem)",
                }}
              >
                SOLAÍS
              </h2>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
