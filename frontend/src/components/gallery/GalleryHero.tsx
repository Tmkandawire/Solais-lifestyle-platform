import { motion } from "framer-motion";
import galleryHero from "../../assets/gallery/gallery-13.jpg";

export default function GalleryHero() {
  return (
    <section className="relative overflow-hidden bg-[#F8F5F0]">
      {/* Ambient Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,154,91,.12),transparent_65%)]" />

      <div className="relative mx-auto max-w-[1500px] px-6 pt-28 pb-20 sm:px-8 sm:pt-32 lg:px-12 lg:pt-40 lg:pb-28">
        {/* Heading */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
            filter: "blur(8px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.9,
          }}
          className="mx-auto max-w-5xl text-center"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
            GALLERY
          </p>

          <h1
            className="leading-none text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(3.6rem,8vw,7rem)",
            }}
          >
            Every moment
            <br />
            <span className="italic text-[#C99A5B]">tells a story.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-[#626262] sm:mt-10 sm:text-lg sm:leading-9 lg:text-xl lg:leading-10">
            Explore a collection of unforgettable evenings, meaningful
            conversations and beautifully curated experiences that capture the
            spirit of Solaís Lifestyle.
          </p>
        </motion.div>

        {/* Editorial Hero Image */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.3,
            duration: 0.9,
          }}
          className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-[28px] border border-[#E7DCCF] shadow-[0_40px_90px_rgba(0,0,0,.08)] sm:mt-20 sm:rounded-[36px] lg:rounded-[42px]"
        >
          <motion.img
            whileHover={{
              scale: 1.04,
            }}
            transition={{
              duration: 0.9,
            }}
            src={galleryHero}
            alt="Solaís Lifestyle Gallery"
            className="aspect-[16/10] w-full object-cover"
          />
        </motion.div>

        {/* Editorial Caption */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.6,
          }}
          className="mx-auto mt-10 max-w-3xl text-center"
        >
          <div className="mb-6 flex items-center justify-center gap-4 sm:gap-6">
            <div className="h-px w-12 bg-[#D9CDBD] sm:w-20 lg:w-28" />

            <span className="text-[#C99A5B]">☼</span>

            <div className="h-px w-12 bg-[#D9CDBD] sm:w-20 lg:w-28" />
          </div>

          <p className="text-[11px] uppercase tracking-[0.35em] text-[#8A7B68] sm:text-xs sm:tracking-[0.45em]">
            Every photograph captures more than a moment — it captures a story.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
