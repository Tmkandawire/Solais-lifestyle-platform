import { motion } from "framer-motion";

import ShowcaseImage from "../../assets/home/hero-drinks.jpg.jpg";

export default function LifestyleShowcase() {
  return (
    <section className="relative overflow-hidden bg-white py-36 lg:py-44">
      <div className="mx-auto max-w-[1700px] px-6 md:px-10 xl:px-12">
        <motion.div
          initial={{
            opacity: 0,
            y: 80,
            filter: "blur(10px)",
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 1,
          }}
          className="group relative overflow-hidden rounded-[42px]"
        >
          {/* Image */}

          <img
            src={ShowcaseImage}
            alt="Solaís Lifestyle"
            className="h-[700px] w-full object-cover transition duration-[4000ms] group-hover:scale-105"
          />

          {/* Overlay */}

          <div className="absolute inset-0 bg-gradient-to-r from-[#162425]/80 via-[#162425]/20 to-transparent" />

          {/* Gold Glow */}

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(201,154,91,.22),transparent_60%)]" />

          {/* Content */}

          <motion.div
            initial={{
              opacity: 0,
              x: -50,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.3,
            }}
            className="absolute left-0 top-0 flex h-full max-w-2xl items-center px-10 md:px-16"
          >
            <div>
              <p className="mb-6 uppercase tracking-[0.45em] text-[#C99A5B]">
                MORE THAN EVENTS
              </p>

              <h2
                className="leading-none text-white"
                style={{
                  fontFamily: "Cormorant Garamond",
                  fontSize: "clamp(3rem,6vw,5.5rem)",
                }}
              >
                Every gathering
                <br />
                tells a<span className="italic text-[#C99A5B]"> story.</span>
              </h2>

              <p className="mt-10 max-w-xl text-lg leading-9 text-white/80">
                From elegant networking evenings to unforgettable lifestyle
                experiences, every Solaís event is intentionally designed to
                bring remarkable people together.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
