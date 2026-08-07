import { motion } from "framer-motion";
import {
  PiSunHorizonBold,
  PiHandshakeBold,
  PiBriefcaseBold,
  PiSparkleBold,
  PiMusicNotesBold,
  PiForkKnifeBold,
  PiPaletteBold,
  PiCrownSimpleBold,
} from "react-icons/pi";

import Logo from "../branding/Logo";

const experiences = [
  {
    title: "Sunday Soirées",
    description:
      "Relaxed afternoons filled with conversation, music and unforgettable company.",
    icon: PiSunHorizonBold,
    accent: "from-[#F4D6A8] to-[#E7C07C]",
    large: true,
  },
  {
    title: "Networking Sessions",
    description:
      "Where professionals, entrepreneurs and visionaries naturally connect.",
    icon: PiHandshakeBold,
    accent: "from-[#D8E5D7] to-[#C7D8C6]",
  },
  {
    title: "Business Mixers",
    description:
      "Elegant evenings designed to spark meaningful collaborations.",
    icon: PiBriefcaseBold,
    accent: "from-[#D9E8F3] to-[#BFD8EC]", // Soft Executive Blue
  },

  {
    title: "Fashion Experiences",
    description:
      "Celebrating creativity, African style and contemporary elegance.",
    icon: PiSparkleBold,
    accent: "from-[#F5D7E8] to-[#EABFD7]", // Soft Blush Pink
    large: true,
  },

  {
    title: "Live Entertainment",
    description:
      "Exceptional performances that become the heartbeat of every gathering.",
    icon: PiMusicNotesBold,
    accent: "from-[#DDD4F4] to-[#C8B8EC]", // Lavender
  },

  {
    title: "Food & Lifestyle",
    description:
      "Curated dining experiences celebrating flavour, culture and conversation.",
    icon: PiForkKnifeBold,
    accent: "from-[#F8E5B9] to-[#F1D58A]", // Champagne Gold
  },

  {
    title: "Creative Showcases",
    description:
      "Giving artists, creators and innovators a stage to inspire others.",
    icon: PiPaletteBold,
    accent: "from-[#D6EFE7] to-[#B8E1D4]", // Mint Green
  },

  {
    title: "Private Events",
    description:
      "Exclusive celebrations tailored with elegance and attention to detail.",
    icon: PiCrownSimpleBold,
    accent: "from-[#E6D6F3] to-[#D3B8EA]", // Royal Lilac
    large: true,
  },
];

export default function SignatureExperiences() {
  return (
    <section className="bg-[#F8F5F0] py-24 lg:py-36">
      <div className="mx-auto max-w-[1500px] px-6 md:px-10 lg:px-12">
        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center lg:mb-24"
        >
          <p className="mb-5 text-sm uppercase tracking-[0.45em] text-[#C99A5B]">
            SIGNATURE EXPERIENCES
          </p>

          <h2
            className="text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(3rem,6vw,4.8rem)",
            }}
          >
            Every experience
            <br />
            tells a different story.
          </h2>
        </motion.div>

        {/* Grid */}

        <div
          className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
            xl:grid-cols-12
            xl:auto-rows-[420px]
            xl:gap-8
          "
        >
          {experiences.map((experience, index) => {
            const Icon = experience.icon;

            return (
              <motion.div
                key={experience.title}
                initial={{
                  opacity: 0,
                  y: 60,
                  filter: "blur(8px)",
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.8,
                }}
                whileHover={{
                  y: -10,
                }}
                className={`group relative overflow-hidden rounded-[28px] lg:rounded-[40px]
                border border-[#E6D8C7]
                bg-white
                shadow-[0_25px_70px_rgba(0,0,0,.05)]
                transition-all duration-700

                ${experience.large ? "xl:col-span-8" : "xl:col-span-4"}`}
              >
                {/* Image */}

                <div
                  className={`relative h-[220px] overflow-hidden bg-gradient-to-br md:h-[260px] xl:h-[58%] ${experience.accent}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.8 }}
                    className="flex h-full items-center justify-center"
                  >
                    <Logo
                      variant="light"
                      className="w-24 opacity-15 md:w-32 xl:w-40"
                    />
                  </motion.div>

                  <div className="absolute right-4 top-4 rounded-full bg-white/90 p-3 shadow-xl md:right-6 md:top-6 md:p-4">
                    <motion.div
                      animate={{
                        y: [0, -4, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                      }}
                      className="text-3xl text-[#C99A5B]"
                    >
                      <Icon />
                    </motion.div>
                  </div>
                </div>

                {/* Content */}

                <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
                  <div>
                    <h3
                      className="mb-4 text-[#162425]"
                      style={{
                        fontFamily: "Cormorant Garamond",
                        fontSize: "clamp(2rem,4vw,2.6rem)",
                      }}
                    >
                      {experience.title}
                    </h3>

                    <p className="max-w-lg leading-8 text-[#666]">
                      {experience.description}
                    </p>
                  </div>
                </div>

                {/* Hover Glow */}

                <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,154,91,.12),transparent_60%)]" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
