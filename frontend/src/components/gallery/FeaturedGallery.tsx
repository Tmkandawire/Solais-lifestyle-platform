import { motion } from "framer-motion";

import gallery01 from "../../assets/gallery/gallery-01.jpg";
import gallery05 from "../../assets/gallery/gallery-08.jpg";
import gallery08 from "../../assets/gallery/gallery-12.jpg";
import gallery10 from "../../assets/gallery/gallery-02.jpg";

const featuredImages = [
  {
    image: gallery01,
    title: "Sunday Soirée",
    subtitle: "Meaningful Conversations",
    large: true,
  },
  {
    image: gallery05,
    title: "Elegant Evenings",
    subtitle: "Beautiful Atmospheres",
    large: false,
  },
  {
    image: gallery08,
    title: "Community",
    subtitle: "Connections That Last",
    large: false,
  },
  {
    image: gallery10,
    title: "Unforgettable Moments",
    subtitle: "Curated Experiences",
    large: true,
  },
];

export default function FeaturedGallery() {
  return (
    <section className="relative overflow-hidden bg-[#FBF8F4] py-24 sm:py-28 lg:py-36">
      {/* Ambient Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,154,91,.08),transparent_65%)]" />

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
          className="mb-16 text-center sm:mb-20 lg:mb-24"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
            FEATURED MOMENTS
          </p>

          <h2
            className="leading-[0.95] text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2.8rem,6vw,4.8rem)",
            }}
          >
            A glimpse into
            <br />
            <span className="italic text-[#C99A5B]">
              the Solaís experience.
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-[#626262] sm:text-lg sm:leading-9 lg:text-xl lg:leading-10">
            Every gathering tells a story through remarkable people, beautiful
            spaces and unforgettable moments.
          </p>
        </motion.div>

        {/* Gallery */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {featuredImages.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{
                opacity: 0,
                y: 50,
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
                delay: index * 0.12,
              }}
              whileHover={{
                y: -8,
              }}
              className={`
                group relative overflow-hidden rounded-[32px]
                border border-[#E7DCCF]
                shadow-[0_30px_80px_rgba(0,0,0,.08)]

                ${item.large ? "lg:col-span-7" : "lg:col-span-5"}
              `}
            >
              <div
                className={`
                  relative overflow-hidden

                  ${
                    item.large
                      ? "h-[420px] sm:h-[500px] lg:h-[540px]"
                      : "h-[340px] sm:h-[400px] lg:h-[540px]"
                  }
                `}
              >
                <motion.img
                  whileHover={{
                    scale: 1.06,
                  }}
                  transition={{
                    duration: 1,
                  }}
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#162425]/80 via-[#162425]/20 to-transparent" />

                <div className="absolute bottom-0 left-0 p-6 sm:p-8 lg:p-10">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-[#C99A5B] sm:text-xs">
                    Gallery
                  </p>

                  <h3
                    className="mt-3 text-white"
                    style={{
                      fontFamily: "Cormorant Garamond",
                      fontSize: "clamp(2rem,4vw,3.2rem)",
                    }}
                  >
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm text-white/80 sm:text-base">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
