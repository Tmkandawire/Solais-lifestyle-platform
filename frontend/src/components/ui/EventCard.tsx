import { motion } from "framer-motion";
import { FaArrowRight, FaCalendar, FaLocationDot } from "react-icons/fa6";

import Logo from "../branding/Logo";

export interface EventCardProps {
  category: string;
  title: string;
  date: string;
  location: string;
  description: string;
  featured?: boolean;
}

export default function EventCard({
  category,
  title,
  date,
  location,
  description,
  featured = false,
}: EventCardProps) {
  return (
    <motion.article
      whileHover={{ y: -12 }}
      transition={{ duration: 0.35 }}
      className={`group overflow-hidden rounded-[36px]
      border border-[#E5D8C8]
      bg-[#FCFAF7]
      shadow-[0_25px_70px_rgba(18,18,18,.06)]
      transition-all duration-500
      hover:shadow-[0_40px_90px_rgba(18,18,18,.12)]
      ${featured ? "lg:-mt-10" : "lg:mt-10"}`}
    >
      {/* Image */}

      <div className="relative h-[360px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F0E5D6] via-[#DFCFBA] to-[#C7AF93]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.35),transparent_65%)]" />

        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Logo variant="light" className="w-44 opacity-20" />
        </motion.div>

        <div className="absolute left-8 top-8">
          <span className="rounded-full border border-white/40 bg-white/15 px-5 py-2 text-[11px] uppercase tracking-[0.35em] text-white backdrop-blur-xl">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}

      <div className="p-10">
        <h3
          className="leading-none text-[#162425]"
          style={{
            fontFamily: "Cormorant Garamond",
            fontSize: "46px",
          }}
        >
          {title}
        </h3>

        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3 text-[#666]">
            <FaCalendar className="text-[#C99A5B]" />

            <span>{date}</span>
          </div>

          <div className="flex items-center gap-3 text-[#666]">
            <FaLocationDot className="text-[#C99A5B]" />

            <span>{location}</span>
          </div>
        </div>

        <p className="mt-8 leading-8 text-[#626262]">{description}</p>

        <button className="mt-10 flex items-center gap-3 uppercase tracking-[0.35em] text-[13px] font-medium text-[#162425] transition-all duration-300 group-hover:text-[#C99A5B]">
          Discover Experience
          <FaArrowRight className="transition duration-300 group-hover:translate-x-2" />
        </button>
      </div>
    </motion.article>
  );
}
