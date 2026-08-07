import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";

import gallery01 from "../../assets/gallery/gallery-01.jpg";
import gallery02 from "../../assets/gallery/gallery-02.jpg";
import gallery03 from "../../assets/gallery/gallery-03.jpg";
import gallery04 from "../../assets/gallery/gallery-04.jpg";
import gallery05 from "../../assets/gallery/gallery-05.jpg";
import gallery06 from "../../assets/gallery/gallery-06.jpg";
const images = [
  gallery01,
  gallery02,
  gallery03,
  gallery04,
  gallery05,
  gallery06,
];

export default function GalleryPreviewSection() {
  return (
    <section className="bg-[#FCFAF7] py-28 lg:py-36">
      <div className="mx-auto max-w-[1450px] px-6 md:px-10 xl:px-12">
        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-20 max-w-4xl text-center"
        >
          <p className="mb-5 text-sm uppercase tracking-[0.45em] text-[#C99A5B]">
            CAPTURED MOMENTS
          </p>

          <h2
            className="leading-none text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2.8rem,6vw,4.8rem)",
            }}
          >
            Every photograph
            <br />
            <span className="italic text-[#C99A5B]">tells a story.</span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-9 text-[#626262]">
            From elegant evenings to unforgettable celebrations, discover the
            atmosphere, people and moments that define the Solaís Lifestyle.
          </p>
        </motion.div>

        {/* Desktop Editorial Layout */}

        <div className="hidden gap-6 lg:grid lg:grid-cols-4 lg:grid-rows-2">
          {/* Hero */}

          <motion.div
            whileHover={{ y: -8 }}
            className="group relative col-span-2 row-span-2 overflow-hidden rounded-[38px]"
          >
            <img
              src={images[0]}
              alt=""
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent transition duration-500 group-hover:from-black/25" />

            <div className="absolute bottom-10 left-10">
              <p className="mb-3 uppercase tracking-[0.35em] text-xs text-white/70">
                Solaís Lifestyle
              </p>

              <h3
                className="text-white"
                style={{
                  fontFamily: "Cormorant Garamond",
                  fontSize: "clamp(2rem,3vw,3.5rem)",
                }}
              >
                Every gathering
                <br />
                has a story.
              </h3>
            </div>
          </motion.div>

          {images.slice(1).map((image, index) => (
            <motion.div
              key={index}
              whileHover={{
                y: -8,
              }}
              className="group relative overflow-hidden rounded-[30px]"
            >
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 border border-transparent transition duration-500 group-hover:border-[#C99A5B]" />

              <div className="absolute inset-0 bg-black/20 transition duration-500 group-hover:bg-black/5" />
            </motion.div>
          ))}
        </div>

        {/* Mobile Layout */}

        <div className="grid gap-5 lg:hidden">
          {images.map((image, index) => (
            <motion.div
              key={index}
              whileHover={{
                scale: 1.02,
              }}
              className="group overflow-hidden rounded-[28px]"
            >
              <img
                src={image}
                alt=""
                className="h-[340px] w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </motion.div>
          ))}
        </div>

        {/* CTA */}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="mt-20 text-center"
        >
          <Link
            to="/gallery"
            className="group inline-flex items-center gap-4 text-[#162425]"
          >
            <span className="uppercase tracking-[0.35em]">
              View Full Gallery
            </span>

            <FaArrowRight className="transition duration-300 group-hover:translate-x-2" />
          </Link>

          <div className="mx-auto mt-4 h-px w-40 bg-[#D9CCBD] transition-all duration-500 group-hover:w-56" />
        </motion.div>
      </div>
    </section>
  );
}
