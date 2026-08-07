import { motion } from "framer-motion";
import aboutDrinks from "../../assets/about/about-drinks.jpg.jpg";

export default function OurStory() {
  return (
    <section className="bg-[#F7F3ED] py-24 lg:py-36">
      <div className="mx-auto grid max-w-[1500px] items-center gap-16 px-6 md:px-10 lg:grid-cols-2 lg:gap-24 lg:px-12">
        {/* Left */}

        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-6 text-xs uppercase tracking-[0.45em] text-[#C99A5B]">
            OUR STORY
          </p>

          <h2
            className="leading-[0.95] text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(3rem,6vw,4.8rem)",
            }}
          >
            Every great
            <br />
            community begins
            <br />
            <span className="italic text-[#C99A5B]">with a conversation.</span>
          </h2>

          <div className="mt-10 space-y-8 text-lg leading-9 text-[#626262] lg:text-xl lg:leading-[2]">
            <p>
              Solaís Lifestyle was founded with a simple vision—to create
              meaningful experiences that bring people together.
            </p>

            <p>
              Inspired by the belief that genuine relationships flourish in
              thoughtfully designed environments, we curate gatherings where
              professionals, entrepreneurs, creatives and communities connect
              naturally.
            </p>

            <p>
              Every experience combines elegant settings, memorable hospitality,
              engaging entertainment and authentic human connection—creating
              moments people remember long after the evening ends.
            </p>
          </div>
        </motion.div>

        {/* Right */}

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <motion.div
            whileHover={{
              y: -8,
            }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-[42px] border border-[#E6DACB] shadow-[0_35px_80px_rgba(0,0,0,.08)]"
          >
            <div className="relative overflow-hidden">
              <motion.img
                src={aboutDrinks}
                alt="Guests enjoying a Solaís Lifestyle experience"
                initial={{ scale: 1.15 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 1.5 }}
                whileHover={{ scale: 1.05 }}
                className="h-[450px] w-full object-cover md:h-[620px] lg:h-[760px]"
              />

              {/* Editorial Overlay */}

              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

              <div className="absolute inset-8 rounded-[32px] border border-white/25" />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-10 left-10"
              >
                <p className="text-xs uppercase tracking-[0.4em] text-white">
                  Rooted In Africa
                </p>

                <h3
                  className="mt-4 text-white"
                  style={{
                    fontFamily: "Cormorant Garamond",
                    fontSize: "clamp(2rem,4vw,3.4rem)",
                  }}
                >
                  Beautifully crafted
                  <br />
                  experiences inspired
                  <br />
                  by people.
                </h3>
              </motion.div>
            </div>
          </motion.div>

          {/* Floating Card */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ y: -5 }}
            className="absolute -bottom-8 left-8 hidden rounded-[28px] bg-white/95 px-8 py-7 shadow-[0_25px_60px_rgba(0,0,0,.10)] backdrop-blur-xl lg:block"
          ></motion.div>
        </motion.div>
      </div>
    </section>
  );
}
