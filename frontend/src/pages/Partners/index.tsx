import { useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MessageCircle,
  Globe,
  Sparkles,
} from "lucide-react";

import { useCreatePartnerApplication } from "../../hooks/usePartnerApplication";
import type { CreatePartnerApplicationPayload } from "../../types/partner-application";

type Step = 1 | 2 | 3;

interface FormData {
  organisationName: string;
  contactPerson: string;
  phone: string;
  email: string;
  partnershipType: string;
  organisationDescription: string;
  partnershipInterest: string;
  contributionDescription: string;
  websiteOrSocial: string;
  preferredEventId: string;
}

const initialForm: FormData = {
  organisationName: "",
  contactPerson: "",
  phone: "",
  email: "",
  partnershipType: "",
  organisationDescription: "",
  partnershipInterest: "",
  contributionDescription: "",
  websiteOrSocial: "",
  preferredEventId: "",
};

const partnershipTypes = [
  "Strategic Partnership",
  "Brand Partnership",
  "Media Partnership",
  "Community Partnership",
  "Hospitality Partnership",
  "Creative Partnership",
  "Corporate Partnership",
  "Other",
];

/**
 * Placeholder until this step is wired to the real events list (useEvents).
 * This id is never sent to the backend — see buildPayload() below — since
 * it doesn't correspond to an actual Event row and preferredEventId is a
 * foreign key. Once real events are wired in, replace this array with
 * fetched events and drop the GENERIC_EVENT_PREFERENCE_ID special-case.
 * Mirrors the same pattern already established on the Vendor page.
 */
const GENERIC_EVENT_PREFERENCE_ID = "future-events";

const events = [
  {
    id: GENERIC_EVENT_PREFERENCE_ID,
    name: "Future Solaís Events",
    description: "Consider us for upcoming collaborations",
  },
];

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: { duration: 0.3 },
  },
};

const inputClass =
  "w-full border-0 border-b border-[#172526]/15 bg-transparent px-0 py-4 text-[16px] text-[#172526] outline-none transition-colors placeholder:text-[#172526]/35 focus:border-[#C99A5B]";

const labelClass =
  "mb-2 block text-[10px] font-medium uppercase tracking-[0.28em] text-[#172526]/55";

function buildPayload(form: FormData): CreatePartnerApplicationPayload {
  const websiteOrSocial = form.websiteOrSocial.trim();
  const preferredEventId = form.preferredEventId;

  return {
    organisationName: form.organisationName.trim(),
    contactPerson: form.contactPerson.trim(),
    phoneNumber: form.phone.trim(),
    email: form.email.trim(),
    partnershipType: form.partnershipType,
    organisationDescription: form.organisationDescription.trim(),
    partnershipInterest: form.partnershipInterest.trim(),
    contributionDescription: form.contributionDescription.trim(),
    ...(websiteOrSocial ? { websiteOrSocial } : {}),
    ...(preferredEventId && preferredEventId !== GENERIC_EVENT_PREFERENCE_ID
      ? { preferredEventId }
      : {}),
  };
}

