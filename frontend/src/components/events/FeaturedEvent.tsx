import { motion } from "framer-motion";
import {
  PiCalendarBlankBold,
  PiClockBold,
  PiMapPinBold,
  PiDressBold,
  PiTicketBold,
} from "react-icons/pi";
import { FaArrowRight } from "react-icons/fa6";

import featuredImage from "../../assets/experiences/experiences-hero.jpg.jpg";

const details = [
  {
    icon: PiCalendarBlankBold,
    label: "Date",
    value: "12 September 2026",
  },
  {
    icon: PiClockBold,
    label: "Time",
    value: "16:00 - Late",
  },
  {
    icon: PiMapPinBold,
    label: "Venue",
    value: "Lusaka, Zambia",
  },
  {
    icon: PiDressBold,
    label: "Dress Code",
    value: "Elegant Chic",
  },
  {
    icon: PiTicketBold,
    label: "Tickets",
    value: "Limited Availability",
  },
];

export default function FeaturedEvent() {
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
            Sunday Soirée
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#626262] sm:text-lg sm:leading-9 lg:mt-8 lg:text-xl lg:leading-10">
            A beautifully curated afternoon celebrating meaningful
            conversations, elegant hospitality and unforgettable connections.
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
            className="group relative overflow-hidden rounded-[30px] border border-[#E6D8C7] shadow-[0_45px_120px_rgba(0,0,0,.08)] lg:rounded-[46px]"
          >
            <div className="relative h-[420px] overflow-hidden sm:h-[560px] lg:h-[760px]">
              <motion.img
                animate={{
                  scale: [1, 1.04, 1],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                }}
                src={featuredImage}
                alt="Sunday Soirée"
                className="h-full w-full object-cover"
              />

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
              An afternoon
              <br />
              worth remembering.
            </h3>

            <div className="mb-8 h-px w-28 bg-gradient-to-r from-[#C99A5B] to-transparent lg:mb-10" />

            <p className="mb-10 text-base leading-8 text-[#626262] sm:text-lg sm:leading-9 lg:mb-16">
              Sunday Soirée blends beautiful surroundings, exceptional
              hospitality and authentic conversation into one unforgettable
              experience. Whether you're meeting new people, celebrating
              milestones or simply enjoying the atmosphere, every moment is
              intentionally curated.
            </p>

            {/* Information */}

            <div className="space-y-6 lg:space-y-8">
              {details.map((detail, index) => {
                const Icon = detail.icon;

                return (
                  <motion.div
                    key={detail.label}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      delay: index * 0.08,
                    }}
                    className="flex items-center gap-4 border-b border-[#E8DDD0] pb-5 lg:gap-5 lg:pb-6"
                  >
                    <div className="rounded-full bg-[#F8F2E8] p-3 lg:p-4">
                      <Icon className="text-xl text-[#C99A5B] lg:text-2xl" />
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-[#8A8A8A]">
                        {detail.label}
                      </p>

                      <p className="mt-2 text-base text-[#162425] sm:text-lg">
                        {detail.value}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}

            <motion.button
              whileHover={{
                x: 8,
              }}
              className="mt-10 flex w-full items-center justify-center gap-4 rounded-full bg-[#162425] px-10 py-5 text-sm uppercase tracking-[0.35em] text-white transition sm:w-fit lg:mt-16"
            >
              Reserve Your Place
              <FaArrowRight />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
