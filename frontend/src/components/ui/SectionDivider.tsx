import { motion } from "framer-motion";

interface SectionDividerProps {
  variant?: "light" | "dark";
}

export default function SectionDivider({
  variant = "light",
}: SectionDividerProps) {
  const line = variant === "dark" ? "bg-white/10" : "bg-[#D8C8AE]/70";

  const icon = variant === "dark" ? "text-[#C99A5B]" : "text-[#C99A5B]";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex justify-center py-6"
    >
      <div className="flex w-full max-w-2xl items-center">
        <span className={`h-px flex-1 opacity-60 ${line}`} />

        <span className={`mx-6 text-lg leading-none ${icon} select-none`}>
          ☼
        </span>

        <span className={`h-px flex-1 opacity-60 ${line}`} />
      </div>
    </motion.div>
  );
}
