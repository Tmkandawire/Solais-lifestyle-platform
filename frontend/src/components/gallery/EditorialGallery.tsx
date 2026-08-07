import { motion } from "framer-motion";

import gallery02 from "../../assets/gallery/gallery-02.jpg";
import gallery03 from "../../assets/gallery/gallery-03.jpg";
import gallery04 from "../../assets/gallery/gallery-04.jpg";
import gallery06 from "../../assets/gallery/gallery-06.jpg";
import gallery07 from "../../assets/gallery/gallery-07.jpg";
import gallery09 from "../../assets/gallery/gallery-09.jpg";
import gallery11 from "../../assets/gallery/gallery-11.jpg";
import gallery12 from "../../assets/gallery/gallery-12.jpg";

const gallery = [
  {
    image: gallery02,
    title: "Elegant Evenings",
  },
  {
    image: gallery04,
    title: "Shared Conversations",
  },
  {
    image: gallery03,
    title: "Fashion Experience",
  },
  {
    image: gallery09,
    title: "Luxury Dining",
  },
  {
    image: gallery07,
    title: "Sunday Soirée",
  },
  {
    image: gallery06,
    title: "Beautiful Moments",
  },
  {
    image: gallery11,
    title: "Business Mixer",
  },
  {
    image: gallery12,
    title: "Live Entertainment",
  },
];

export default function EditorialGallery() {
  return (
    <section className="relative overflow-hidden bg-[#FBF8F4] py-24 sm:py-28 lg:py-36">
      {/* Ambient Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,154,91,.06),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
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
          className="mb-16 text-center sm:mb-20"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
            MORE MOMENTS
          </p>

          <h2
            className="leading-[0.95] text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2.7rem,6vw,4.8rem)",
            }}
          >
            Every gathering leaves
            <br />
            <span className="italic text-[#C99A5B]">a lasting impression.</span>
          </h2>
        </motion.div>

        {/* Gallery */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {gallery.map((item, index) => (
            <motion.div
              key={item.title}
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
              transition={{
                duration: 0.8,
                delay: index * 0.08,
              }}
              whileHover={{
                y: -8,
              }}
              className="group overflow-hidden rounded-[30px] border border-[#E7DCCF] bg-white shadow-[0_25px_70px_rgba(0,0,0,.08)]"
            >
              <div className="relative h-[340px] overflow-hidden sm:h-[400px]">
                <motion.img
                  whileHover={{
                    scale: 1.05,
                  }}
                  transition={{
                    duration: 1,
                  }}
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#162425]/75 via-[#162425]/20 to-transparent" />

                <div className="absolute bottom-0 left-0 p-6 sm:p-8">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-[#C99A5B]">
                    Gallery
                  </p>

                  <h3
                    className="mt-3 text-white"
                    style={{
                      fontFamily: "Cormorant Garamond",
                      fontSize: "clamp(2rem,3vw,2.8rem)",
                    }}
                  >
                    {item.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Closing Divider */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
          }}
          className="mt-24 text-center"
        >
          <div className="mb-8 flex items-center justify-center gap-6">
            <div className="h-px w-16 bg-[#D8C8AE] sm:w-24 lg:w-32" />

            <motion.span
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="text-[#C99A5B]"
            >
              ☼
            </motion.span>

            <div className="h-px w-16 bg-[#D8C8AE] sm:w-24 lg:w-32" />
          </div>

          <p
            className="text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2rem,4vw,3.4rem)",
            }}
          >
            Thank you for being
            <span className="italic text-[#C99A5B]"> part of the story.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
