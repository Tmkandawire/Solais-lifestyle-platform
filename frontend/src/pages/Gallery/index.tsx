import GalleryHero from "../../components/gallery/GalleryHero";
import FeaturedGallery from "../../components/gallery/FeaturedGallery";
import QuoteSection from "../../components/gallery/QuoteSection";
import EditorialGallery from "../../components/gallery/EditorialGallery";
import CTASection from "../../components/home/CTASection";
import { useGallery } from "../../hooks/useGallery";

export default function GalleryPage() {
  const { galleryItems, loading, error } = useGallery({
    page: 1,
    limit: 20,
  });

  return (
    <>
      <GalleryHero />

      <FeaturedGallery />

      <QuoteSection />

      {error ? (
        <section className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="text-sm opacity-60">
            Unable to load the gallery at the moment.
          </p>
        </section>
      ) : (
        <EditorialGallery items={galleryItems} loading={loading} />
      )}

      <CTASection />
    </>
  );
}
