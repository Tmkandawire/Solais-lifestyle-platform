import { useEffect, useState } from "react";

import { getGalleryItems } from "../api/gallery.api";
import type { GalleryItem, GalleryListParams } from "../types/gallery";

interface UseGalleryResult {
  galleryItems: GalleryItem[];
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  totalPages: number;
}

export function useGallery(params: GalleryListParams = {}): UseGalleryResult {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(params.page ?? 1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const pageParam = params.page ?? 1;
  const limitParam = params.limit ?? 20;
  const mediaTypeParam = params.mediaType;
  const eventIdParam = params.eventId;

  useEffect(() => {
    let cancelled = false;

    async function fetchGallery() {
      try {
        setLoading(true);
        setError(null);

        const result = await getGalleryItems({
          page: pageParam,
          limit: limitParam,
          ...(mediaTypeParam !== undefined
            ? { mediaType: mediaTypeParam }
            : {}),
          ...(eventIdParam !== undefined ? { eventId: eventIdParam } : {}),
        });

        if (cancelled) {
          return;
        }

        setGalleryItems(result.galleryItems);
        setPage(result.page);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Failed to load gallery items.";

        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchGallery();

    return () => {
      cancelled = true;
    };
  }, [pageParam, limitParam, mediaTypeParam, eventIdParam]);

  return {
    galleryItems,
    loading,
    error,
    page,
    total,
    totalPages,
  };
}
