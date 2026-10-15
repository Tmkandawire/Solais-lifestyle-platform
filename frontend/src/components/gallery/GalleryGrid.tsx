import type { GalleryItem } from "../../types/gallery";
import { GalleryCard } from "./GalleryCard";

interface GalleryGridProps {
  items: GalleryItem[];
  onSelect?: (item: GalleryItem) => void;
}

export function GalleryGrid({
  items,
  onSelect,
}: GalleryGridProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <GalleryCard key={item.id} item={item} onSelect={onSelect} />
      ))}
    </div>
  );
}
