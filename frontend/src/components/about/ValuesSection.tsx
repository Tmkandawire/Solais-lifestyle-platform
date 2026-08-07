import { motion } from "framer-motion";
import {
  PiUsersThreeBold,
  PiHouseBold,
  PiSparkleBold,
  PiCrownSimpleBold,
  PiLightbulbBold,
  PiShieldCheckBold,
} from "react-icons/pi";

const values = [
  {
    icon: <PiUsersThreeBold />,
    title: "Connection",
    description:
      "Meaningful relationships begin by bringing the right people together.",
  },
  {
    icon: <PiHouseBold />,
    title: "Community",
    description:
      "We create welcoming spaces where everyone feels valued and connected.",
  },
  {
    icon: <PiSparkleBold />,
    title: "Experience",
    description:
      "Every detail is intentionally designed to create unforgettable moments.",
  },
  {
    icon: <PiCrownSimpleBold />,
    title: "Excellence",
    description:
      "Luxury is found in thoughtful execution and uncompromising quality.",
  },
  {
    icon: <PiLightbulbBold />,
    title: "Creativity",
    description:
      "Fresh ideas inspire experiences that feel unique every single time.",
  },
  {
    icon: <PiShieldCheckBold />,
    title: "Integrity",
    description:
      "Trust is earned through honesty, professionalism and consistency.",
  },
];

export default function ValuesSection() {
  return (
    <section className="bg-[#FCF9F5] py-24 lg:py-36">
      <div className="mx-auto max-w-[1500px] px-6 md:px-10 lg:px-12">
        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <p className="uppercase tracking-[0.45em] text-sm text-[#C99A5B]">
            OUR VALUES
          </p>

          <h2
            className="mt-5 leading-[0.95] text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(3rem,6vw,4.8rem)",
            }}
          >
            The principles behind
            <br />
            every experience.
          </h2>
        </motion.div>

        {/* Cards */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: index * 0.08,
              }}
              whileHover={{
                y: -10,
                scale: 1.02,
              }}
              className="group relative overflow-hidden rounded-[34px] border border-[#E4D7C7] bg-[#FBF8F4] p-8 shadow-[0_20px_50px_rgba(0,0,0,.05)] transition-all duration-500 md:p-10 lg:p-12"
            >
              {/* Glow */}

              <motion.div
                className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#C99A5B]/10 blur-[90px]"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                }}
              />

              <div className="relative">
                {/* Icon */}

                <motion.div
                  whileHover={{
                    rotate: 12,
                    scale: 1.15,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#F3ECE2] text-3xl text-[#C99A5B]"
                >
                  {value.icon}
                </motion.div>

                {/* Title */}

                <h3
                  className="mb-4 text-[#162425]"
                  style={{
                    fontFamily: "Cormorant Garamond",
                    fontSize: "clamp(2rem,4vw,2.5rem)",
                  }}
                >
                  {value.title}
                </h3>

                {/* Description */}

                <p className="leading-8 text-[#626262]">{value.description}</p>

                {/* Bottom Accent */}

                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: "70px" }}
                  transition={{ duration: 0.35 }}
                  className="mt-8 h-[2px] bg-[#C99A5B]"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
