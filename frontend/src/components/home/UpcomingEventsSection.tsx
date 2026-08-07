import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa6";

import eventHero from "../../assets/event/event-hero.jpg.jpg";
import eventCrowd from "../../assets/event/event-crowd.jpg.jpg";
import eventTables from "../../assets/event/event-tables.jpg.jpg";

const upcomingEvents = [
  {
    image: eventHero,
    category: "Signature Experience",
    title: "Private Soirée",
    date: "12 September 2026",
    location: "Lusaka, Zambia",
    description:
      "An intimate evening celebrating culture, conversation and exceptional hospitality.",
  },
  {
    image: eventCrowd,
    category: "Luxury Gathering",
    title: "Sunset Social",
    date: "26 September 2026",
    location: "Livingstone, Zambia",
    description:
      "Golden hour networking paired with fine dining and unforgettable ambience.",
  },
  {
    image: eventTables,
    category: "Exclusive Brunch",
    title: "Brunch Affair",
    date: "10 October 2026",
    location: "Lusaka, Zambia",
    description:
      "A refined weekend experience where lifestyle, food and community meet.",
  },
];

export default function UpcomingEventsSection() {
  return (
    <section className="bg-[#FCFAF7] py-28 lg:py-40">
      <div className="mx-auto max-w-[1450px] px-6 md:px-10 xl:px-12">
        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-24 max-w-4xl text-center"
        >
          <p className="mb-5 text-sm uppercase tracking-[0.45em] text-[#C99A5B]">
            MOMENTS AWAIT
          </p>

          <h2
            className="leading-none text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2.8rem,6vw,4.8rem)",
            }}
          >
            The Next Extraordinary
            <br />
            <span className="italic text-[#C99A5B]">Gatherings</span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-9 text-[#626262]">
            Every Solaís experience is thoughtfully curated to bring together
            remarkable people in extraordinary settings.
          </p>
        </motion.div>

        {/* Events */}

        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
          {upcomingEvents.map((event, index) => (
            <motion.article
              key={event.title}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
              }}
              whileHover={{
                y: -10,
              }}
              className="group overflow-hidden rounded-[34px] border border-[#E7DCCF] bg-white shadow-[0_30px_80px_rgba(0,0,0,.08)]"
            >
              {/* Image */}

              <div className="relative overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-[420px] w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

                <div className="absolute left-8 top-8">
                  <span className="rounded-full border border-white/40 bg-white/15 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-white backdrop-blur-md">
                    {event.category}
                  </span>
                </div>
              </div>

              {/* Content */}

              <div className="p-8">
                <p className="mb-3 uppercase tracking-[0.28em] text-xs text-[#C99A5B]">
                  {event.location}
                </p>

                <h3
                  className="mb-4 text-[#162425]"
                  style={{
                    fontFamily: "Cormorant Garamond",
                    fontSize: "clamp(2rem,4vw,2.8rem)",
                  }}
                >
                  {event.title}
                </h3>

                <p className="mb-6 text-[#7B7B7B]">{event.date}</p>

                <p className="leading-8 text-[#626262]">{event.description}</p>

                <button className="group mt-10 inline-flex items-center gap-3 uppercase tracking-[0.28em] text-sm text-[#162425] transition">
                  Discover Experience
                  <FaArrowRight className="transition duration-300 group-hover:translate-x-2" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
