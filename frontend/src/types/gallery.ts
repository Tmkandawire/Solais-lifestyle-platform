export type MediaType = "IMAGE" | "VIDEO";

export interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl: string | null;
  publicId: string;
  eventId: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface GalleryListParams {
  page?: number;
  limit?: number;
  mediaType?: MediaType;
  eventId?: string;
}

export interface AdminGalleryListParams extends GalleryListParams {
  isPublished?: boolean;
}

export interface PaginatedGalleryItems {
  galleryItems: GalleryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GalleryUploadResult {
  mediaUrl: string;
  publicId: string;
  mediaType: MediaType;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface CreateGalleryItemPayload {
  title: string;
  description?: string | null;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  publicId: string;
  eventId?: string | null;
  displayOrder?: number;
}

export interface UpdateGalleryItemPayload {
  title?: string;
  description?: string | null;
  eventId?: string | null;
  displayOrder?: number;
  thumbnailUrl?: string | null;
}
