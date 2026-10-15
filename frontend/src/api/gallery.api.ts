import { apiClient } from "./client";
import type { ApiSuccessResponse } from "../types/api";
import type {
  AdminGalleryListParams,
  CreateGalleryItemPayload,
  GalleryItem,
  GalleryListParams,
  GalleryUploadResult,
  PaginatedGalleryItems,
  UpdateGalleryItemPayload,
} from "../types/gallery";

export async function getGalleryItems(
  params?: GalleryListParams,
): Promise<PaginatedGalleryItems> {
  const response = await apiClient.get<
    ApiSuccessResponse<PaginatedGalleryItems>
  >("/gallery", { params });

  return response.data.data;
}

export async function getGalleryItem(id: string): Promise<GalleryItem> {
  const response = await apiClient.get<ApiSuccessResponse<GalleryItem>>(
    `/gallery/${id}`,
  );

  return response.data.data;
}

export async function getEventGallery(
  eventId: string,
  params?: Omit<GalleryListParams, "eventId">,
): Promise<PaginatedGalleryItems> {
  const response = await apiClient.get<
    ApiSuccessResponse<PaginatedGalleryItems>
  >(`/gallery/event/${eventId}`, { params });

  return response.data.data;
}

export async function getAdminGalleryItems(
  params?: AdminGalleryListParams,
): Promise<PaginatedGalleryItems> {
  const response = await apiClient.get<
    ApiSuccessResponse<PaginatedGalleryItems>
  >("/gallery/manage", { params });

  return response.data.data;
}

export async function getAdminGalleryItem(id: string): Promise<GalleryItem> {
  const response = await apiClient.get<ApiSuccessResponse<GalleryItem>>(
    `/gallery/manage/${id}`,
  );

  return response.data.data;
}

export async function uploadGalleryMedia(
  file: File,
): Promise<GalleryUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<
    ApiSuccessResponse<GalleryUploadResult>
  >("/gallery/upload", formData);

  return response.data.data;
}

export async function createGalleryItem(
  payload: CreateGalleryItemPayload,
): Promise<GalleryItem> {
  const response = await apiClient.post<ApiSuccessResponse<GalleryItem>>(
    "/gallery",
    payload,
  );

  return response.data.data;
}

export async function updateGalleryItem(
  id: string,
  payload: UpdateGalleryItemPayload,
): Promise<GalleryItem> {
  const response = await apiClient.patch<ApiSuccessResponse<GalleryItem>>(
    `/gallery/${id}`,
    payload,
  );

  return response.data.data;
}

export async function publishGalleryItem(id: string): Promise<GalleryItem> {
  const response = await apiClient.post<ApiSuccessResponse<GalleryItem>>(
    `/gallery/${id}/publish`,
  );

  return response.data.data;
}

export async function unpublishGalleryItem(id: string): Promise<GalleryItem> {
  const response = await apiClient.post<ApiSuccessResponse<GalleryItem>>(
    `/gallery/${id}/unpublish`,
  );

  return response.data.data;
}

export async function deleteGalleryItem(id: string): Promise<GalleryItem> {
  const response = await apiClient.delete<ApiSuccessResponse<GalleryItem>>(
    `/gallery/${id}`,
  );

  return response.data.data;
}
