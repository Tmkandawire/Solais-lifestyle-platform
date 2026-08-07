import { motion } from "framer-motion";

export default function QuoteSection() {
  return (
    <section className="relative overflow-hidden bg-[#FBF8F4] py-24 sm:py-32 lg:py-40">
      {/* Ambient Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,154,91,.10),transparent_65%)]" />

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
        className="relative mx-auto max-w-5xl px-6 text-center sm:px-8 lg:px-12"
      >
        <p className="mb-6 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
          EVERY IMAGE HAS A STORY
        </p>

        <h2
          className="leading-[0.95] text-[#162425]"
          style={{
            fontFamily: "Cormorant Garamond",
            fontSize: "clamp(2.8rem,7vw,5.2rem)",
          }}
        >
          We don't simply host events.
          <br />
          <span className="italic text-[#C99A5B]">
            We create memories worth reliving.
          </span>
        </h2>

        <p className="mx-auto mt-10 max-w-3xl text-base leading-8 text-[#626262] sm:text-lg sm:leading-9 lg:text-xl lg:leading-10">
          Every photograph captures a genuine conversation, a shared laugh, a
          new friendship or a moment of celebration. Together they tell the
          story of a community brought together through thoughtfully curated
          experiences.
        </p>

        {/* Editorial Divider */}

        <div className="mt-16 flex items-center justify-center gap-5 sm:gap-6">
          <div className="h-px w-16 bg-[#D8C8AE] sm:w-24 lg:w-32" />

          <motion.span
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="text-lg text-[#C99A5B] sm:text-xl"
          >
            ☼
          </motion.span>

          <div className="h-px w-16 bg-[#D8C8AE] sm:w-24 lg:w-32" />
        </div>

        <p className="mt-8 text-[11px] uppercase tracking-[0.35em] text-[#8A8177] sm:text-xs">
          Every remarkable relationship begins with a conversation.
        </p>
      </motion.div>
    </section>
  );
}
