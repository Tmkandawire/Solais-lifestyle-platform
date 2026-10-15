import type { GalleryItem } from "../../types/gallery";

interface GalleryCardProps {
  item: GalleryItem;
  onSelect?: (item: GalleryItem) => void;
}

export function GalleryCard({
  item,
  onSelect,
}: GalleryCardProps): React.JSX.Element {
  const mediaSource = item.thumbnailUrl ?? item.mediaUrl;

  return (
    <article
      className="group relative cursor-pointer overflow-hidden rounded-[24px] border border-[#E7DCCF] bg-white shadow-[0_20px_60px_rgba(0,0,0,.06)] transition-transform duration-500 hover:-translate-y-1"
      onClick={() => onSelect?.(item)}
    >
      <div className="aspect-4/5 overflow-hidden bg-[#F3EEE8]">
        {item.mediaType === "IMAGE" ? (
          <img
            src={mediaSource}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <video
            src={item.mediaUrl}
            poster={item.thumbnailUrl ?? undefined}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[#162425]/80 via-[#162425]/30 to-transparent p-5 pt-16 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-[#C99A5B]">
          Gallery
        </p>

        <h3 className="font-display text-xl text-white">{item.title}</h3>

        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-white/80">
            {item.description}
          </p>
        )}
      </div>
    </article>
  );
}
