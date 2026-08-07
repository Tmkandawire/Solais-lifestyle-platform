import { motion } from "framer-motion";

export default function VisionMission() {
  return (
    <section className="bg-[#F7F3ED] py-24 lg:py-36">
      <div className="mx-auto max-w-[1500px] px-6 md:px-10 lg:px-12">
        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <p className="uppercase tracking-[0.45em] text-sm text-[#C99A5B]">
            OUR DIRECTION
          </p>

          <h2
            className="mt-5 leading-[0.95] text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(3rem,6vw,4.6rem)",
            }}
          >
            Driven by purpose.
            <br />
            Guided by people.
          </h2>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          {/* Vision */}

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            whileHover={{
              y: -10,
            }}
            className="group relative overflow-hidden rounded-[40px] border border-[#E5D9CA] bg-[#FBF8F4] p-8 shadow-[0_25px_60px_rgba(0,0,0,.05)] transition-all duration-500 md:p-12 lg:p-16"
          >
            <motion.div
              animate={{
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
              }}
              className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#C99A5B]/10 blur-[100px]"
            />

            <motion.span
              whileHover={{
                rotate: 180,
                scale: 1.1,
              }}
              transition={{
                duration: 0.6,
              }}
              className="relative inline-block text-5xl text-[#C99A5B]"
            >
              ☼
            </motion.span>

            <p className="relative mt-8 uppercase tracking-[0.45em] text-[#C99A5B]">
              OUR VISION
            </p>

            <h3
              className="relative mt-6 text-[#162425]"
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: "clamp(2rem,4vw,2.9rem)",
              }}
            >
              Building Africa's next lifestyle brand.
            </h3>

            <p className="relative mt-8 text-lg leading-9 text-[#646464]">
              To become Africa's leading lifestyle and experiences brand,
              creating communities through meaningful connections and
              unforgettable experiences.
            </p>
          </motion.div>

          {/* Mission */}

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: 0.15,
            }}
            whileHover={{
              y: -10,
            }}
            className="group relative overflow-hidden rounded-[40px] border border-[#E5D9CA] bg-[#FBF8F4] p-8 shadow-[0_25px_60px_rgba(0,0,0,.05)] transition-all duration-500 md:p-12 lg:p-16"
          >
            <motion.div
              animate={{
                rotate: [0, -10, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
              }}
              className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-[#C99A5B]/10 blur-[100px]"
            />

            <motion.span
              whileHover={{
                rotate: -180,
                scale: 1.1,
              }}
              transition={{
                duration: 0.6,
              }}
              className="relative inline-block text-5xl text-[#C99A5B]"
            >
              ✦
            </motion.span>

            <p className="relative mt-8 uppercase tracking-[0.45em] text-[#C99A5B]">
              OUR MISSION
            </p>

            <h3
              className="relative mt-6 text-[#162425]"
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: "clamp(2rem,4vw,2.9rem)",
              }}
            >
              Creating moments people remember.
            </h3>

            <p className="relative mt-8 text-lg leading-9 text-[#646464]">
              To curate exceptional experiences that inspire connection,
              celebrate culture, support businesses and bring people together in
              welcoming, thoughtfully designed environments.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
