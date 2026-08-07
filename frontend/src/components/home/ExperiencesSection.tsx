import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa6";
import socialSoirees from "../../assets/experiences/creative.jpg.jpg";
import privateGatherings from "../../assets/experiences/soiree.jpg.jpg";
import luxuryEscapes from "../../assets/experiences/private-events.jpg.jpg";

const experiences = [
  {
    id: "01",
    title: "Social Soirées",
    image: socialSoirees,
    description:
      "Elegant evenings where conversation, culture and beautiful living come together in unforgettable settings.",
  },
  {
    id: "02",
    title: "Private Gatherings",
    image: privateGatherings,
    description:
      "Thoughtfully curated celebrations designed around life's most meaningful occasions with refined attention to every detail.",
  },
  {
    id: "03",
    title: "Luxury Escapes",
    image: luxuryEscapes,
    description:
      "Exclusive travel and lifestyle experiences crafted for discovery, relaxation and extraordinary memories.",
  },
];

export default function ExperiencesSection() {
  return (
    <section className="bg-white py-40">
      <div className="mx-auto max-w-[1500px] px-12">
        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-28 text-center"
        >
          <p className="mb-5 uppercase tracking-[0.45em] text-[#C99A5B] text-sm">
            SIGNATURE EXPERIENCES
          </p>

          <h2
            className="leading-none text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2.8rem,6vw,4.5rem)",
            }}
          >
            Experiences designed
            <br />
            <span className="italic text-[#C99A5B]">to become stories.</span>
          </h2>
        </motion.div>

        {/* Experience Blocks */}

        <div className="space-y-40">
          {experiences.map((experience, index) => (
            <motion.div
              key={experience.id}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className={`grid items-center gap-20 lg:grid-cols-2 ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Text */}

              <div>
                <p
                  className="mb-6 text-[#C99A5B]"
                  style={{
                    fontFamily: "Cormorant Garamond",
                    fontSize: "clamp(3rem,6vw,4.5rem)",
                  }}
                >
                  {experience.id}
                </p>

                <h3
                  className="mb-6 text-[#162425]"
                  style={{
                    fontFamily: "Cormorant Garamond",
                    fontSize: "clamp(2rem,4vw,3.2rem)",
                  }}
                >
                  {experience.title}
                </h3>

                <p className="max-w-lg leading-8 text-[#626262]">
                  {experience.description}
                </p>

                <button className="group mt-10 inline-flex items-center gap-3 uppercase tracking-[0.28em] text-[#162425] transition">
                  Discover More
                  <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-2" />
                </button>
              </div>

              {/* Image */}

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5 }}
                className="group overflow-hidden rounded-[40px] border border-[#E7DCCF] shadow-[0_30px_80px_rgba(0,0,0,.08)]"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={experience.image}
                    alt={experience.title}
                    className="h-[620px] w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                  <div className="absolute inset-8 rounded-[28px] border border-white/30" />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-40 text-center"
        >
          <h3
            className="text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2.5rem,5vw,3.8rem)",
            }}
          >
            Ready to experience Solaís?
          </h3>

          <p className="mx-auto mt-6 max-w-2xl leading-8 text-[#626262]">
            Discover upcoming events and become part of a community that values
            elegance, connection and unforgettable experiences.
          </p>

          <button className="mt-12 rounded-full bg-[#162425] px-12 py-5 text-sm uppercase tracking-[0.3em] text-white transition-all duration-500 hover:-translate-y-1 hover:bg-[#C99A5B]">
            Explore Upcoming Events
          </button>
        </motion.div>
      </div>
    </section>
  );
}
