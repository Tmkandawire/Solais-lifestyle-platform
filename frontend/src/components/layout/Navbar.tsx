import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiUser, FiX } from "react-icons/fi";

import Logo from "../branding/Logo";

const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Experiences", href: "/experiences" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-[#F1EBDE] backdrop-blur-xl"
      >
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 md:h-24 md:px-10 xl:px-12">
          {/* Logo */}

          <NavLink to="/">
            <Logo
              variant="light"
              className="h-14 w-auto transition duration-500 hover:scale-105 md:h-[4.5rem] lg:h-20"
            />
          </NavLink>

          {/* Desktop Navigation */}

          <nav className="hidden items-center gap-7 xl:gap-10 lg:flex">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `group relative uppercase tracking-[0.28em] text-[13px] transition duration-300 ${
                    isActive
                      ? "text-[#C99A5B]"
                      : "text-[#162425] hover:text-[#C99A5B]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}

                    <motion.span
                      layoutId="nav-indicator"
                      className={`absolute left-1/2 top-8 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#C99A5B] ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Authentication */}

          <div className="hidden items-center gap-5 lg:flex">
            <NavLink
              to="/login"
              className="group flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-[#162425] transition duration-300 hover:text-[#C99A5B]"
            >
              Sign In
              <FiUser
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </NavLink>

            <NavLink
              to="/register"
              className="rounded-full border border-[#C99A5B] bg-[#162425] px-6 py-3 text-[12px] uppercase tracking-[0.2em] text-white transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#203536]"
            >
              Join SOLAÍS
            </NavLink>
          </div>

          {/* Mobile Menu */}

          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E7DCCF] transition hover:border-[#C99A5B] lg:hidden"
          >
            <FiMenu size={22} className="text-[#162425]" />
          </button>
        </div>
      </motion.header>

      {/* Mobile Navigation */}

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="fixed right-0 top-0 z-50 flex h-screen w-[320px] flex-col bg-[#F1EBDE] p-8 shadow-2xl"
            >
              <div className="mb-16 flex items-center justify-between">
                <Logo variant="light" className="h-16 w-auto" />

                <button
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full border border-[#E6D8C7] p-3"
                >
                  <FiX size={22} />
                </button>
              </div>

              <nav className="flex flex-1 flex-col gap-8">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{
                      opacity: 0,
                      x: 30,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.08,
                    }}
                  >
                    <NavLink
                      to={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-4 text-lg uppercase tracking-[0.25em] transition ${
                          isActive ? "text-[#C99A5B]" : "text-[#162425]"
                        }`
                      }
                    >
                      <span className="text-[#C99A5B]">☼</span>

                      {item.label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile Authentication */}

              <div className="mt-10 space-y-3">
                <NavLink
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-3 rounded-full border border-[#C99A5B] py-4 text-sm uppercase tracking-[0.25em] text-[#162425] transition hover:bg-[#EDE4D8]"
                >
                  Sign In
                  <FiUser />
                </NavLink>

                <NavLink
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center rounded-full bg-[#162425] py-4 text-sm uppercase tracking-[0.25em] text-white transition hover:bg-[#203536]"
                >
                  Join SOLAÍS
                </NavLink>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
