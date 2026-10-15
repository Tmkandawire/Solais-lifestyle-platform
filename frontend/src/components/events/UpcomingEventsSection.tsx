import { motion } from "framer-motion";

import { useEvents } from "../../hooks/useEvents";
import EventCard from "../ui/EventCard";

export default function UpcomingEventsSection() {
  const { events, loading, error } = useEvents({
    page: 1,
    limit: 6,
  });

  return (
    <section className="relative overflow-hidden bg-[#F8F5F0] py-20 sm:py-24 lg:py-32">
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
          className="mb-16 text-center sm:mb-20 lg:mb-28"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
            UPCOMING EXPERIENCES
          </p>

          <h2
            className="text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(3rem,6vw,4.75rem)",
            }}
          >
            Reserve your next
            <br />
            unforgettable moment.
          </h2>
        </motion.div>

        {/* Dynamic Event List */}

        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {loading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`event-skeleton-${index}`}
                className="h-[620px] animate-pulse rounded-[36px] bg-[#EDE7DE]"
              />
            ))}

          {!loading && error && (
            <div className="col-span-full rounded-[28px] border border-[#E7DCCF] bg-white p-10 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#C99A5B]">
                EVENTS
              </p>

              <p className="mt-4 text-[#626262]">
                We were unable to load upcoming experiences.
              </p>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="col-span-full rounded-[28px] border border-[#E7DCCF] bg-white p-10 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#C99A5B]">
                COMING SOON
              </p>

              <p className="mt-4 text-[#626262]">
                New experiences are being prepared. Check back soon.
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            events.map((event, index) => (
              <EventCard key={event.id} event={event} featured={index === 1} />
            ))}
        </div>

        {/* Bottom Statement */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20 text-center sm:mt-24 lg:mt-32"
        >
          <div className="mb-8 flex items-center justify-center gap-4 sm:gap-6 lg:mb-10">
            <div className="h-px w-16 bg-[#DCCDB8] sm:w-24 lg:w-32" />

            <motion.span
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="text-[#C99A5B]"
            >
              ☼
            </motion.span>

            <div className="h-px w-16 bg-[#DCCDB8] sm:w-24 lg:w-32" />
          </div>

          <p
            className="text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2.2rem,4vw,3rem)",
            }}
          >
            Limited spaces.
            <span className="italic text-[#C99A5B]">
              {" "}
              Exceptional experiences.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
