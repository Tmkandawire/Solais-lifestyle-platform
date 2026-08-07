import { motion } from "framer-motion";
import {
  PiArrowUpRightBold,
  PiCalendarBlankBold,
  PiMapPinBold,
} from "react-icons/pi";

const events = [
  {
    day: "12",
    month: "SEP",
    title: "Sunday Soirée",
    location: "Lusaka",
    description:
      "An elegant afternoon of conversation, fine dining and beautiful connections.",
    accent: "from-[#F4E5D2] via-[#ECDCC7] to-[#DFCCB5]",
  },
  {
    day: "26",
    month: "SEP",
    title: "Business Mixer",
    location: "Lusaka",
    description:
      "Where entrepreneurs, professionals and creatives build meaningful relationships.",
    accent: "from-[#E8E3D8] via-[#DDD7CA] to-[#CEC7B8]",
  },
  {
    day: "10",
    month: "OCT",
    title: "Fashion Experience",
    location: "Livingstone",
    description:
      "Celebrating African creativity, style and unforgettable runway moments.",
    accent: "from-[#EFE2D5] via-[#E6D5C4] to-[#DAC5AE]",
  },
];

export default function UpcomingEventsSection() {
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

        {/* Event List */}

        <div className="space-y-6 sm:space-y-8">
          {events.map((event, index) => (
            <motion.article
              key={event.title}
              initial={{
                opacity: 0,
                y: 50,
                filter: "blur(8px)",
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
              }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.12,
                duration: 0.8,
              }}
              whileHover={{
                y: -6,
              }}
              className="group relative overflow-hidden rounded-[28px] border border-[#E7DCCF] bg-white shadow-[0_25px_70px_rgba(0,0,0,.05)] lg:rounded-[40px]"
            >
              {/* Hover Background */}

              <div
                className={`absolute inset-0 bg-gradient-to-r ${event.accent} opacity-0 transition-all duration-700 group-hover:opacity-100`}
              />

              <div className="relative grid gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[180px_1fr_260px] lg:gap-10 lg:px-14 lg:py-14">
                {/* Date */}

                <div className="text-center lg:text-left">
                  <motion.h3
                    whileHover={{
                      scale: 1.05,
                    }}
                    className="leading-none text-[#C99A5B]"
                    style={{
                      fontFamily: "Cormorant Garamond",
                      fontSize: "clamp(4rem,8vw,5.5rem)",
                    }}
                  >
                    {event.day}
                  </motion.h3>

                  <p className="mt-2 text-xs uppercase tracking-[0.45em] text-[#162425] sm:text-sm">
                    {event.month}
                  </p>
                </div>

                {/* Content */}

                <div className="text-center lg:text-left">
                  <h3
                    className="text-[#162425]"
                    style={{
                      fontFamily: "Cormorant Garamond",
                      fontSize: "clamp(2.2rem,4vw,3rem)",
                    }}
                  >
                    {event.title}
                  </h3>

                  <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#626262] sm:text-lg sm:leading-9 lg:mx-0">
                    {event.description}
                  </p>

                  <div className="mt-8 flex flex-col items-center gap-5 text-xs uppercase tracking-[0.28em] text-[#666] sm:flex-row sm:flex-wrap sm:justify-center sm:gap-8 sm:text-sm lg:justify-start">
                    <div className="flex items-center gap-3">
                      <PiCalendarBlankBold className="text-[#C99A5B]" />
                      September 2026
                    </div>

                    <div className="flex items-center gap-3">
                      <PiMapPinBold className="text-[#C99A5B]" />
                      {event.location}
                    </div>
                  </div>
                </div>

                {/* CTA */}

                <motion.div
                  whileHover={{
                    x: 8,
                  }}
                  className="flex justify-center lg:justify-end"
                >
                  <button className="flex w-full items-center justify-center gap-4 rounded-full border border-[#DCCFBE] bg-white/80 px-8 py-5 text-sm uppercase tracking-[0.35em] text-[#162425] transition-all duration-500 group-hover:border-[#C99A5B] group-hover:bg-white sm:w-auto">
                    Discover
                    <PiArrowUpRightBold className="text-lg transition duration-500 group-hover:rotate-45" />
                  </button>
                </motion.div>
              </div>

              {/* Luxury Bottom Line */}

              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{
                  duration: 1,
                  delay: 0.4,
                }}
                className="h-[2px] bg-gradient-to-r from-[#C99A5B] via-[#E7D7C2] to-transparent"
              />
            </motion.article>
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
