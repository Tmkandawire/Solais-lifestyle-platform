import { motion } from "framer-motion";
import { PiArrowUpRightBold } from "react-icons/pi";

import gallery07 from "../../assets/gallery/gallery-07.jpg";
import gallery11 from "../../assets/gallery/gallery-11.jpg";
import gallery04 from "../../assets/gallery/gallery-04.jpg";
import gallery12 from "../../assets/gallery/gallery-12.jpg";

const gallery = [
  {
    title: "Sunday Soirée",
    subtitle: "Meaningful Conversations",
    image: gallery07,
    height: "h-[420px] sm:h-[520px] lg:h-[620px]",
    span: "col-span-1 lg:col-span-7",
  },
  {
    title: "Business Mixer",
    subtitle: "Where Ideas Connect",
    image: gallery11,
    height: "h-[320px] lg:h-[300px]",
    span: "col-span-1 lg:col-span-5",
  },
  {
    title: "Fashion Experience",
    subtitle: "African Elegance",
    image: gallery04,
    height: "h-[320px] lg:h-[300px]",
    span: "col-span-1 lg:col-span-5",
  },
  {
    title: "Live Entertainment",
    subtitle: "Moments Worth Remembering",
    image: gallery12,
    height: "h-[420px] sm:h-[520px] lg:h-[620px]",
    span: "col-span-1 lg:col-span-7",
  },
];

export default function GalleryPreview() {
  return (
    <section className="relative overflow-hidden bg-[#F8F5F0] py-20 sm:py-24 lg:py-32">
      {/* Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,154,91,.06),transparent_70%)]" />

      <div className="relative mx-auto max-w-[1650px] px-6 sm:px-8 lg:px-12">
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
          transition={{
            duration: 0.8,
          }}
          className="mb-16 text-center sm:mb-20 lg:mb-28"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
            GALLERY PREVIEW
          </p>

          <h2
            className="text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(3rem,6vw,4.875rem)",
            }}
          >
            Moments
            <br />
            <span className="italic text-[#C99A5B]">worth remembering.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#626262] sm:mt-8 sm:text-lg sm:leading-9 lg:mt-10 lg:text-xl lg:leading-10">
            Every gathering tells a story through beautiful people, remarkable
            experiences and unforgettable memories.
          </p>
        </motion.div>

        {/* Editorial Gallery */}

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12">
          {gallery.map((image, index) => (
            <motion.div
              key={image.title}
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
                duration: 0.8,
                delay: index * 0.12,
              }}
              whileHover={{
                y: -10,
              }}
              className={image.span}
            >
              <div
                className={`group relative overflow-hidden rounded-[28px] lg:rounded-[42px]
                ${image.height}
                border border-[#E7DCCF]
                shadow-[0_40px_90px_rgba(0,0,0,.07)]`}
              >
                {/* Image */}

                <motion.img
                  whileHover={{
                    scale: 1.08,
                  }}
                  transition={{
                    duration: 1,
                  }}
                  src={image.image}
                  alt={image.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Pattern */}

                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle,#C99A5B 1px,transparent 1px)",
                    backgroundSize: "34px 34px",
                  }}
                />

                {/* Glow */}

                <div className="absolute -top-12 right-0 h-72 w-72 rounded-full bg-[#D8AF6D]/20 blur-[100px]" />

                {/* Hover Overlay */}

                <div
                  className="
                  absolute inset-0
                  flex flex-col
                  justify-end
                  bg-gradient-to-t
                  from-[#162425]/90
                  via-[#162425]/30
                  to-transparent
                  p-6
                  sm:p-8
                  lg:p-10
                  opacity-0
                  transition-all
                  duration-700
                  group-hover:opacity-100"
                >
                  <motion.div
                    initial={{
                      y: 20,
                    }}
                    whileHover={{
                      y: 0,
                    }}
                    className="max-w-sm"
                  >
                    <p className="text-xs uppercase tracking-[0.4em] text-[#C99A5B]">
                      Gallery
                    </p>

                    <h3
                      className="mt-3 text-white"
                      style={{
                        fontFamily: "Cormorant Garamond",
                        fontSize: "clamp(2rem,4vw,3rem)",
                      }}
                    >
                      {image.title}
                    </h3>

                    <p className="mt-4 text-white/75">{image.subtitle}</p>

                    <button className="mt-8 flex items-center gap-3 text-sm uppercase tracking-[0.35em] text-white">
                      View Gallery
                      <PiArrowUpRightBold className="transition duration-500 group-hover:rotate-45" />
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Statement */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
          }}
          className="mt-20 text-center sm:mt-28 lg:mt-36"
        >
          <div className="mb-8 flex items-center justify-center gap-4 sm:gap-6 lg:mb-10">
            <div className="h-px w-16 bg-[#DDD2C3] sm:w-24 lg:w-32" />

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

            <div className="h-px w-16 bg-[#DDD2C3] sm:w-24 lg:w-32" />
          </div>

          <h3
            className="text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2.5rem,5vw,3.375rem)",
            }}
          >
            Beautiful moments deserve
            <span className="italic text-[#C99A5B]"> beautiful memories.</span>
          </h3>
        </motion.div>
      </div>
    </section>
  );
}
