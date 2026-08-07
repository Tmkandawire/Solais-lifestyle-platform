import { motion } from "framer-motion";

export default function PromiseSection() {
  return (
    <section className="relative overflow-hidden bg-[#F8F5F0] py-24 lg:py-36">
      {/* Animated Glow */}

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.18, 0.3, 0.18],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,154,91,.16),transparent_70%)]"
      />

      {/* Floating Blur */}

      <motion.div
        animate={{
          y: [-20, 20, -20],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-24 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#C99A5B]/10 blur-[150px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.9,
        }}
        className="relative mx-auto max-w-5xl px-6 text-center md:px-10"
      >
        {/* Eyebrow */}

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-8 uppercase tracking-[0.45em] text-sm text-[#C99A5B]"
        >
          OUR PROMISE
        </motion.p>

        {/* Heading */}

        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="leading-[0.95] text-[#162425]"
          style={{
            fontFamily: "Cormorant Garamond",
            fontSize: "clamp(3rem,7vw,5.3rem)",
          }}
        >
          Life is measured
          <br />
          by the moments
          <br />
          <span className="italic text-[#C99A5B]">we share.</span>
        </motion.h2>

        {/* Description */}

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.35,
          }}
          className="mx-auto mt-10 max-w-3xl text-base leading-8 text-[#646464] md:text-lg md:leading-9 lg:text-xl lg:leading-10"
        >
          Every Solaís experience is thoughtfully curated to inspire meaningful
          connection, celebrate community and create memories that stay with you
          long after the evening ends. Our promise is simple—to make every
          gathering feel effortless, elegant and unforgettable.
        </motion.p>

        {/* Divider */}

        <motion.div
          initial={{ opacity: 0, scaleX: 0.7 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.5,
            duration: 0.8,
          }}
          className="mx-auto mt-16 flex max-w-xl items-center"
        >
          <span className="h-px flex-1 bg-[#D8C9B5]" />

          <motion.span
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
            }}
            className="mx-6 text-2xl text-[#C99A5B]"
          >
            ☼
          </motion.span>

          <span className="h-px flex-1 bg-[#D8C9B5]" />
        </motion.div>

        {/* Footer */}

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.7,
          }}
          className="mt-8 text-xs uppercase tracking-[0.45em] text-[#8B7A66] md:text-sm"
        >
          Crafted With Intention • Since 2026
        </motion.p>
      </motion.div>
    </section>
  );
}
