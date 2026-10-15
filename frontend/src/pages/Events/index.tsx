import EventsHero from "../..//components/events/eventsHero";
import FeaturedEvent from "../../components/events/FeaturedEvent";
import UpcomingEventsSection from "../../components/events/UpcomingEventsSection";
import VendorPartnerOpportunities from "../../components/opportunities/VendorPartnerOpportunities";
import GalleryPreview from "../../components/events/GalleryPreview";

import CTASection from "../../components/home/CTASection";

export default function EventsPage() {
  return (
    <>
      <EventsHero />
      <FeaturedEvent />
      <UpcomingEventsSection />
      <VendorPartnerOpportunities
        vendorPath="/vendors/apply"
        partnerPath="/partners/apply"
      />
      <GalleryPreview />
      <CTASection />
    </>
  );
}
