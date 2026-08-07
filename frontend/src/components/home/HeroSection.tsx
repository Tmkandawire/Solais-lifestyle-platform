import { FaArrowRight } from "react-icons/fa6";
import { Link } from "react-router-dom";

import Logo from "../branding/Logo";

export default function HeroSection() {
  return (
    <section className="bg-[var(--color-background)] pt-36">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-24 px-8 lg:grid-cols-2">
        {/* Left */}

        <div>
          <p className="mb-6 uppercase tracking-[0.35em] text-[13px] text-[var(--color-accent)]">
            Luxury Lifestyle Experiences
          </p>

          <h1 className="max-w-xl text-6xl leading-tight text-[var(--color-heading)] lg:text-7xl">
            Live beautifully.
            <br />
            Create unforgettable moments.
          </h1>

          <p className="mt-8 max-w-lg text-lg leading-9 text-[var(--color-body)]">
            Solaís Lifestyle curates premium experiences designed to bring
            together elegance, culture and meaningful human connection.
          </p>

          <div className="mt-12 flex gap-6">
            <Link
              to="/events"
              className="rounded-full bg-[var(--color-primary)] px-8 py-4 text-sm uppercase tracking-[0.25em] text-white transition hover:opacity-90"
            >
              Explore Events
            </Link>

            <Link
              to="/about"
              className="flex items-center gap-3 uppercase tracking-[0.2em] text-[var(--color-accent)]"
            >
              Our Story
              <FaArrowRight />
            </Link>
          </div>
        </div>

        {/* Right */}

        <div className="relative">
          <div className="rounded-[40px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-2xl">
            <div className="flex aspect-[4/5] items-center justify-center rounded-[30px] border border-dashed border-[var(--color-border)] bg-white">
              <Logo variant="light" className="w-64 opacity-30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
