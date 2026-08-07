import { motion } from "framer-motion";
import homeLifestyle from "../../assets/home/home-lifestyle.jpg.jpg";

export default function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F3ED]">
      {/* Ambient Glow */}

      <div className="absolute right-0 top-0 h-[650px] w-[650px] rounded-full bg-[#C99A5B]/10 blur-[170px]" />

      <div className="absolute left-0 bottom-0 h-[450px] w-[450px] rounded-full bg-[#C99A5B]/5 blur-[140px]" />

      <div className="mx-auto flex min-h-[92vh] max-w-[1500px] flex-col items-center gap-16 px-6 py-20 md:px-10 lg:flex-row lg:gap-20 lg:px-12 lg:py-28">
        {/* Left */}

        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-1/2"
        >
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6 uppercase tracking-[0.45em] text-sm text-[#C99A5B]"
          >
            ABOUT SOLAÍS
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="leading-[0.95] text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(3.5rem,7vw,5.8rem)",
            }}
          >
            Where
            <br />
            Connection
            <br />
            <span className="italic text-[#C99A5B]">Meets Culture.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scaleX: 0.7 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.45 }}
            className="my-10 flex items-center gap-6 origin-left"
          >
            <span className="h-px w-20 bg-[#D5B27A]" />
            <span className="text-lg text-[#C99A5B]">◇</span>
            <span className="h-px w-20 bg-[#D5B27A]" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="max-w-xl text-lg leading-9 text-[#626262]"
          >
            Inspired by Africa and built around meaningful experiences, Solaís
            Lifestyle creates elegant spaces where people connect, celebrate and
            create unforgettable memories together.
          </motion.p>
        </motion.div>

        {/* Right */}

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
          className="relative w-full lg:w-1/2"
        >
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-[42px] border border-[#E7DCCF] shadow-[0_45px_90px_rgba(0,0,0,.08)]"
          >
            <div className="relative overflow-hidden">
              <motion.img
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.6 }}
                whileHover={{ scale: 1.05 }}
                src={homeLifestyle}
                alt="Solaís Lifestyle"
                className="h-[500px] w-full object-cover md:h-[650px] lg:h-[760px]"
              />

              {/* Editorial overlay */}

              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

              <div className="absolute inset-8 rounded-[32px] border border-white/30" />

              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-10 left-10"
              >
                <p className="uppercase tracking-[0.35em] text-xs text-white">
                  Born in Africa
                </p>

                <p className="mt-2 text-lg text-white/90">
                  Designed for Connection
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Floating Accent Card */}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ y: -5 }}
            className="absolute -bottom-8 -left-6 hidden rounded-[28px] bg-white/90 px-8 py-6 shadow-[0_20px_50px_rgba(0,0,0,.12)] backdrop-blur-xl lg:block"
          >
            <p
              className="text-[#C99A5B]"
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: "42px",
              }}
            >
              Since 2026
            </p>

            <p className="mt-1 uppercase tracking-[0.3em] text-xs text-[#162425]">
              Curating Experiences
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
