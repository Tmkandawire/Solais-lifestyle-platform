import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import {
  PiSparkleBold,
  PiUsersThreeBold,
  PiCrownSimpleBold,
  PiSunHorizonBold,
} from "react-icons/pi";

const features = [
  {
    icon: PiSparkleBold,
    title: "Curated Experiences",
    description: "Thoughtfully designed moments that inspire.",
  },
  {
    icon: PiUsersThreeBold,
    title: "Meaningful Connections",
    description: "Bringing remarkable people together.",
  },
  {
    icon: PiCrownSimpleBold,
    title: "Exceptional Standards",
    description: "Every detail crafted with elegance.",
  },
  {
    icon: PiSunHorizonBold,
    title: "Lifestyle Beyond Events",
    description: "A community celebrating culture.",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F3ED]">
      {/* Ambient Background */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,154,91,.14),transparent_65%)]" />

      <div className="absolute -top-52 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[#C99A5B]/10 blur-[170px]" />

      <motion.div
        animate={{
          backgroundPosition: ["0px 0px", "40px 40px"],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle,#C99A5B 1px,transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />

      {/* Hero */}

      <div className="relative mx-auto flex min-h-[90vh] lg:min-h-[92vh] max-w-6xl flex-col items-center justify-start px-6 py-8 text-center sm:px-8 md:px-10">
        {/* Pill */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 inline-flex max-w-full items-center gap-3 rounded-full border border-[#DDCEBA] bg-white/75 px-5 py-3 backdrop-blur-xl sm:px-7"
        >
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="text-[#C99A5B]"
          >
            ☼
          </motion.span>

          <span className="text-[11px] uppercase tracking-[0.35em] text-[#C99A5B] sm:text-xs sm:tracking-[0.4em]">
            Curated Lifestyle Experiences
          </span>
        </motion.div>

        {/* Heading */}

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.15,
            duration: 0.9,
          }}
          className="leading-[0.94] text-[#162425]"
          style={{
            fontFamily: "Cormorant Garamond",
            fontSize: "clamp(2.8rem,5.4vw,5rem)",
          }}
        >
          Elevating
          <br />
          <span className="italic text-[#C99A5B]">Experiences.</span>
          <br />
          Inspiring Connections.
        </motion.h1>

        {/* Description */}

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#5F5F5F] sm:text-lg sm:leading-9 md:text-xl md:leading-10"
        >
          Solaís Lifestyle is a lifestyle and experiences brand that brings
          people together through thoughtfully curated events. We create spaces
          where professionals, entrepreneurs, creatives and communities connect,
          celebrate and build meaningful relationships.
        </motion.p>

        {/* Buttons */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-8 flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
        >
          <Link
            to="/events"
            className="group relative w-full overflow-hidden rounded-full bg-[#162425] px-10 py-5 text-center text-sm uppercase tracking-[0.3em] text-white transition-all duration-500 hover:scale-[1.03] sm:w-auto"
          >
            <span className="relative z-10">Explore Events</span>

            <span className="absolute inset-0 bg-gradient-to-r from-[#C99A5B] via-[#E5BF83] to-[#C99A5B] opacity-0 transition duration-500 group-hover:opacity-100" />
          </Link>

          <Link
            to="/about"
            className="group flex w-full items-center justify-center gap-3 rounded-full border border-[#D9CCBD] bg-white/50 px-10 py-5 text-sm uppercase tracking-[0.3em] backdrop-blur-xl transition-all duration-500 hover:border-[#C99A5B] hover:bg-white sm:w-auto"
          >
            Our Story
            <FaArrowRight className="transition group-hover:translate-x-2" />
          </Link>
        </motion.div>

        {/* Scroll Indicator */}

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="mt-14 mb-6 flex flex-col items-center"
        >
          <div className="mb-3 h-14 w-px bg-gradient-to-b from-[#C99A5B] to-transparent" />

          <p className="text-[11px] uppercase tracking-[0.4em] text-[#A18D73]">
            Scroll
          </p>
        </motion.div>
      </div>

      {/* Editorial Ribbon */}

      <div className="relative z-20 mx-auto -lg:-mt-16 -mt-8 max-w-[1450px] px-6 md:px-10 xl:px-12">
        <div className="grid grid-cols-1 overflow-hidden rounded-[36px] border border-[#E6DACB] bg-white/90 shadow-[0_35px_80px_rgba(0,0,0,.08)] backdrop-blur-xl sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                whileHover={{ y: -6 }}
                className={`group relative overflow-hidden p-6 transition-all duration-500 sm:p-8 xl:p-10 ${
                  index !== features.length - 1
                    ? "border-b border-[#ECE1D3] sm:border-r xl:border-b-0"
                    : ""
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#F9F4EC] to-[#F2E8D8] opacity-0 transition duration-500 group-hover:opacity-100" />

                <div className="relative">
                  <motion.div
                    whileHover={{
                      rotate: 12,
                      scale: 1.1,
                    }}
                    className="mb-6 inline-flex rounded-full bg-[#FFF8F0] p-4 shadow-lg"
                  >
                    <Icon className="text-2xl text-[#C99A5B] sm:text-3xl" />
                  </motion.div>

                  <h3 className="mb-3 text-xs uppercase tracking-[0.28em] text-[#162425]">
                    {feature.title}
                  </h3>

                  <p className="leading-7 text-[#666666]">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
