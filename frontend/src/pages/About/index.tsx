import AboutHero from "../../components/about/AboutHero";
import OurStory from "../../components/about/OurStory";
import VisionMission from "../../components/about/VisionMission";
import ValuesSection from "../../components/about/ValuesSection";
import PromiseSection from "../../components/about/PromiseSection";

import CTASection from "../../components/home/CTASection";

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <OurStory />
      <VisionMission />
      <ValuesSection />
      <PromiseSection />
      <CTASection />
    </>
  );
}
