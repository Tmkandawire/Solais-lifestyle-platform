import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";

import heroImage from "../../assets/experiences/creative.jpg.jpg";

export default function ExperiencesHero() {
  return (
    <section className="relative overflow-hidden bg-[#F8F5F0]">
      {/* Background Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,154,91,.10),transparent_65%)]" />

      <div className="relative mx-auto max-w-[1600px] px-6 pt-32 pb-20 md:px-10 lg:px-12 lg:pt-40 lg:pb-28">
        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-5xl text-center"
        >
          <p className="mb-6 text-xs uppercase tracking-[0.45em] text-[#C99A5B] md:text-sm">
            THOUGHTFULLY CURATED EXPERIENCES
          </p>

          <h1
            className="leading-[0.92] text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(3.5rem,8vw,7rem)",
            }}
          >
            Experiences
            <br />
            <span className="italic text-[#C99A5B]">worth remembering.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-[#636363] md:text-lg md:leading-9 lg:mt-10 lg:text-xl lg:leading-10">
            Discover beautifully curated gatherings where culture, creativity,
            conversation and community come together to create unforgettable
            moments.
          </p>
        </motion.div>

        {/* Experience Pills */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mx-auto mt-14 flex max-w-6xl flex-wrap justify-center gap-3 md:gap-4 lg:mt-20"
        >
          {[
            "Sunday Soirées",
            "Networking Sessions",
            "Business Mixers",
            "Fashion Experiences",
            "Live Entertainment",
            "Food & Lifestyle",
            "Creative Showcases",
            "Private Events",
          ].map((item) => (
            <motion.div
              whileHover={{
                y: -4,
              }}
              key={item}
              className="rounded-full border border-[#DCCFBE] bg-white/70 px-5 py-3 text-[11px] uppercase tracking-[0.25em] text-[#162425] backdrop-blur transition-all duration-300 md:px-7 md:py-4 md:text-sm"
            >
              {item}
            </motion.div>
          ))}
        </motion.div>

        {/* Hero Image */}

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{
            scale: 1.01,
          }}
          className="relative mt-16 overflow-hidden rounded-[28px] border border-[#E7DCCF] shadow-[0_40px_100px_rgba(0,0,0,.08)] lg:mt-24 lg:rounded-[42px]"
        >
          <img
            src={heroImage}
            alt="Solaís Experiences"
            className="h-[540px] w-full object-cover md:h-[300px] lg:h-[540px]"
          />

          {/* Gradient */}

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Quote */}

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 1,
            }}
            className="absolute bottom-4 left-4 rounded-2xl bg-white/90 px-5 py-5 shadow-2xl backdrop-blur md:bottom-8 md:left-8 md:px-8 md:py-7 lg:bottom-10 lg:left-10 lg:rounded-[28px]"
          >
            <p
              className="text-[#C99A5B]"
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: "clamp(1.8rem,3vw,2.6rem)",
              }}
            >
              Every gathering
            </p>

            <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-[#162425] md:text-xs">
              Begins With Connection
            </p>
          </motion.div>
        </motion.div>

        {/* CTA */}

        <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row lg:mt-20">
          <Link
            to="/events"
            className="w-full rounded-full bg-[#162425] px-10 py-5 text-center text-sm uppercase tracking-[0.3em] text-white transition-all duration-300 hover:-translate-y-1 sm:w-auto"
          >
            Explore Events
          </Link>

          <Link
            to="/contact"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-[#D8C8B5] px-10 py-5 text-sm uppercase tracking-[0.3em] transition-all duration-300 hover:border-[#C99A5B] sm:w-auto"
          >
            Contact Us
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
