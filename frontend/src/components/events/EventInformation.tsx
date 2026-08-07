import { motion } from "framer-motion";
import {
  PiCalendarBlankBold,
  PiClockBold,
  PiMapPinBold,
  PiDressBold,
  PiTicketBold,
  PiQuestionBold,
} from "react-icons/pi";

const information = [
  {
    icon: PiCalendarBlankBold,
    title: "Date",
    value: "12 September 2026",
    description:
      "Mark your calendar and prepare for an unforgettable Solaís experience.",
  },
  {
    icon: PiClockBold,
    title: "Time",
    value: "16:00 • Until Late",
    description:
      "Arrive early, settle in and enjoy every carefully curated moment.",
  },
  {
    icon: PiMapPinBold,
    title: "Venue",
    value: "Royal Livingstone Hotel",
    description:
      "An elegant setting chosen to complement the atmosphere of the evening.",
  },
  {
    icon: PiDressBold,
    title: "Dress Code",
    value: "Elegant Chic",
    description:
      "Timeless style, neutral tones and effortless sophistication are encouraged.",
  },
  {
    icon: PiTicketBold,
    title: "Tickets",
    value: "Limited Availability",
    description:
      "Every gathering is intentionally intimate to encourage genuine connection.",
  },
  {
    icon: PiQuestionBold,
    title: "Frequently Asked Questions",
    value: "Everything Covered",
    description:
      "Need more information? Our team is ready to assist before your arrival.",
  },
];

export default function EventInformation() {
  return (
    <section className="relative overflow-hidden bg-[#F8F5F0] py-20 sm:py-24 lg:py-32">
      {/* Ambient Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,154,91,.06),transparent_70%)]" />

      <div className="relative mx-auto max-w-[1450px] px-6 sm:px-8 lg:px-12">
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
          className="mb-16 text-center sm:mb-24 lg:mb-32"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
            BEFORE YOU ARRIVE
          </p>

          <h2
            className="text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(3rem,6vw,4.75rem)",
            }}
          >
            Everything you need
            <br />
            before the evening begins.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#626262] sm:mt-8 sm:text-lg sm:leading-9 lg:mt-10 lg:text-xl lg:leading-10">
            Every detail has been thoughtfully prepared to ensure your Solaís
            experience feels effortless from the moment you reserve your place.
          </p>
        </motion.div>

        {/* Information */}

        <div className="space-y-14 sm:space-y-20 lg:space-y-24">
          {information.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
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
                  duration: 0.8,
                  delay: index * 0.08,
                }}
              >
                <div className="grid items-center gap-8 text-center lg:grid-cols-[120px_280px_1fr] lg:gap-10 lg:text-left">
                  {/* Icon */}

                  <motion.div
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#E6D8C7] bg-white shadow-[0_20px_50px_rgba(0,0,0,.05)] sm:h-24 sm:w-24 lg:mx-0"
                  >
                    <Icon className="text-3xl text-[#C99A5B] sm:text-4xl" />
                  </motion.div>

                  {/* Title */}

                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.4em] text-[#8A8A8A]">
                      {item.title}
                    </p>

                    <h3
                      className="text-[#162425]"
                      style={{
                        fontFamily: "Cormorant Garamond",
                        fontSize: "clamp(2rem,4vw,2.625rem)",
                      }}
                    >
                      {item.value}
                    </h3>
                  </div>

                  {/* Description */}

                  <div>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: 90 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.8,
                      }}
                      className="mx-auto mb-6 h-[2px] rounded-full bg-[#C99A5B] lg:mx-0"
                    />

                    <p className="mx-auto max-w-2xl text-base leading-8 text-[#626262] sm:text-lg sm:leading-9 lg:mx-0">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Divider */}

                {index !== information.length - 1 && (
                  <div className="mt-12 flex justify-center sm:mt-14 lg:mt-16">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="h-px w-16 bg-[#DDD2C3] sm:w-24 lg:w-28" />

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

                      <div className="h-px w-16 bg-[#DDD2C3] sm:w-24 lg:w-28" />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Closing Statement */}

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
          transition={{
            duration: 0.8,
          }}
          className="mt-24 text-center sm:mt-32 lg:mt-40"
        >
          <p
            className="text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2.5rem,5vw,3.5rem)",
            }}
          >
            Come prepared.
            <span className="italic text-[#C99A5B]"> Leave inspired.</span>
          </p>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#626262] sm:mt-8 sm:text-lg sm:leading-9">
            Every Solaís event is intentionally crafted so you can focus on
            enjoying the people, the atmosphere and the experience.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
