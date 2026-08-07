import Hero from "../../components/home/Hero";
import LifestyleShowcase from "../../components/home/LifestyleShowcase";
import AboutSection from "../../components/home/AboutSection";
import ExperiencesSection from "../../components/home/ExperiencesSection";
import UpcomingEventsSection from "../../components/home/UpcomingEventsSection";
import GalleryPreviewSection from "../../components/home/GalleryPreviewSection";
import CTASection from "../../components/home/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />

      <LifestyleShowcase />

      <AboutSection />

      <ExperiencesSection />

      <UpcomingEventsSection />

      <GalleryPreviewSection />

      <CTASection />
    </>
  );
}
