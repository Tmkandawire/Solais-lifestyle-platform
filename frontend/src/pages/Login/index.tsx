import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiHome,
} from "react-icons/fi";

import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const authenticatedUser = await login(email.trim(), password);

      const fallbackDestination =
        authenticatedUser.role === "ATTENDEE" ? "/account" : "/admin";

      const requestedPath = (
        location.state as { from?: { pathname?: string } } | null
      )?.from?.pathname;

      const isValidDestination =
        requestedPath &&
        requestedPath.startsWith("/") &&
        !requestedPath.startsWith("//") &&
        (authenticatedUser.role === "ATTENDEE"
          ? requestedPath === "/account" ||
            requestedPath.startsWith("/account/")
          : requestedPath === "/admin" || requestedPath.startsWith("/admin/"));

      navigate(isValidDestination ? requestedPath : fallbackDestination, {
        replace: true,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please check your details and try again.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#F7F3ED]">
      <div className="grid min-h-[100dvh] lg:grid-cols-[0.95fr_1.05fr]">
        {/* ============================================================
            EDITORIAL PANEL
        ============================================================ */}

        <section className="relative hidden min-h-[100dvh] overflow-hidden bg-[#162425] lg:flex">
          {/* Decorative rings */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-[260px] top-[12%] h-[700px] w-[700px] rounded-full border border-[#C99A5B]/20" />

            <div className="absolute -left-[180px] top-[21%] h-[540px] w-[540px] rounded-full border border-[#C99A5B]/15" />

            <div className="absolute -left-[100px] top-[30%] h-[380px] w-[380px] rounded-full border border-[#C99A5B]/10" />

            <div className="absolute bottom-[-180px] right-[-180px] h-[480px] w-[480px] rounded-full border border-[#F7F3ED]/5" />
          </div>

          {/* Subtle grain / glow */}

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_35%,rgba(201,154,91,0.10),transparent_35%)]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14 2xl:p-16">
            {/* Top */}

            <div>
              <Link
                to="/"
                className="group absolute left-8 top-6 z-20 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-[#F7F3ED]/75 transition-colors duration-300 hover:text-[#C99A5B] sm:left-10 sm:top-7 xl:left-14 xl:top-8"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F7F3ED]/20 transition-all duration-300 group-hover:border-[#C99A5B]/60">
                  <FiArrowLeft
                    size={15}
                    className="transition-transform duration-300 group-hover:-translate-x-0.5"
                  />
                </span>

                <span>Back to Solais</span>
              </Link>
            </div>

            {/* Editorial copy */}

            <div className="max-w-[680px]">
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="mb-5 text-[10px] uppercase tracking-[0.42em] text-[#C99A5B]"
              >
                Welcome back
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="font-serif text-[clamp(4.2rem,6vw,7rem)] leading-[0.82] tracking-[-0.035em] text-[#F7F3ED]"
              >
                Your world
                <br />
                of <span className="italic text-[#C99A5B]">extraordinary</span>
                <br />
                experiences.
              </motion.h1>
            </div>

            {/* Bottom */}

            <div className="flex items-end justify-between gap-8">
              <p className="max-w-md text-[13px] leading-6 tracking-wide text-[#F7F3ED]/55">
                Sign in to access your Solais account, manage your experiences,
                and keep your moments all in one place.
              </p>

              <span className="hidden text-[9px] uppercase tracking-[0.35em] text-[#F7F3ED]/25 xl:block">
                Solais Lifestyle
              </span>
            </div>
          </div>
        </section>

        {/* ============================================================
            LOGIN PANEL
        ============================================================ */}

        <section className="relative flex min-h-[100dvh] items-center justify-center px-6 py-8 sm:px-10 lg:px-14 xl:px-20 2xl:px-24">
          {/* Mobile back button */}

          <Link
            to="/"
            className="absolute left-6 top-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#162425]/55 transition-colors hover:text-[#C99A5B] lg:hidden"
          >
            <FiArrowLeft size={14} />
            Back
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full max-w-[520px]"
          >
            {/* Brand */}

            <div className="mb-9">
              <p className="mb-3 text-[10px] uppercase tracking-[0.42em] text-[#C99A5B]">
                Solais
              </p>

              <h2 className="font-serif text-[clamp(3.2rem,5vw,5rem)] leading-[0.9] tracking-[-0.025em] text-[#162425]">
                Welcome back.
              </h2>

              <p className="mt-4 max-w-sm text-[13px] leading-6 text-[#162425]/50">
                Sign in to continue your Solais journey.
              </p>
            </div>

            {/* Form */}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2.5 block text-[10px] uppercase tracking-[0.28em] text-[#162425]/65"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-12 w-full border-0 border-b border-[#162425]/15 bg-transparent px-0 text-[14px] text-[#162425] outline-none transition-colors placeholder:text-[#162425]/25 focus:border-[#C99A5B]"
                />
              </div>

              {/* Password */}

              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[10px] uppercase tracking-[0.28em] text-[#162425]/65"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-[11px] text-[#162425]/40 transition-colors hover:text-[#C99A5B]"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-12 w-full border-0 border-b border-[#162425]/15 bg-transparent px-0 pr-10 text-[14px] text-[#162425] outline-none transition-colors placeholder:text-[#162425]/25 focus:border-[#C99A5B]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#162425]/35 transition-colors hover:text-[#C99A5B]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff size={17} />
                    ) : (
                      <FiEye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-red-900/10 bg-red-50 px-4 py-3 text-[13px] leading-5 text-red-800"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex h-14 w-full items-center justify-center gap-3 bg-[#162425] text-[10px] uppercase tracking-[0.32em] text-white transition-all duration-500 hover:bg-[#C99A5B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}

                {!isSubmitting && (
                  <FiArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            {/* Registration */}

            <div className="mt-8 border-t border-[#162425]/10 pt-7">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-[13px] text-[#162425]/45">New to Solais?</p>

                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#162425] transition-colors hover:text-[#C99A5B]"
                >
                  Create an account
                  <FiArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>

            {/* Home shortcut */}

            <div className="mt-7 hidden justify-center lg:flex">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-[#162425]/30 transition-colors hover:text-[#C99A5B]"
              >
                <FiHome size={12} />
                Return to the Solais experience
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
