import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import Logo from "../branding/Logo";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-[#162425] py-24 md:py-32 lg:py-40">
      {/* Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,154,91,.12),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative mx-auto max-w-5xl px-6 text-center sm:px-8 lg:px-12"
      >
        <Logo
          variant="dark"
          className="mx-auto mb-8 w-24 opacity-70 sm:w-28 lg:mb-10 lg:w-36"
        />

        <p className="mb-6 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
          JOIN THE LIFESTYLE
        </p>

        <h2
          className="leading-none text-white"
          style={{
            fontFamily: "Cormorant Garamond",
            fontSize: "clamp(2.8rem,5vw,5.1rem)",
          }}
        >
          Every gathering
          <br />
          begins with
          <span className="italic text-[#C99A5B]"> one invitation.</span>
        </h2>

        <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-white/70 sm:text-lg sm:leading-9 lg:mt-10">
          Discover thoughtfully curated experiences where culture, elegance and
          genuine connection come together.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 lg:mt-16">
          <Link
            to="/events"
            className="w-full rounded-full bg-[#C99A5B] px-10 py-5 text-center text-sm uppercase tracking-[0.3em] text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#B8894D] sm:w-auto"
          >
            Explore Events
          </Link>

          <Link
            to="/contact"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-white/20 px-10 py-5 text-sm uppercase tracking-[0.3em] text-white transition-all duration-300 hover:border-[#C99A5B] hover:text-[#C99A5B] sm:w-auto"
          >
            Contact Us
            <FaArrowRight />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
