import { useState, type FormEventHandler } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";

import { useAuth } from "../../hooks/useAuth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, logout } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setError("");

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirstName || !trimmedLastName || !trimmedEmail) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register(trimmedEmail, password, trimmedFirstName, trimmedLastName);
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to create your account. Please try again.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh overflow-hidden bg-[#F7F3ED]">
      <section className="grid min-h-screen lg:grid-cols-2">
        {/* =========================================================
            EDITORIAL PANEL
        ========================================================= */}

        <div className="relative hidden min-h-screen overflow-hidden bg-[#102324] lg:block">
          {/* Decorative rings */}

          <div className="pointer-events-none absolute -left-[22%] top-[12%] h-[720px] w-[720px] rounded-full border border-[#C99A5B]/20" />

          <div className="pointer-events-none absolute -left-[12%] top-[24%] h-[500px] w-[500px] rounded-full border border-[#C99A5B]/15" />

          <div className="pointer-events-none absolute left-[3%] top-[36%] h-[300px] w-[300px] rounded-full border border-[#C99A5B]/10" />

          <div className="pointer-events-none absolute -right-[28%] bottom-[-18%] h-[620px] w-[620px] rounded-full border border-[#C99A5B]/10" />

          {/* Subtle glow */}

          <div className="pointer-events-none absolute left-[28%] top-[42%] h-[220px] w-[220px] rounded-full bg-[#C99A5B]/5 blur-3xl" />

          {/* Back button */}

          <Link
            to="/"
            className="absolute left-16 top-8 z-20 flex items-center gap-4 text-[#F7F3ED]/80 transition hover:text-[#C99A5B]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F7F3ED]/20 transition duration-300 hover:border-[#C99A5B]/60">
              <FiArrowLeft size={16} />
            </span>

            <span className="text-[11px] uppercase tracking-[0.32em]">
              Back to Solais
            </span>
          </Link>

          {/* Editorial content */}

          <div className="relative z-10 flex min-h-screen flex-col justify-center px-16 py-28 xl:px-20">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-[680px]"
            >
              <p className="mb-7 text-[11px] uppercase tracking-[0.45em] text-[#C99A5B]">
                Join Solais
              </p>

              <h1 className="font-serif text-[clamp(4.5rem,6.2vw,7.5rem)] leading-[0.82] tracking-[-0.035em] text-[#F7F3ED]">
                Step into
                <span className="block italic text-[#C99A5B]">something</span>
                <span className="block">extraordinary.</span>
              </h1>

              <div className="mt-10 flex items-start gap-6">
                <span className="mt-2 h-px w-14 shrink-0 bg-[#C99A5B]/60" />

                <p className="max-w-md text-[13px] leading-7 tracking-wide text-[#F7F3ED]/55">
                  Create your place within Solais — a world of considered
                  experiences, unforgettable evenings, and moments designed to
                  be remembered.
                </p>
              </div>
            </motion.div>

            {/* Bottom editorial detail */}

            <div className="absolute bottom-9 left-16 right-16 flex items-end justify-between xl:left-20 xl:right-20">
              <div>
                <p className="text-[9px] uppercase tracking-[0.45em] text-[#F7F3ED]/30">
                  Your invitation
                </p>

                <p className="mt-2 font-serif text-lg italic text-[#F7F3ED]/50">
                  begins here.
                </p>
              </div>

              <span className="text-[9px] uppercase tracking-[0.45em] text-[#F7F3ED]/20">
                Solais Lifestyle
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================
            REGISTRATION FORM
        ========================================================= */}

        <div className="flex min-h-dvh items-center justify-center overflow-y-auto px-6 py-5 sm:px-10 lg:min-h-screen lg:px-10 lg:py-4 xl:px-14">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full max-w-[680px] py-1"
          >
            {/* Mobile back button */}

            <div className="mb-6 lg:hidden">
              <Link
                to="/"
                className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[#102324]/65 transition hover:text-[#C99A5B]"
              >
                <FiArrowLeft size={15} />
                Back to Solais
              </Link>
            </div>

            {/* Heading */}

            <div className="mb-4">
              <p className="mb-3 text-[10px] uppercase tracking-[0.45em] text-[#C99A5B]">
                Solais
              </p>

              <h2 className="font-serif text-[clamp(3.25rem,4.4vw,5rem)] leading-[0.84] tracking-[-0.035em] text-[#102324]">
                Create your
                <span className="block italic text-[#C99A5B]">account.</span>
              </h2>

              <p className="mt-2 max-w-lg text-[12px] leading-5 text-[#102324]/55">
                Become part of the Solais experience and discover what awaits.
              </p>
            </div>

            {/* Form */}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* First + Last name */}

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[#102324]/65"
                  >
                    First name
                  </label>

                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Your first name"
                    required
                    className="w-full border-0 border-b border-[#102324]/20 bg-transparent px-0 py-2 text-sm text-[#102324] outline-none transition placeholder:text-[#102324]/25 focus:border-[#C99A5B]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[#102324]/65"
                  >
                    Last name
                  </label>

                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Your last name"
                    required
                    className="w-full border-0 border-b border-[#102324]/20 bg-transparent px-0 py-2 text-sm text-[#102324] outline-none transition placeholder:text-[#102324]/25 focus:border-[#C99A5B]"
                  />
                </div>
              </div>

              {/* Email */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[#102324]/65"
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
                  className="w-full border-0 border-b border-[#102324]/20 bg-transparent px-0 py-2 text-sm text-[#102324] outline-none transition placeholder:text-[#102324]/25 focus:border-[#C99A5B]"
                />
              </div>

              {/* Password */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[#102324]/65"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                    required
                    minLength={8}
                    className="w-full border-0 border-b border-[#102324]/20 bg-transparent px-0 py-2.5 pr-10 text-sm text-[#102324] outline-none transition placeholder:text-[#102324]/25 focus:border-[#C99A5B]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#102324]/35 transition hover:text-[#C99A5B]"
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

                <p className="mt-1 text-[10px] tracking-wide text-[#102324]/35">
                  Use at least 8 characters.
                </p>
              </div>

              {/* Confirm password */}

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[#102324]/65"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="w-full border-0 border-b border-[#102324]/20 bg-transparent px-0 py-2.5 pr-10 text-sm text-[#102324] outline-none transition placeholder:text-[#102324]/25 focus:border-[#C99A5B]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#102324]/35 transition hover:text-[#C99A5B]"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
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
                  className="border border-red-900/10 bg-red-50 px-4 py-3 text-xs leading-5 text-red-800"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-1.5 flex w-full items-center justify-center gap-4 bg-[#102324] px-6 py-3 text-[10px] uppercase tracking-[0.35em] text-[#F7F3ED] transition duration-500 hover:bg-[#C99A5B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Creating account..." : "Join Solais"}

                {!isSubmitting && (
                  <FiArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            {/* Existing account */}

            <div className="mt-4 flex items-center justify-between border-t border-[#102324]/10 pt-4">
              <p className="text-xs text-[#102324]/45">
                Already part of Solais?
              </p>

              <Link
                to="/login"
                className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#102324] transition hover:text-[#C99A5B]"
              >
                Sign in
                <FiArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            {/* Privacy note */}

            <p className="mt-4 text-center text-[9px] leading-4 tracking-wide text-[#102324]/30">
              By creating an account, you agree to receive communications from
              Solais regarding your experiences and account.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