export default function PartnerApplicationPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const formCardRef = useRef<HTMLDivElement>(null);

  const {
    submit,
    isLoading,
    error: submitError,
  } = useCreatePartnerApplication();

  const displayError = formError || submitError;

  const scrollToForm = () => {
    formCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const progress = useMemo(() => `${(step / 3) * 100}%`, [step]);

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateStep = () => {
    setFormError("");

    if (step === 1) {
      if (
        !form.organisationName.trim() ||
        !form.contactPerson.trim() ||
        !form.phone.trim() ||
        !form.email.trim()
      ) {
        setFormError("Please complete all required fields before continuing.");
        return false;
      }
    }

    if (step === 2) {
      if (
        !form.partnershipType ||
        !form.organisationDescription.trim() ||
        !form.partnershipInterest.trim()
      ) {
        setFormError("Please tell us a little more about your organisation.");
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;

    if (step < 3) {
      setStep((current) => (current + 1) as Step);
      scrollToForm();
    }
  };

  const previousStep = () => {
    setFormError("");

    if (step > 1) {
      setStep((current) => (current - 1) as Step);
      scrollToForm();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError("");

    if (!form.contributionDescription.trim()) {
      setFormError(
        "Please tell us what you could bring to Solaís experiences.",
      );
      return;
    }

    if (!form.preferredEventId) {
      setFormError("Please select an event preference.");
      return;
    }

    try {
      await submit(buildPayload(form));

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // submitError from the hook already carries the backend/network
      // message and is rendered via displayError below.
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#F7F3ED] text-[#172526]">
        <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-6 py-24">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C99A5B]/10 blur-[120px]" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-2xl text-center"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.15,
                duration: 0.6,
                type: "spring",
                stiffness: 120,
              }}
              className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-full border border-[#C99A5B]/40"
            >
              <Check className="h-7 w-7 text-[#C99A5B]" strokeWidth={1.4} />
            </motion.div>

            <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.4em] text-[#C99A5B]">
              Proposal Received
            </p>

            <h1 className="font-serif text-[clamp(3.5rem,8vw,7rem)] font-normal leading-[0.82] tracking-[-0.04em]">
              Thank you for
              <br />
              <span className="italic text-[#C99A5B]">imagining</span>
              <br />
              this with us.
            </h1>

            <p className="mx-auto mt-10 max-w-lg text-[15px] leading-7 text-[#172526]/60">
              Our team will carefully review your proposal and reach out using
              the details provided to explore how we might collaborate on an
              upcoming Solaís experience.
            </p>

            <a
              href="/"
              className="mt-12 inline-flex items-center gap-4 border-b border-[#172526]/25 pb-3 text-[10px] font-medium uppercase tracking-[0.3em] transition-colors hover:border-[#C99A5B] hover:text-[#C99A5B]"
            >
              Return to Solaís
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F3ED] text-[#172526]">
      {/* HERO */}
      <section className="relative px-6 pb-20 pt-16 sm:px-10 lg:px-16 lg:pb-28 lg:pt-24">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[550px] w-[550px] rounded-full bg-[#C99A5B]/10 blur-[130px]" />

        <div className="relative mx-auto max-w-[1500px]">
          <div className="grid gap-14 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-8 flex items-center gap-4">
                <span className="h-px w-10 bg-[#C99A5B]" />
                <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-[#C99A5B]">
                  Partner Application
                </span>
              </div>

              <h1 className="max-w-5xl font-serif text-[clamp(4rem,8vw,8.5rem)] font-normal leading-[0.78] tracking-[-0.055em]">
                Let&apos;s create
                <br />
                <span className="italic text-[#C99A5B]">something</span>
                <br />
                together.
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="max-w-md lg:pb-3"
            >
              <div className="mb-7 flex items-center gap-3">
                <Sparkles
                  className="h-4 w-4 text-[#C99A5B]"
                  strokeWidth={1.2}
                />
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#172526]/50">
                  Strategic Collaborations
                </span>
              </div>

              <p className="text-[17px] leading-8 text-[#172526]/60">
                The right partners help shape what Solaís becomes. Tell us about
                your organisation, and let&apos;s explore what we could create
                together.
              </p>
            </motion.div>
          </div>

          <div className="mt-16 border-t border-[#172526]/15" />
        </div>
      </section>

      {/* APPLICATION */}
      <section className="px-6 pb-28 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid lg:grid-cols-[0.32fr_1fr] lg:gap-20 xl:grid-cols-[0.38fr_1fr]">
            {/* SIDEBAR */}
            <aside className="mb-12 lg:mb-0">
              <div className="sticky top-10">
                <p className="mb-10 text-[10px] font-medium uppercase tracking-[0.3em] text-[#172526]/40">
                  Your proposal
                </p>

                <div className="space-y-7">
                  {[
                    ["01", "About You"],
                    ["02", "Your Partnership"],
                    ["03", "Your Contribution"],
                  ].map(([number, title], index) => {
                    const active = step === index + 1;
                    const complete = step > index + 1;

                    return (
                      <button
                        key={number}
                        type="button"
                        onClick={() => {
                          if (complete) setStep((index + 1) as Step);
                        }}
                        className={`group flex w-full items-center gap-5 text-left transition-opacity ${
                          !active && !complete ? "opacity-35" : ""
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[9px] transition-all ${
                            active
                              ? "border-[#C99A5B] bg-[#C99A5B] text-white"
                              : complete
                                ? "border-[#C99A5B] text-[#C99A5B]"
                                : "border-[#172526]/20"
                          }`}
                        >
                          {complete ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            number
                          )}
                        </span>

                        <span className="text-[11px] font-medium uppercase tracking-[0.25em]">
                          {title}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-12 h-px w-full bg-[#172526]/10">
                  <motion.div
                    animate={{ width: progress }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-[#C99A5B]"
                  />
                </div>

                <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[#172526]/35">
                  Step {String(step).padStart(2, "0")} of 03
                </p>
              </div>
            </aside>

            {/* FORM */}
            <div
              ref={formCardRef}
              className="relative scroll-mt-24 rounded-[32px] border border-[#E5D8C8] bg-[#FCFAF7] px-7 py-9 shadow-[0_30px_90px_rgba(18,18,18,0.05)] sm:px-12 sm:py-14 lg:px-16 lg:py-16"
            >
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step-one"
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <FormHeader
                        number="01"
                        eyebrow="About You"
                        title={
                          <>
                            Let&apos;s start with
                            <br />
                            <span>you.</span>
                          </>
                        }
                        description="Tell us who you are and how we can reach you."
                      />

                      <div className="mt-14 grid gap-9 sm:grid-cols-2">
                        <Field
                          label="Organisation / Brand Name"
                          required
                          value={form.organisationName}
                          onChange={(value) =>
                            updateField("organisationName", value)
                          }
                          placeholder="Your organisation name"
                        />

                        <Field
                          label="Contact Person"
                          required
                          value={form.contactPerson}
                          onChange={(value) =>
                            updateField("contactPerson", value)
                          }
                          placeholder="Full name"
                        />

                        <Field
                          label="Phone Number"
                          required
                          type="tel"
                          value={form.phone}
                          onChange={(value) => updateField("phone", value)}
                          placeholder="+265 ..."
                        />

                        <Field
                          label="Email Address"
                          required
                          type="email"
                          value={form.email}
                          onChange={(value) => updateField("email", value)}
                          placeholder="hello@yourorganisation.com"
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step-two"
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <FormHeader
                        number="02"
                        eyebrow="Your Partnership"
                        title={
                          <>
                            What kind of
                            <br />
                            <span>connection?</span>
                          </>
                        }
                        description="Help us understand your organisation and why you'd like to partner with us."
                      />

                      <div className="mt-14 space-y-10">
                        <div>
                          <label className={labelClass}>
                            Partnership Type{" "}
                            <span className="text-[#C99A5B]">*</span>
                          </label>

                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {partnershipTypes.map((type) => {
                              const selected = form.partnershipType === type;

                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() =>
                                    updateField("partnershipType", type)
                                  }
                                  className={`min-h-[58px] border px-4 text-left text-[11px] uppercase tracking-[0.12em] transition-all ${
                                    selected
                                      ? "border-[#C99A5B] bg-[#C99A5B]/10 text-[#172526]"
                                      : "border-[#172526]/10 hover:border-[#C99A5B]/50"
                                  }`}
                                >
                                  {type}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className={labelClass}>
                            Tell us about your organisation{" "}
                            <span className="text-[#C99A5B]">*</span>
                          </label>
                          <textarea
                            rows={4}
                            value={form.organisationDescription}
                            onChange={(event) =>
                              updateField(
                                "organisationDescription",
                                event.target.value,
                              )
                            }
                            placeholder="What does your organisation do?"
                            className={`${inputClass} resize-none`}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            Why partner with Solaís?{" "}
                            <span className="text-[#C99A5B]">*</span>
                          </label>
                          <textarea
                            rows={4}
                            value={form.partnershipInterest}
                            onChange={(event) =>
                              updateField(
                                "partnershipInterest",
                                event.target.value,
                              )
                            }
                            placeholder="Why would you like to partner with us?"
                            className={`${inputClass} resize-none`}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            Website / Social Media
                          </label>
                          <div className="relative">
                            <Globe className="absolute left-0 top-4 h-4 w-4 text-[#172526]/35" />
                            <input
                              type="url"
                              value={form.websiteOrSocial}
                              onChange={(event) =>
                                updateField(
                                  "websiteOrSocial",
                                  event.target.value,
                                )
                              }
                              placeholder="https://..."
                              className={`${inputClass} pl-7`}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step-three"
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <FormHeader
                        number="03"
                        eyebrow="Your Contribution"
                        title={
                          <>
                            What could you
                            <br />
                            <span>bring?</span>
                          </>
                        }
                        description="Tell us what you'd bring to a Solaís experience, and where you'd like to be involved."
                      />

                      <div className="mt-14 space-y-10">
                        <div>
                          <label className={labelClass}>
                            What could you bring to Solaís experiences?{" "}
                            <span className="text-[#C99A5B]">*</span>
                          </label>
                          <textarea
                            rows={5}
                            value={form.contributionDescription}
                            onChange={(event) =>
                              updateField(
                                "contributionDescription",
                                event.target.value,
                              )
                            }
                            placeholder="Tell us what you'd contribute, and which kinds of opportunities interest you most..."
                            className={`${inputClass} resize-none`}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            Preferred Event{" "}
                            <span className="text-[#C99A5B]">*</span>
                          </label>

                          <div className="space-y-3">
                            {events.map((event) => {
                              const selected =
                                form.preferredEventId === event.id;

                              return (
                                <button
                                  key={event.id}
                                  type="button"
                                  onClick={() =>
                                    updateField("preferredEventId", event.id)
                                  }
                                  className={`flex w-full items-center justify-between border p-5 text-left transition-all sm:p-6 ${
                                    selected
                                      ? "border-[#C99A5B] bg-[#C99A5B]/8"
                                      : "border-[#172526]/10 hover:border-[#C99A5B]/50"
                                  }`}
                                >
                                  <div>
                                    <p className="font-serif text-2xl">
                                      {event.name}
                                    </p>
                                    <p className="mt-1 text-xs text-[#172526]/50">
                                      {event.description}
                                    </p>
                                  </div>

                                  <span
                                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                      selected
                                        ? "border-[#C99A5B] bg-[#C99A5B]"
                                        : "border-[#172526]/20"
                                    }`}
                                  >
                                    {selected && (
                                      <Check className="h-3 w-3 text-white" />
                                    )}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-2 border-t border-[#172526]/10 pt-7">
                          <div className="flex gap-4">
                            <MessageCircle
                              className="mt-1 h-4 w-4 shrink-0 text-[#C99A5B]"
                              strokeWidth={1.3}
                            />
                            <p className="max-w-md text-xs leading-6 text-[#172526]/50">
                              We review every proposal individually. If
                              there&apos;s a fit, our team will reach out
                              directly to explore next steps.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {displayError && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 border-l-2 border-[#C99A5B] bg-[#C99A5B]/5 px-4 py-3 text-xs text-[#172526]/70"
                  >
                    {displayError}
                  </motion.p>
                )}

                {/* NAVIGATION */}
                <div className="mt-14 flex items-center justify-between border-t border-[#172526]/10 pt-7">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={previousStep}
                      className="group inline-flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.25em] text-[#172526]/50 transition-colors hover:text-[#172526]"
                    >
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                      Back
                    </button>
                  ) : (
                    <a
                      href="/events"
                      className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#172526]/40 transition-colors hover:text-[#172526]"
                    >
                      Explore Events
                    </a>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="group inline-flex items-center gap-4 rounded-full bg-[#172526] px-7 py-4 text-[10px] font-medium uppercase tracking-[0.28em] text-white transition-all hover:bg-[#C99A5B]"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group inline-flex items-center gap-4 rounded-full bg-[#172526] px-7 py-4 text-[10px] font-medium uppercase tracking-[0.28em] text-white transition-all hover:bg-[#C99A5B] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? "Submitting..." : "Submit Proposal"}
                      {!isLoading && (
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER STATEMENT */}
      <section className="border-t border-[#172526]/10 px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[#C99A5B]">
              Solaís Lifestyle
            </p>
            <p className="font-serif text-3xl italic text-[#172526]/70 sm:text-4xl">
              Beautiful experiences,
              <br />
              thoughtfully curated.
            </p>
          </div>

          <p className="max-w-xs text-[11px] leading-6 text-[#172526]/40 sm:text-right">
            Organisations and brands who share our vision for meaningful
            collaboration.
          </p>
        </div>
      </section>
    </main>
  );
}

interface FormHeaderProps {
  number: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
}

function FormHeader({ number, eyebrow, title, description }: FormHeaderProps) {
  return (
    <div>
      <div className="mb-7 flex items-center gap-4">
        <span className="font-serif text-xl italic text-[#C99A5B]">
          {number}
        </span>
        <span className="h-px w-8 bg-[#C99A5B]/50" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#172526]/45">
          {eyebrow}
        </span>
      </div>

      <h2 className="font-serif text-[clamp(3rem,5vw,5.5rem)] font-normal leading-[0.85] tracking-[-0.04em]">
        {title}
      </h2>

      <p className="mt-7 max-w-md text-sm leading-7 text-[#172526]/55">
        {description}
      </p>
    </div>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

function Field({
  label,
  required,
  type = "text",
  value,
  placeholder,
  onChange,
}: FieldProps) {
  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-[#C99A5B]">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
    </div>
  );
}
