import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PiSunBold,
  PiInstagramLogoBold,
  PiFacebookLogoBold,
  PiPinterestLogoBold,
  PiLinkedinLogoBold,
  PiTiktokLogoBold,
  PiEnvelopeBold,
  PiPhoneBold,
  PiWhatsappLogoBold,
  PiMapPinBold,
} from "react-icons/pi";

import Logo from "../branding/Logo";

const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Experiences", href: "/experiences" },
  { label: "Events", href: "/events" },
  { label: "Partners", href: "/partners" },
  { label: "Contact", href: "/contact" },
];

const socials = [
  {
    name: "Instagram",
    icon: PiInstagramLogoBold,
    href: "#",
  },
  {
    name: "Facebook",
    icon: PiFacebookLogoBold,
    href: "#",
  },
  {
    name: "Pinterest",
    icon: PiPinterestLogoBold,
    href: "#",
  },
  {
    name: "TikTok",
    icon: PiTiktokLogoBold,
    href: "#",
  },
  {
    name: "LinkedIn",
    icon: PiLinkedinLogoBold,
    href: "#",
  },
];

const contact = [
  {
    icon: PiEnvelopeBold,
    title: "Email",
    value: "info@solaislifestyle.com",
  },
  {
    icon: PiPhoneBold,
    title: "Phone",
    value: "+260 97 412 5836",
  },
  {
    icon: PiWhatsappLogoBold,
    title: "WhatsApp",
    value: "+260 96 845 2719",
  },
  {
    icon: PiMapPinBold,
    title: "Location",
    value: "Lusaka, Zambia",
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#162425] pt-40">
      {/* Gold Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,154,91,.18),transparent_65%)]" />

      {/* Background Pattern */}

      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle,#C99A5B 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Watermark */}

      <motion.h1
        animate={{
          y: [0, -12, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-[340px] tracking-[0.15em] text-white/[0.025]"
        style={{
          fontFamily: "Cormorant Garamond",
        }}
      >
        SOLAÍS
      </motion.h1>

      <div className="relative mx-auto max-w-[1500px] px-12">
        {/* Logo */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="text-center"
        >
          <motion.div
            animate={{
              rotate: [0, 2, 0],
              y: [0, -5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
            }}
            className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border border-white/10 bg-[#132424] backdrop-blur-xl"
          >
            <Logo variant="dark" className="w-24" />
          </motion.div>

          <h2
            className="mt-10 text-white"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "64px",
            }}
          >
            Solaís Lifestyle
          </h2>

          <p className="mt-6 text-xl leading-9 text-white/65">
            Elevating Experiences.
            <br />
            Inspiring Connections.
          </p>
        </motion.div>

        {/* Divider */}

        <div className="my-24 flex justify-center">
          <div className="flex items-center gap-6">
            <div className="h-px w-40 bg-white/10" />

            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <PiSunBold className="text-2xl text-[#C99A5B]" />
            </motion.div>

            <div className="h-px w-40 bg-white/10" />
          </div>
        </div>

        {/* Footer Columns */}

        <div className="grid gap-20 lg:grid-cols-3">
          {/* Explore */}

          <div>
            <p className="mb-10 uppercase tracking-[0.45em] text-[#C99A5B]">
              Explore
            </p>

            <div className="space-y-6">
              {navigation.map((item) => (
                <motion.div
                  key={item.label}
                  whileHover="hover"
                  className="group"
                >
                  <Link to={item.href} className="flex items-center gap-4">
                    <motion.div
                      variants={{
                        hover: {
                          rotate: 180,
                          scale: 1.2,
                        },
                      }}
                    >
                      <PiSunBold className="text-[#C99A5B]" />
                    </motion.div>

                    <span className="text-white/70 transition duration-300 group-hover:translate-x-2 group-hover:text-white">
                      {item.label}
                    </span>
                  </Link>

                  <motion.div
                    variants={{
                      hover: {
                        width: "120px",
                      },
                    }}
                    initial={{
                      width: 0,
                    }}
                    className="ml-8 mt-2 h-px bg-[#C99A5B]"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Social */}

          <div>
            <p className="mb-10 uppercase tracking-[0.45em] text-[#C99A5B]">
              Follow
            </p>

            <div className="space-y-6">
              {socials.map((social) => {
                const Icon = social.icon;

                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    whileHover={{
                      x: 10,
                    }}
                    className="group flex items-center gap-4 text-white/70 transition"
                  >
                    <motion.div
                      whileHover={{
                        rotate: 15,
                        scale: 1.15,
                      }}
                    >
                      <Icon className="text-2xl text-[#C99A5B]" />
                    </motion.div>

                    <span className="group-hover:text-white">
                      {social.name}
                    </span>
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Contact */}

          <div>
            <p className="mb-10 uppercase tracking-[0.45em] text-[#C99A5B]">
              Contact
            </p>

            <div className="space-y-8">
              {contact.map((item) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    whileHover={{
                      x: 6,
                    }}
                    className="border-b border-white/10 pb-6"
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="text-2xl text-[#C99A5B]" />

                      <div>
                        <p className="uppercase tracking-[0.35em] text-[11px] text-white/40">
                          {item.title}
                        </p>

                        <p className="mt-2 text-white/75">{item.value}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Closing */}

        <div className="mt-28 pb-16">
          <div className="mb-10 flex justify-center">
            <div className="flex items-center gap-6">
              <div className="h-px w-32 bg-white/10" />

              <PiSunBold className="text-[#C99A5B]" />

              <div className="h-px w-32 bg-white/10" />
            </div>
          </div>

          <p
            className="text-center text-white"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "44px",
            }}
          >
            Every invitation begins
            <span className="italic text-[#C99A5B]"> with possibility.</span>
          </p>

          <p className="mt-10 text-center uppercase tracking-[0.3em] text-sm text-white/40">
            © 2026 Solaís Lifestyle. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
