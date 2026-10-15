import { motion } from "framer-motion";
import {
  PiCalendarBlankBold,
  PiClockBold,
  PiMapPinBold,
  PiUsersThreeBold,
  PiTicketBold,
} from "react-icons/pi";
import { FaArrowRight } from "react-icons/fa6";
import { Link } from "react-router-dom";

import { useEvents } from "../../hooks/useEvents";

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

export default function FeaturedEvent() {
  const { events, loading, error } = useEvents({
    page: 1,
    limit: 6,
  });

  /*
   * The public events endpoint already returns published events
   * ordered by startDate ascending.
   *
   * For now, the first upcoming published event becomes the
   * featured experience.
   */
  const featuredEvent = events[0] ?? null;

  /*
   * -----------------------------------------------------------
   * LOADING STATE
   * -----------------------------------------------------------
   */

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-[#F8F4EE] py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,154,91,.05),transparent_70%)]" />

        <div className="relative mx-auto max-w-[1550px] px-6 sm:px-8 lg:px-12">
          <div className="mb-16 animate-pulse text-center sm:mb-20 lg:mb-24">
            <div className="mx-auto h-4 w-40 rounded bg-[#E5D8C8]" />

            <div className="mx-auto mt-6 h-20 max-w-2xl rounded bg-[#E5D8C8]" />

            <div className="mx-auto mt-6 h-16 max-w-3xl rounded bg-[#E5D8C8]" />
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[1.35fr_.65fr] lg:gap-20">
            <div className="h-[420px] animate-pulse rounded-[30px] bg-[#E5D8C8] sm:h-[560px] lg:h-[760px] lg:rounded-[46px]" />

            <div className="space-y-6">
              <div className="h-5 w-40 animate-pulse rounded bg-[#E5D8C8]" />
              <div className="h-28 animate-pulse rounded bg-[#E5D8C8]" />
              <div className="h-24 animate-pulse rounded bg-[#E5D8C8]" />
              <div className="h-20 animate-pulse rounded bg-[#E5D8C8]" />
              <div className="h-20 animate-pulse rounded bg-[#E5D8C8]" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  /*
   * -----------------------------------------------------------
   * ERROR STATE
   * -----------------------------------------------------------
   */

  if (error) {
    return (
      <section className="relative overflow-hidden bg-[#F8F4EE] py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,154,91,.05),transparent_70%)]" />

        <div className="relative mx-auto max-w-[900px] px-6 text-center sm:px-8 lg:px-12">
          <p className="text-xs uppercase tracking-[0.45em] text-[#C99A5B]">
            FEATURED EXPERIENCE
          </p>

          <h2
            className="mt-5 text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(3rem,6vw,4.75rem)",
            }}
          >
            We couldn't load the featured experience.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#626262]">
            Please check back shortly while we prepare the latest Solaís
            experiences.
          </p>
        </div>
      </section>
    );
  }

  /*
   * -----------------------------------------------------------
   * EMPTY STATE
   * -----------------------------------------------------------
   */

  if (!featuredEvent) {
    return (
      <section className="relative overflow-hidden bg-[#F8F4EE] py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,154,91,.05),transparent_70%)]" />

        <div className="relative mx-auto max-w-[900px] px-6 text-center sm:px-8 lg:px-12">
          <p className="text-xs uppercase tracking-[0.45em] text-[#C99A5B]">
            FEATURED EXPERIENCE
          </p>

          <h2
            className="mt-5 text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(3rem,6vw,4.75rem)",
            }}
          >
            Something beautiful is coming.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#626262] sm:text-lg sm:leading-9">
            New experiences are being prepared. Check back soon to discover what
            Solaís has planned.
          </p>

          <div className="mt-10 flex justify-center">
            <div className="flex items-center gap-5">
              <div className="h-px w-20 bg-[#DCCDB8]" />

              <span className="text-[#C99A5B]">☼</span>

              <div className="h-px w-20 bg-[#DCCDB8]" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const hasBannerImage = Boolean(featuredEvent.bannerImageUrl);

  return (
    <section className="relative overflow-hidden bg-[#F8F4EE] py-20 sm:py-24 lg:py-32">
      {/* Ambient Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,154,91,.05),transparent_70%)]" />

      <div className="relative mx-auto max-w-[1550px] px-6 sm:px-8 lg:px-12">
        {/* Heading */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
            filter: "blur(8px)",
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center sm:mb-20 lg:mb-24"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
            FEATURED EXPERIENCE
          </p>

          <h2
            className="text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(3rem,6vw,4.75rem)",
            }}
          >
            {featuredEvent.title}
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#626262] sm:text-lg sm:leading-9 lg:mt-8 lg:text-xl lg:leading-10">
            {featuredEvent.description}
          </p>
        </motion.div>

        {/* Editorial Layout */}

        <div className="grid items-center gap-12 lg:grid-cols-[1.35fr_.65fr] lg:gap-20">
          {/* Photography */}

          <motion.div
            whileHover={{
              scale: 1.015,
            }}
            transition={{
              duration: 0.7,
            }}
            className="group relative overflow-hidden rounded-[30px] border border-[#E6D8C7] bg-[#E8DED0] shadow-[0_45px_120px_rgba(0,0,0,.08)] lg:rounded-[46px]"
          >
            <div className="relative h-[420px] overflow-hidden sm:h-[560px] lg:h-[760px]">
              {hasBannerImage ? (
                <motion.img
                  animate={{
                    scale: [1, 1.04, 1],
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                  }}
                  src={featuredEvent.bannerImageUrl ?? undefined}
                  alt={featuredEvent.title}
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

              {/* Glow */}

              <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-[#D5A966]/20 blur-[120px]" />

              <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-white/20 blur-[120px]" />

              {/* Pattern */}

              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle,#C99A5B 1px,transparent 1px)",
                  backgroundSize: "36px 36px",
                }}
              />
            </div>
          </motion.div>

          {/* Event Details */}

          <motion.div
            initial={{
              opacity: 0,
              x: 40,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
            }}
          >
            <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
              EVENT OVERVIEW
            </p>

            <h3
              className="mb-6 text-[#162425] lg:mb-8"
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: "clamp(2.4rem,4vw,3.625rem)",
              }}
            >
              An experience
              <br />
              worth remembering.
            </h3>

            <div className="mb-8 h-px w-28 bg-gradient-to-r from-[#C99A5B] to-transparent lg:mb-10" />

            <p className="mb-10 text-base leading-8 text-[#626262] sm:text-lg sm:leading-9 lg:mb-16">
              {featuredEvent.description}
            </p>

            {/* Information */}

            <div className="space-y-6 lg:space-y-8">
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                className="flex items-center gap-4 border-b border-[#E8DDD0] pb-5 lg:gap-5 lg:pb-6"
              >
                <div className="rounded-full bg-[#F8F2E8] p-3 lg:p-4">
                  <PiCalendarBlankBold className="text-xl text-[#C99A5B] lg:text-2xl" />
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#8A8A8A]">
                    Date
                  </p>

                  <p className="mt-2 text-base text-[#162425] sm:text-lg">
                    {formatDate(featuredEvent.startDate)}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
                className="flex items-center gap-4 border-b border-[#E8DDD0] pb-5 lg:gap-5 lg:pb-6"
              >
                <div className="rounded-full bg-[#F8F2E8] p-3 lg:p-4">
                  <PiClockBold className="text-xl text-[#C99A5B] lg:text-2xl" />
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#8A8A8A]">
                    Time
                  </p>

                  <p className="mt-2 text-base text-[#162425] sm:text-lg">
                    {formatTime(featuredEvent.startDate)} –{" "}
                    {formatTime(featuredEvent.endDate)}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{ delay: 0.16 }}
                className="flex items-center gap-4 border-b border-[#E8DDD0] pb-5 lg:gap-5 lg:pb-6"
              >
                <div className="rounded-full bg-[#F8F2E8] p-3 lg:p-4">
                  <PiMapPinBold className="text-xl text-[#C99A5B] lg:text-2xl" />
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#8A8A8A]">
                    Venue
                  </p>

                  <p className="mt-2 text-base text-[#162425] sm:text-lg">
                    {featuredEvent.venue}, {featuredEvent.city}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{ delay: 0.24 }}
                className="flex items-center gap-4 border-b border-[#E8DDD0] pb-5 lg:gap-5 lg:pb-6"
              >
                <div className="rounded-full bg-[#F8F2E8] p-3 lg:p-4">
                  <PiUsersThreeBold className="text-xl text-[#C99A5B] lg:text-2xl" />
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#8A8A8A]">
                    Capacity
                  </p>

                  <p className="mt-2 text-base text-[#162425] sm:text-lg">
                    {featuredEvent.capacity !== null
                      ? `${featuredEvent.capacity} guests`
                      : "Limited availability"}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{ delay: 0.32 }}
                className="flex items-center gap-4 border-b border-[#E8DDD0] pb-5 lg:gap-5 lg:pb-6"
              >
                <div className="rounded-full bg-[#F8F2E8] p-3 lg:p-4">
                  <PiTicketBold className="text-xl text-[#C99A5B] lg:text-2xl" />
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#8A8A8A]">
                    Tickets
                  </p>

                  <p className="mt-2 text-base text-[#162425] sm:text-lg">
                    Limited availability
                  </p>
                </div>
              </motion.div>
            </div>

            {/* CTA */}

            <Link
              to={`/events/${featuredEvent.id}`}
              className="mt-10 flex w-full items-center justify-center gap-4 rounded-full bg-[#162425] px-10 py-5 text-sm uppercase tracking-[0.35em] text-white transition hover:bg-[#263839] sm:w-fit lg:mt-16"
            >
              View Event
              <FaArrowRight />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
