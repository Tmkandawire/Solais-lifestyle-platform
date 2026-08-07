import GalleryHero from "../../components/gallery/GalleryHero";
import FeaturedGallery from "../../components/gallery/FeaturedGallery";
//import GalleryGrid from "../../components/gallery/GalleryGrid";
import QuoteSection from "../../components/gallery/QuoteSection";
import EditorialGallery from "../../components/gallery/EditorialGallery";

import CTASection from "../../components/home/CTASection";

export default function GalleryPage() {
  return (
    <>
      <GalleryHero />

      <FeaturedGallery />

      {/* <GalleryGrid /> */}

      <QuoteSection />

      <EditorialGallery />

      <CTASection />
    </>
  );
}
