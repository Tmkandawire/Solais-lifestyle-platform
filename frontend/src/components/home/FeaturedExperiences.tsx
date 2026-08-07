import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa6";
import { Link } from "react-router-dom";

import { fadeUp, stagger } from "../../utils/animations";

const experiences = [
  {
    category: "Lifestyle",
    title: "Exclusive Social Gatherings",
    description:
      "Elegant evenings designed for meaningful conversations, culture and unforgettable moments.",
  },
  {
    category: "Business",
    title: "Corporate Experiences",
    description:
      "Premium networking experiences connecting brands, entrepreneurs and industry leaders.",
  },
  {
    category: "Luxury",
    title: "Private Signature Events",
    description:
      "Carefully curated experiences tailored for intimate celebrations and exclusive occasions.",
  },
];

export default function FeaturedExperiences() {
  return (
    <section className="bg-white py-32">
      <div className="mx-auto max-w-7xl px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p
            variants={fadeUp}
            className="mb-4 uppercase tracking-[0.35em] text-[13px] text-[var(--color-accent)]"
          >
            Featured Experiences
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mb-20 flex flex-col justify-between gap-8 lg:flex-row lg:items-end"
          >
            <div>
              <h2 className="font-serif text-6xl leading-tight text-[var(--color-heading)]">
                Crafted with
                <br />
                intention.
              </h2>
            </div>

            <p className="max-w-md text-lg leading-8 text-[var(--color-body)]">
              Every experience is thoughtfully designed to create lasting
              memories, authentic relationships and timeless moments.
            </p>
          </motion.div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {experiences.map((experience, index) => (
            <motion.article
              key={experience.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[var(--color-background)] transition-all duration-500 hover:bg-[var(--color-primary)] hover:shadow-2xl"
            >
              <div className="h-72 bg-[var(--color-surface)] transition-all duration-500 group-hover:bg-[var(--color-primary-light)]" />

              <div className="p-10">
                <p className="mb-4 uppercase tracking-[0.3em] text-[12px] text-[var(--color-accent)]">
                  {experience.category}
                </p>

                <h3 className="mb-6 font-serif text-3xl text-[var(--color-heading)] transition-colors duration-500 group-hover:text-white">
                  {experience.title}
                </h3>

                <p className="mb-8 leading-8 text-[var(--color-body)] transition-colors duration-500 group-hover:text-white/80">
                  {experience.description}
                </p>

                <Link
                  to="/experiences"
                  className="inline-flex items-center gap-3 uppercase tracking-[0.25em] text-sm text-[var(--color-accent)]"
                >
                  Discover
                  <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-2" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
