import { motion } from "framer-motion";

export default function ContactHero() {
  return (
    <section className="relative overflow-hidden bg-[#F8F5F0]">
      {/* Ambient Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,154,91,.12),transparent_65%)]" />

      <div className="relative mx-auto flex min-h-[72vh] sm:min-h-[78vh] lg:min-h-[82vh] max-w-[1500px] items-center justify-center px-6 py-28 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
            filter: "blur(8px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.9,
          }}
          className="max-w-5xl text-center"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:mb-6 sm:text-sm">
            CONTACT
          </p>

          <h1
            className="leading-none text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(3.5rem,8vw,7rem)",
            }}
          >
            Your invitation
            <br />
            <span className="italic text-[#C99A5B]">begins here.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-[#626262] sm:mt-10 sm:text-lg sm:leading-9 lg:text-xl lg:leading-10">
            Whether you're attending an event, becoming a vendor, exploring
            partnership opportunities or simply learning more about Solaís
            Lifestyle, we'd love to hear from you.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
