import { motion } from "framer-motion";
import {
  PiEnvelopeBold,
  PiPhoneBold,
  PiWhatsappLogoBold,
  PiMapPinBold,
  PiPaperPlaneTiltBold,
} from "react-icons/pi";

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

export default function ContactSection() {
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
            className="mb-10 sm:mb-12 text-[#162425]"
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

        {/* Form */}

        <motion.form
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-[32px] sm:rounded-[42px] border border-[#E7DCCF] bg-[#FBF8F4] p-8 shadow-[0_35px_80px_rgba(0,0,0,.05)] sm:p-10 lg:p-14"
        >
          <div className="space-y-8 sm:space-y-10">
            {["Full Name", "Phone Number", "Email Address", "Subject"].map(
              (field) => (
                <div key={field}>
                  <label className="mb-3 block text-xs uppercase tracking-[0.35em] text-[#8A8A8A] sm:mb-4">
                    {field}
                  </label>

                  <input
                    type="text"
                    className="w-full border-b border-[#D9CCBB] bg-transparent pb-4 outline-none transition focus:border-[#C99A5B]"
                  />
                </div>
              ),
            )}

            <div>
              <label className="mb-3 block text-xs uppercase tracking-[0.35em] text-[#8A8A8A] sm:mb-4">
                Message
              </label>

              <textarea
                rows={6}
                className="w-full resize-none border-b border-[#D9CCBB] bg-transparent outline-none transition focus:border-[#C99A5B]"
              />
            </div>
          </div>

          <button
            className="
              mt-10
              sm:mt-12
              lg:mt-14
              flex
              w-full
              sm:w-auto
              items-center
              justify-center
              gap-4
              rounded-full
              bg-[#162425]
              px-8
              sm:px-10
              py-4
              sm:py-5
              text-xs
              sm:text-sm
              uppercase
              tracking-[0.3em]
              text-white
              transition
              hover:-translate-y-1
              hover:bg-[#203536]
            "
          >
            Send Your Enquiry
            <PiPaperPlaneTiltBold className="text-lg" />
          </button>
        </motion.form>
      </div>
    </section>
  );
}
