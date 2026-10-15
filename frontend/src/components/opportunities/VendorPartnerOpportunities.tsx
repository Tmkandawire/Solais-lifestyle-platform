import { motion, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface VendorPartnerOpportunitiesProps {
  vendorPath: string;
  partnerPath: string;
}

const vendorCategories = [
  "Fashion & Beauty",
  "Food & Beverages",
  "Health & Wellness",
  "Art & Crafts",
  "Technology",
  "Financial Services",
  "Real Estate",
  "Automotive",
  "Lifestyle Brands",
];

const vendorRequirements = [
  "Business Name",
  "Contact Person",
  "Phone Number",
  "Email Address",
  "Business Category",
  "Products or Services",
  "Website or Social Media",
  "Preferred Event",
];

const reveal: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function VendorPartnerOpportunities({
  vendorPath,
  partnerPath,
}: VendorPartnerOpportunitiesProps) {
  return (
    <section className="relative overflow-hidden bg-[#f7f4ee] px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Section introduction */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-[#c8954b] sm:text-xs">
            Opportunities
          </p>

          <h2 className="mt-7 font-serif text-5xl font-normal leading-[0.98] tracking-[-0.035em] text-[#172526] sm:text-6xl lg:text-7xl">
            Be part of the
            <span className="block italic">Solaís experience.</span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[#172526]/60 sm:text-base">
            We bring together exceptional brands, businesses and organisations
            to create experiences that people remember.
          </p>
        </motion.div>

        {/* Opportunities */}
        <div className="mt-20 border-t border-[#172526]/15 lg:mt-24">
          <div className="grid lg:grid-cols-2">
            {/* Vendor */}
            <motion.article
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={reveal}
              className="border-b border-[#172526]/15 py-14 lg:border-b-0 lg:border-r lg:pr-16 lg:py-16"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#c8954b]">
                  Vendors
                </p>

                <span className="font-serif text-sm italic text-[#172526]/40">
                  01
                </span>
              </div>

              <h3 className="mt-8 font-serif text-4xl font-normal leading-tight tracking-[-0.025em] text-[#172526] sm:text-5xl">
                Become a Vendor
              </h3>

              <p className="mt-6 max-w-xl text-sm leading-7 text-[#172526]/65 sm:text-base">
                Showcase your business at one of Lusaka’s most exciting
                lifestyle experiences.
              </p>

              <div className="mt-12 border-t border-[#172526]/10 pt-8">
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#172526]/50">
                  We welcome applications from
                </p>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={stagger}
                  className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2"
                >
                  {vendorCategories.map((category) => (
                    <motion.div
                      key={category}
                      variants={itemReveal}
                      className="flex items-center gap-3 text-sm text-[#172526]/70"
                    >
                      <span className="h-px w-4 bg-[#c8954b]" />
                      {category}
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <div className="mt-12 border-t border-[#172526]/10 pt-8">
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#172526]/50">
                  Vendor Registration
                </p>

                <p className="mt-4 text-sm leading-7 text-[#172526]/60">
                  Complete our online application by providing:
                </p>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={stagger}
                  className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2"
                >
                  {vendorRequirements.map((requirement) => (
                    <motion.p
                      key={requirement}
                      variants={itemReveal}
                      className="text-sm text-[#172526]/65"
                    >
                      {requirement}
                    </motion.p>
                  ))}
                </motion.div>
              </div>

              <Link
                to={vendorPath}
                className="group mt-12 inline-flex items-center gap-4 border-b border-[#172526]/40 pb-2 text-xs font-medium uppercase tracking-[0.16em] text-[#172526] transition-all duration-500 hover:border-[#c8954b]"
              >
                Become a Vendor
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#172526]/20 transition-all duration-500 group-hover:border-[#c8954b] group-hover:bg-[#c8954b] group-hover:text-white">
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-45" />
                </span>
              </Link>
            </motion.article>

            {/* Partner */}
            <motion.article
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={reveal}
              className="py-14 lg:pl-16 lg:py-16"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#c8954b]">
                  Partners
                </p>

                <span className="font-serif text-sm italic text-[#172526]/40">
                  02
                </span>
              </div>

              <h3 className="mt-8 max-w-lg font-serif text-4xl font-normal leading-tight tracking-[-0.025em] text-[#172526] sm:text-5xl">
                Partner With Solaís
              </h3>

              <div className="mt-6 max-w-xl space-y-5 text-sm leading-7 text-[#172526]/65 sm:text-base">
                <p>
                  We collaborate with brands and organisations that share our
                  commitment to creating exceptional experiences and meaningful
                  connections.
                </p>

                <p>
                  Whether you’re interested in sponsorship, brand activation, or
                  strategic partnerships, we’d love to hear from you.
                </p>
              </div>

              {/* Partner visual statement */}
              <div className="relative mt-16 min-h-64 overflow-hidden border-y border-[#172526]/10 py-12">
                <div className="absolute right-4 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full border border-[#c8954b]/30 sm:right-12 sm:h-48 sm:w-48" />

                <div className="relative max-w-sm">
                  <p className="font-serif text-2xl leading-relaxed text-[#172526]/80 sm:text-3xl">
                    Meaningful
                    <span className="block italic">connections.</span>
                  </p>
                </div>
              </div>

              <Link
                to={partnerPath}
                className="group mt-12 inline-flex items-center gap-4 border-b border-[#172526]/40 pb-2 text-xs font-medium uppercase tracking-[0.16em] text-[#172526] transition-all duration-500 hover:border-[#c8954b]"
              >
                Become a Partner
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#172526]/20 transition-all duration-500 group-hover:border-[#c8954b] group-hover:bg-[#c8954b] group-hover:text-white">
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-45" />
                </span>
              </Link>
            </motion.article>
          </div>
        </div>
      </div>
    </section>
  );
}
