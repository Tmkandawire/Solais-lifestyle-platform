import { motion } from "framer-motion";
import { FaArrowRightLong } from "react-icons/fa6";

const journey = [
  {
    number: "01",
    title: "Discover",
    description:
      "Explore thoughtfully curated experiences designed around culture, elegance and meaningful human connection.",
  },
  {
    number: "02",
    title: "Reserve",
    description:
      "Choose your experience, secure your place and receive your beautifully crafted digital invitation.",
  },
  {
    number: "03",
    title: "Arrive",
    description:
      "Walk into welcoming spaces where every detail has been carefully considered—from ambience to hospitality.",
  },
  {
    number: "04",
    title: "Connect",
    description:
      "Meet remarkable people, share genuine conversations and become part of the growing Solaís community.",
  },
  {
    number: "05",
    title: "Remember",
    description:
      "Leave with unforgettable memories, lasting friendships and moments you'll look forward to experiencing again.",
  },
];

export default function ExperienceJourney() {
  return (
    <section className="relative overflow-hidden bg-[#FBF8F4] py-24 md:py-32 lg:py-40">
      {/* Ambient Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,154,91,.06),transparent_70%)]" />

      <div className="relative mx-auto max-w-[1300px] px-6 sm:px-8 lg:px-12">
        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center md:mb-24 lg:mb-32"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
            THE SOLAÍS JOURNEY
          </p>

          <h2
            className="text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2.8rem,5vw,4.75rem)",
            }}
          >
            Every unforgettable evening
            <br />
            begins with one decision.
          </h2>
        </motion.div>

        {/* Journey */}

        <div className="space-y-16 md:space-y-20 lg:space-y-28">
          {journey.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{
                opacity: 0,
                y: 60,
                filter: "blur(10px)",
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
              className="group relative"
            >
              {/* Huge Background Number */}

              <span
                className="absolute -top-6 left-0 select-none text-[70px] leading-none text-[#C99A5B]/10 sm:text-[100px] md:text-[130px] lg:-top-12 lg:text-[160px]"
                style={{
                  fontFamily: "Cormorant Garamond",
                }}
              >
                {step.number}
              </span>

              <div className="relative flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
                <div className="max-w-2xl">
                  <h3
                    className="mb-5 text-[#162425]"
                    style={{
                      fontFamily: "Cormorant Garamond",
                      fontSize: "clamp(2.2rem,4vw,3.5rem)",
                    }}
                  >
                    {step.title}
                  </h3>

                  {/* Animated Gold Line */}

                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: 120 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: 0.3,
                    }}
                    className="mb-6 h-[2px] rounded-full bg-[#C99A5B]"
                  />

                  <p className="max-w-xl text-base leading-8 text-[#626262] sm:text-lg sm:leading-9 lg:text-xl lg:leading-10">
                    {step.description}
                  </p>
                </div>

                {/* Step Indicator */}

                <motion.div
                  whileHover={{
                    rotate: 0,
                    scale: 1.08,
                  }}
                  initial={{
                    rotate: -12,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                  className="hidden h-24 w-24 items-center justify-center rounded-full border border-[#E7DCCF] bg-white shadow-[0_20px_50px_rgba(0,0,0,.05)] lg:flex"
                >
                  <FaArrowRightLong className="text-2xl text-[#C99A5B]" />
                </motion.div>
              </div>

              {/* Divider */}

              {index !== journey.length - 1 && (
                <div className="mt-12 flex justify-center md:mt-16 lg:mt-20">
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className="h-px w-12 bg-[#DCCDB8] sm:w-16 md:w-20 lg:w-24" />

                    <motion.span
                      animate={{
                        y: [0, -4, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                      }}
                      className="text-[#C99A5B]"
                    >
                      ☼
                    </motion.span>

                    <div className="h-px w-12 bg-[#DCCDB8] sm:w-16 md:w-20 lg:w-24" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
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
          className="mt-20 text-center md:mt-28 lg:mt-40"
        >
          <div className="mb-10 flex items-center justify-center gap-4 md:gap-6">
            <div className="h-px w-16 bg-[#DCCDB8] sm:w-20 md:w-24 lg:w-32" />

            <span className="text-xl text-[#C99A5B]">☼</span>

            <div className="h-px w-16 bg-[#DCCDB8] sm:w-20 md:w-24 lg:w-32" />
          </div>

          <h3
            className="text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2.2rem,4vw,3.4rem)",
            }}
          >
            Your story begins with
            <span className="italic text-[#C99A5B]"> one invitation.</span>
          </h3>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#626262] sm:text-lg sm:leading-9">
            Every Solaís gathering is more than an event—it's the beginning of
            new friendships, new opportunities and unforgettable memories.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
