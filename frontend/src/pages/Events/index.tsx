import EventsHero from "../..//components/events/eventsHero";
import FeaturedEvent from "../../components/events/FeaturedEvent";
import UpcomingEventsSection from "../../components/events/UpcomingEventsSection";
import EventInformation from "../../components/events/EventInformation";
import GalleryPreview from "../../components/events/GalleryPreview";

import CTASection from "../../components/home/CTASection";

export default function EventsPage() {
  return (
    <>
      <EventsHero />
      <FeaturedEvent />
      <UpcomingEventsSection />
      <EventInformation />
      <GalleryPreview />
      <CTASection />
    </>
  );
}
