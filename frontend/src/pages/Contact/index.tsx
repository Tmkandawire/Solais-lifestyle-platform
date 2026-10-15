import ContactHero from "../../components/contact/ContactHero";
import ContactSection from "../../components/contact/ContactSection";
import VendorPartnerOpportunities from "../../components/opportunities/VendorPartnerOpportunities";
import ClosingSection from "../../components/contact/ClosingSection";

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactSection />

      <VendorPartnerOpportunities
        vendorPath="/vendors/apply"
        partnerPath="/partners/apply"
      />

      <ClosingSection />
    </>
  );
}
