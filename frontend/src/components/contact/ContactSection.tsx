import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  PiEnvelopeBold,
  PiPhoneBold,
  PiWhatsappLogoBold,
  PiMapPinBold,
  PiPaperPlaneTiltBold,
} from "react-icons/pi";
import { apiClient } from "../../api/client";

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

interface ContactFormData {
  fullName: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

const initialFormData: ContactFormData = {
  fullName: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
};

const inputClassName =
  "w-full border-b border-[#D9CCBB] bg-transparent pb-4 text-[#162425] outline-none transition placeholder:text-[#B0A69A] focus:border-[#C99A5B]";

export default function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function updateField(field: keyof ContactFormData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const payload: ContactFormData = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    };

    if (
      payload.fullName.length < 2 ||
      payload.subject.length < 2 ||
      payload.message.length < 10
    ) {
      setFeedback({
        type: "error",
        message:
          "Please provide your name, a subject, and a message of at least 10 characters.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setFeedback({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await apiClient.post("/contact-messages", {
        ...payload,
        phone: payload.phone || undefined,
      });

      setFormData(initialFormData);
      setFeedback({
        type: "success",
        message:
          "Thank you for contacting Solaís. Your enquiry has been received, and our team will get back to you.",
      });
    } catch {
      setFeedback({
        type: "error",
        message:
          "We couldn't submit your enquiry right now. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="relative overflow-hidden bg-[#F8F5F0] py-24 sm:py-28 lg:py-36">
      <div className="mx-auto grid max-w-[1500px] gap-16 px-6 sm:px-8 lg:grid-cols-2 lg:gap-24 lg:px-12">
        {/* Contact Details */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
            GET IN TOUCH
          </p>

          <h2
            className="mb-10 text-[#162425] sm:mb-12"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2.8rem,6vw,4.25rem)",
            }}
          >
            We'd love
            <br />
            to hear from you.
          </h2>

          <div className="space-y-8 sm:space-y-10 lg:space-y-12">
            {contact.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="border-b border-[#E8DDD0] pb-6 sm:pb-8"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <Icon className="text-2xl text-[#C99A5B] sm:text-3xl" />

                    <p className="text-xs uppercase tracking-[0.35em] text-[#8A8A8A]">
                      {item.title}
                    </p>
                  </div>

                  <p className="break-words text-lg text-[#162425] sm:text-xl">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Enquiry Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          aria-busy={isSubmitting}
          className="rounded-[32px] border border-[#E7DCCF] bg-[#FBF8F4] p-8 shadow-[0_35px_80px_rgba(0,0,0,.05)] sm:rounded-[42px] sm:p-10 lg:p-14"
        >
          <div className="space-y-8 sm:space-y-10">
            <div>
              <label
                htmlFor="contact-full-name"
                className="mb-3 block text-xs uppercase tracking-[0.35em] text-[#8A8A8A] sm:mb-4"
              >
                Full Name
              </label>
              <input
                id="contact-full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={160}
                value={formData.fullName}
                onChange={(event) =>
                  updateField("fullName", event.target.value)
                }
                className={inputClassName}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label
                htmlFor="contact-phone"
                className="mb-3 block text-xs uppercase tracking-[0.35em] text-[#8A8A8A] sm:mb-4"
              >
                Phone Number{" "}
                <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={40}
                value={formData.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className={inputClassName}
                placeholder="+260 ..."
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="mb-3 block text-xs uppercase tracking-[0.35em] text-[#8A8A8A] sm:mb-4"
              >
                Email Address
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                className={inputClassName}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="contact-subject"
                className="mb-3 block text-xs uppercase tracking-[0.35em] text-[#8A8A8A] sm:mb-4"
              >
                Subject
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                required
                minLength={2}
                maxLength={200}
                value={formData.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                className={inputClassName}
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="mb-3 block text-xs uppercase tracking-[0.35em] text-[#8A8A8A] sm:mb-4"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={6}
                required
                minLength={10}
                maxLength={5000}
                value={formData.message}
                onChange={(event) => updateField("message", event.target.value)}
                className={`${inputClassName} resize-y`}
                placeholder="Tell us how we can help..."
              />
            </div>
          </div>

          {feedback && (
            <div
              role={feedback.type === "error" ? "alert" : "status"}
              aria-live="polite"
              className={`mt-6 rounded-xl border p-4 text-sm leading-relaxed ${
                feedback.type === "success"
                  ? "border-[#C7DCCB] bg-[#EEF6EF] text-[#245B35]"
                  : "border-[#E8C9C4] bg-[#FBEEEC] text-[#8C3027]"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-10 flex w-full items-center justify-center gap-4 rounded-full bg-[#162425] px-8 py-4 text-xs uppercase tracking-[0.3em] text-white transition hover:-translate-y-1 hover:bg-[#203536] disabled:cursor-not-allowed disabled:opacity-60 sm:mt-12 sm:w-auto sm:px-10 sm:py-5 sm:text-sm lg:mt-14"
          >
            {isSubmitting ? "Sending..." : "Send Your Enquiry"}
            {!isSubmitting && <PiPaperPlaneTiltBold className="text-lg" />}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
