import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";

import aboutImage from "../../assets/about/story-sunset.jpg.jpg";

export default function AboutSection() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 md:px-10 lg:grid-cols-2 lg:gap-24">
        {/* Image */}

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="order-2 lg:order-1"
        >
          <div className="overflow-hidden rounded-[36px] shadow-[0_30px_70px_rgba(0,0,0,.10)]">
            <img
              src={aboutImage}
              alt="Solaís Lifestyle"
              className="h-[520px] w-full object-cover transition duration-700 hover:scale-105"
            />
          </div>
        </motion.div>

        {/* Content */}

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="order-1 lg:order-2"
        >
          <span className="uppercase tracking-[0.35em] text-xs text-[#C99A5B]">
            Our Story
          </span>

          <h2
            className="mt-6 leading-tight text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2.8rem,5vw,4.8rem)",
            }}
          >
            Elevating everyday
            <br />
            moments into
            <br />
            <span className="italic text-[#C99A5B]">
              unforgettable experiences.
            </span>
          </h2>

          <p className="mt-8 text-lg leading-9 text-[#626262]">
            Solaís Lifestyle is a lifestyle and experiences brand that brings
            people together through thoughtfully curated events. We create
            spaces where professionals, entrepreneurs, creatives and communities
            connect, celebrate and build meaningful relationships.
          </p>

          <p className="mt-6 text-lg leading-9 text-[#626262]">
            Every gathering is intentionally designed with exceptional attention
            to detail, creating elegant, memorable and inspiring experiences
            that people look forward to and are proud to share.
          </p>

          <Link
            to="/about"
            className="group mt-12 inline-flex items-center gap-3 rounded-full border border-[#D9CCBD] px-8 py-4 uppercase tracking-[0.3em] text-sm transition-all duration-300 hover:border-[#C99A5B] hover:bg-[#162425] hover:text-white"
          >
            Discover More
            <FaArrowRight className="transition group-hover:translate-x-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
