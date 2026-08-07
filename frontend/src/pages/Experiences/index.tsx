import ExperiencesHero from "../../components/experiences/ExperiencesHero";
import SignatureExperiences from "../../components/experiences/SignatureExperiences";
import ExperienceJourney from "../../components/experiences/ExperienceJourney";
import ExperienceDifference from "../../components/experiences/ExperienceDifference";

import CTASection from "../../components/home/CTASection";

export default function ExperiencesPage() {
  return (
    <>
      <ExperiencesHero />
      <SignatureExperiences />
      <ExperienceDifference />
      <ExperienceJourney />
      <CTASection />
    </>
  );
}
