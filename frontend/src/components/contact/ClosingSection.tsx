import { motion } from "framer-motion";
import Logo from "../branding/Logo";

export default function ClosingSection() {
  return (
    <section className="relative overflow-hidden bg-[#F8F5F0] py-24 sm:py-28 lg:py-36">
      {/* Ambient Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,154,91,.12),transparent_65%)]" />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative mx-auto max-w-4xl px-6 text-center sm:px-8 lg:px-12"
      >
        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, 2, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
          className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full border border-[#E7DCCF] bg-white/70 shadow-xl backdrop-blur-xl sm:mb-12 sm:h-28 sm:w-28 lg:h-32 lg:w-32"
        >
          <Logo variant="light" className="w-14 sm:w-16 lg:w-20" />
        </motion.div>

        <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:mb-6 sm:text-sm">
          THANK YOU
        </p>

        <h2
          className="leading-none text-[#162425]"
          style={{
            fontFamily: "Cormorant Garamond",
            fontSize: "clamp(3rem,7vw,5.125rem)",
          }}
        >
          We can't wait
          <br />
          <span className="italic text-[#C99A5B]">to welcome you.</span>
        </h2>

        <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-[#626262] sm:mt-10 sm:text-lg sm:leading-9 lg:text-xl lg:leading-10">
          Whether you're attending your first Solaís experience, becoming a
          partner or simply saying hello, we're looking forward to beginning the
          conversation.
        </p>

        <div className="mt-14 flex items-center justify-center gap-4 sm:mt-16 sm:gap-5 lg:mt-20 lg:gap-6">
          <div className="h-px w-16 bg-[#D8C8AE] sm:w-24 lg:w-32" />

          <motion.span
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "linear",
            }}
            className="text-lg text-[#C99A5B] sm:text-xl"
          >
            ☼
          </motion.span>

          <div className="h-px w-16 bg-[#D8C8AE] sm:w-24 lg:w-32" />
        </div>

        <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-[#7A7A7A] sm:mt-8 sm:text-xs sm:tracking-[0.35em]">
          Every remarkable relationship begins with a conversation.
        </p>
      </motion.div>
    </section>
  );
}
