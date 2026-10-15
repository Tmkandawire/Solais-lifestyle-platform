import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { GalleryItem } from "../../types/gallery";

interface EditorialGalleryProps {
  items: GalleryItem[];
  loading: boolean;
}

export default function EditorialGallery({
  items,
  loading,
}: EditorialGalleryProps) {
  const images = items.filter((item) => item.mediaType === "IMAGE");

  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const selectedIndex = images.findIndex((item) => item.id === selectedImageId);

  const selectedImage = selectedIndex >= 0 ? images[selectedIndex] : null;

  const closeLightbox = () => setSelectedImageId(null);

  const showPrevious = () => {
    if (images.length < 2 || selectedIndex < 0) return;

    const previousIndex = (selectedIndex - 1 + images.length) % images.length;

    setSelectedImageId(images[previousIndex].id);
  };

  const showNext = () => {
    if (images.length < 2 || selectedIndex < 0) return;

    const nextIndex = (selectedIndex + 1) % images.length;

    setSelectedImageId(images[nextIndex].id);
  };

  // Keyboard controls and background scroll locking.
  useEffect(() => {
    if (!selectedImage) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage, selectedIndex, images]);

  return (
    <section className="relative overflow-hidden bg-[#FBF8F4] py-24 sm:py-28 lg:py-36">
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,154,91,.06),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center sm:mb-20"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#C99A5B] sm:text-sm">
            MORE MOMENTS
          </p>

          <h2
            className="leading-[0.95] text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2.7rem,6vw,4.8rem)",
            }}
          >
            Every gathering leaves
            <br />
            <span className="italic text-[#C99A5B]">a lasting impression.</span>
          </h2>
        </motion.div>

        {/* Gallery */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-85 animate-pulse overflow-hidden rounded-[30px] border border-[#E7DCCF] bg-white shadow-[0_25px_70px_rgba(0,0,0,.08)] sm:h-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.08 }}
                whileHover={{ y: -8 }}
                className="group overflow-hidden rounded-[30px] border border-[#E7DCCF] bg-white shadow-[0_25px_70px_rgba(0,0,0,.08)]"
              >
                <div className="relative h-85 overflow-hidden sm:h-100">
                  {item.mediaType === "IMAGE" ? (
                    <button
                      type="button"
                      onClick={() => setSelectedImageId(item.id)}
                      aria-label={`View ${item.title} in full screen`}
                      className="absolute inset-0 z-0 block h-full w-full cursor-zoom-in text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#C99A5B]"
                    >
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.7 }}
                        src={item.mediaUrl}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ) : (
                    <video
                      src={item.mediaUrl}
                      poster={item.thumbnailUrl ?? undefined}
                      controls
                      preload="metadata"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}

                  <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-[#162425]/75 via-[#162425]/20 to-transparent" />

                  {item.mediaType === "IMAGE" && (
                    <div className="pointer-events-none absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-[#162425]/40 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                      <span className="text-xl" aria-hidden="true">
                        ↗
                      </span>
                    </div>
                  )}

                  <div className="pointer-events-none absolute bottom-0 left-0 z-20 p-6 sm:p-8">
                    <p className="text-[11px] uppercase tracking-[0.4em] text-[#C99A5B]">
                      Gallery
                    </p>

                    <h3
                      className="mt-3 text-white"
                      style={{
                        fontFamily: "Cormorant Garamond",
                        fontSize: "clamp(2rem,3vw,2.8rem)",
                      }}
                    >
                      {item.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Closing Divider */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 text-center"
        >
          <div className="mb-8 flex items-center justify-center gap-6">
            <div className="h-px w-16 bg-[#D8C8AE] sm:w-24 lg:w-32" />

            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-[#C99A5B]"
            >
              ☼
            </motion.span>

            <div className="h-px w-16 bg-[#D8C8AE] sm:w-24 lg:w-32" />
          </div>

          <p
            className="text-[#162425]"
            style={{
              fontFamily: "Cormorant Garamond",
              fontSize: "clamp(2rem,4vw,3.4rem)",
            }}
          >
            Thank you for being
            <span className="italic text-[#C99A5B]"> part of the story.</span>
          </p>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            key="gallery-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`Image viewer: ${selectedImage.title}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeLightbox();
              }
            }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[#071415]/95 px-4 py-6 backdrop-blur-md sm:px-8 sm:py-10"
          >
            {/* Close */}
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close image viewer"
              className="absolute right-4 top-4 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C99A5B] sm:right-7 sm:top-7"
            >
              <X size={23} strokeWidth={1.6} />
            </button>

            {/* Image count */}
            <div className="absolute left-5 top-6 z-20 text-xs tracking-[0.2em] text-white/70 sm:left-8 sm:top-9">
              {String(selectedIndex + 1).padStart(2, "0")}
              {" / "}
              {String(images.length).padStart(2, "0")}
            </div>

            {/* Previous */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C99A5B] sm:left-6 sm:h-14 sm:w-14"
              >
                <ChevronLeft size={28} strokeWidth={1.5} />
              </button>
            )}

            {/* Selected image and caption */}
            <div className="flex max-h-full w-full max-w-6xl flex-col items-center justify-center gap-4 px-8 sm:px-12">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage.id}
                  src={selectedImage.mediaUrl}
                  alt={selectedImage.title}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-[72vh] max-w-full rounded-sm object-contain shadow-2xl sm:max-h-[78vh]"
                />
              </AnimatePresence>

              <div className="max-w-2xl text-center">
                <h3
                  className="text-2xl text-white sm:text-3xl"
                  style={{ fontFamily: "Cormorant Garamond" }}
                >
                  {selectedImage.title}
                </h3>

                {selectedImage.description && (
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    {selectedImage.description}
                  </p>
                )}
              </div>
            </div>

            {/* Next */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={showNext}
                aria-label="Next image"
                className="absolute right-2 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C99A5B] sm:right-6 sm:h-14 sm:w-14"
              >
                <ChevronRight size={28} strokeWidth={1.5} />
              </button>
            )}

            <p className="absolute bottom-3 left-0 right-0 text-center text-[9px] uppercase tracking-[0.25em] text-white/40 sm:bottom-5">
              Solaís Lifestyle · A collection of moments
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
