const standards = [
  {
    number: "01",
    title: "Curated Experiences",
    description:
      "Every gathering is intentionally designed to inspire meaningful conversations, unforgettable moments and refined experiences.",
  },
  {
    number: "02",
    title: "Authentic Community",
    description:
      "We bring together ambitious, creative and like-minded individuals through experiences that encourage genuine human connection.",
  },
  {
    number: "03",
    title: "Timeless Memories",
    description:
      "Luxury is not simply what you attend—it is how every moment makes you feel long after the experience ends.",
  },
];

export default function SolaisStandard() {
  return (
    <section className="bg-[var(--color-background)] py-32">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-20 max-w-3xl">
          <p className="mb-4 uppercase tracking-[0.35em] text-[13px] text-[var(--color-accent)]">
            The Solaís Standard
          </p>

          <h2 className="text-5xl leading-tight text-[var(--color-heading)]">
            More than events.
            <br />
            We create experiences worth remembering.
          </h2>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          {standards.map((item) => (
            <article
              key={item.number}
              className="rounded-[30px] border border-[var(--color-border)] bg-white p-10 transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <p className="mb-8 text-sm tracking-[0.4em] text-[var(--color-accent)]">
                {item.number}
              </p>

              <h3 className="mb-6 text-3xl text-[var(--color-heading)]">
                {item.title}
              </h3>

              <p className="leading-8 text-[var(--color-body)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
