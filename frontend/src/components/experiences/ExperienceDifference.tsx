import { motion } from "framer-motion";
import {
  PiSparkleBold,
  PiUsersThreeBold,
  PiWineBold,
  PiSunHorizonBold,
} from "react-icons/pi";

const features = [
  {
    icon: PiSparkleBold,
    title: "Thoughtfully Curated",
    quote: "Every detail matters.",
    description:
      "Every Solaís experience is intentionally designed with beautiful venues, elegant details and seamless hospitality that allow every guest to simply enjoy the moment.",
  },
  {
    icon: PiUsersThreeBold,
    title: "Meaningful Connections",
    quote: "Where relationships begin.",
    description:
      "From entrepreneurs and creatives to professionals and communities, we create environments where authentic relationships naturally flourish.",
  },
  {
    icon: PiWineBold,
    title: "Exceptional Hospitality",
    quote: "Every guest feels at home.",
    description:
      "Whether it's fine dining, curated cocktails or attentive service, every detail contributes to an atmosphere of effortless luxury.",
  },
  {
    icon: PiSunHorizonBold,
    title: "Moments That Last",
    quote: "Memories worth returning for.",
    description:
      "Long after the evening ends, the conversations, friendships and memories remain. That's the true Solaís experience.",
  },
];

export default function ExperienceDifference() {
  return (
    <section className="relative overflow-hidden bg-[#FBF8F4] py-24 md:py-32 lg:py-40">
      {/* Background Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,154,91,.06),transparent_70%)]" />

      <div className="relative mx-auto max-w-[1450px] px-6 sm:px-8 lg:px-12">
        {/* Heading */}

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
          className="mb-16 text-center md:mb-24 lg:mb-36"
        >
          <p className="mb-6 uppercase tracking-[0.45em] text-[#C99A5B]">
            THE SOLAÍS DIFFERENCE
          </p>

          <h2
            className="text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2.8rem,5vw,4.6rem)",
            }}
          >
            Luxury isn't created
            <br />
            by chance.
          </h2>
        </motion.div>

        {/* Features */}

        <div className="space-y-20 md:space-y-28 lg:space-y-40 xl:space-y-52">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{
                  opacity: 0,
                  y: 60,
                  filter: "blur(10px)",
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.15,
                }}
                className={`grid items-center gap-10 md:gap-14 lg:gap-20 lg:grid-cols-2 ${
                  index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                {/* Illustration */}

                <motion.div
                  whileHover={{
                    scale: 1.02,
                    y: -8,
                  }}
                  transition={{ duration: 0.6 }}
                  className="group relative overflow-hidden rounded-[28px] border border-[#E6DACB] bg-gradient-to-br from-[#F8F2E8] via-[#EFE3D3] to-[#E4D3BD] shadow-[0_30px_70px_rgba(0,0,0,.08)] lg:rounded-[42px]"
                >
                  {/* Ambient Glow */}

                  <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#D8AF6D]/20 blur-3xl" />

                  <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-white/20 blur-3xl" />

                  {/* Luxury Texture */}

                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle,#C99A5B 1px,transparent 1px)",
                      backgroundSize: "28px 28px",
                    }}
                  />

                  {/* Floating Particles */}

                  <motion.div
                    animate={{ y: [0, -18, 0] }}
                    transition={{
                      duration: 9,
                      repeat: Infinity,
                    }}
                    className="absolute left-16 top-16 h-3 w-3 rounded-full bg-[#D8AF6D]/40"
                  />

                  <motion.div
                    animate={{ y: [0, 15, 0] }}
                    transition={{
                      duration: 11,
                      repeat: Infinity,
                    }}
                    className="absolute bottom-24 right-20 h-2 w-2 rounded-full bg-white/60"
                  />

                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                    }}
                    className="absolute right-32 top-28 h-4 w-4 rounded-full bg-[#C99A5B]/25"
                  />

                  {/* Content */}

                  <div className="relative flex h-[320px] flex-col items-center justify-center sm:h-[380px] lg:h-[430px]">
                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, 3, 0],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="rounded-full border border-white/60 bg-white/75 p-6 shadow-[0_20px_50px_rgba(0,0,0,.12)] backdrop-blur-xl sm:p-8 lg:p-10"
                    >
                      <Icon className="text-4xl text-[#C99A5B] sm:text-5xl lg:text-6xl" />
                    </motion.div>

                    <div className="mt-8 text-center lg:mt-12">
                      <p className="text-xs uppercase tracking-[0.45em] text-[#162425]/55 sm:text-sm">
                        {feature.quote}
                      </p>

                      <p
                        className="mt-4 text-[#C99A5B]"
                        style={{
                          fontFamily: "Cormorant Garamond",
                          fontSize: "clamp(1.5rem,2.5vw,2.1rem)",
                        }}
                      ></p>
                    </div>
                  </div>

                  {/* Hover Glow */}

                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.25),transparent_65%)] opacity-0 transition duration-700 group-hover:opacity-100" />
                </motion.div>

                {/* Text */}

                <motion.div
                  initial={{
                    opacity: 0,
                    x: index % 2 === 0 ? -40 : 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: 0.2,
                  }}
                >
                  <p className="mb-4 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
                    0{index + 1}
                  </p>

                  <h3
                    className="mb-5 text-[#162425]"
                    style={{
                      fontFamily: "Cormorant Garamond",
                      fontSize: "clamp(2.2rem,4vw,3.6rem)",
                    }}
                  >
                    {feature.title}
                  </h3>

                  <div className="mb-8 h-px w-28 bg-gradient-to-r from-[#C99A5B] to-transparent" />

                  <p className="max-w-xl text-base leading-8 text-[#626262] sm:text-lg sm:leading-9 lg:text-xl lg:leading-10">
                    {feature.description}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
