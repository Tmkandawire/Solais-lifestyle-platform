import { useEffect, useState } from "react";

import { getGalleryItem } from "../../api/gallery.api";
import type { GalleryItem } from "../../types/gallery";

interface UseGalleryItemResult {
  galleryItem: GalleryItem | null;
  loading: boolean;
  error: string | null;
}

export function useGalleryItem(id: string | undefined): UseGalleryItemResult {
  const [galleryItem, setGalleryItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    const galleryItemId = id;

    async function fetchGalleryItem() {
      try {
        setLoading(true);
        setError(null);

        const result = await getGalleryItem(galleryItemId);

        setGalleryItem(result);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load gallery item.";

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void fetchGalleryItem();
  }, [id]);

  return {
    galleryItem,
    loading,
    error,
  };
}
