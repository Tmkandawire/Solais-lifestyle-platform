import { Role } from '../generated/prisma/enums.js';
import type { MediaType } from '../generated/prisma/enums.js';
import type { Gallery } from '../generated/prisma/client.js';
import {
  createGalleryItem,
  findGalleryItemById,
  findGalleryItems,
  findGalleryItemsByEventId,
  findPublishedGalleryItems,
  softDeleteGalleryItem,
  updateGalleryItem,
  type CreateGalleryItemData,
  type FindGalleryItemsOptions,
  type PaginatedGalleryItems,
  type UpdateGalleryItemData,
} from '../repositories/gallery.repository.js';
import { getEventById } from './event.service.js';
import { GalleryNotFoundError } from '../shared/errors/gallery.errors.js';
import { ApiError } from '../shared/errors/api-error.js';

export interface GalleryActor {
  accountId: string;
  role: Role;
}

export interface CreateGalleryItemServiceData {
  title: string;
  description?: string | null;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  publicId: string;
  eventId?: string | null;
  displayOrder?: number;
}

export interface UpdateGalleryItemServiceData {
  title?: string;
  description?: string | null;
  mediaType?: MediaType;
  mediaUrl?: string;
  thumbnailUrl?: string | null;
  publicId?: string;
  eventId?: string | null;
  displayOrder?: number;
}

function canManageGallery(role: Role): boolean {
  return role === Role.SUPER_ADMIN || role === Role.ADMIN;
}

function requireGalleryManager(actor: GalleryActor): void {
  if (!canManageGallery(actor.role)) {
    throw new ApiError({
      statusCode: 403,
      message: 'You do not have permission to manage gallery items.',
    });
  }
}

function assertValidDisplayOrder(displayOrder: number | undefined): void {
  if (displayOrder !== undefined && (!Number.isInteger(displayOrder) || displayOrder < 0)) {
    throw new ApiError({
      statusCode: 400,
      message: 'Gallery display order must be a non-negative whole number.',
    });
  }
}

/**
 * Creates a new gallery item.
 *
 * New gallery items are always created as unpublished.
 * Publication is controlled through the dedicated publish/unpublish
 * operations rather than through the generic create/update path.
 */
export async function createNewGalleryItem(
  data: CreateGalleryItemServiceData,
  actor: GalleryActor,
): Promise<Gallery> {
  requireGalleryManager(actor);

  if (data.eventId !== undefined && data.eventId !== null) {
    await getEventById(data.eventId);
  }

  assertValidDisplayOrder(data.displayOrder);

  const galleryData: CreateGalleryItemData = {
    title: data.title,
    mediaType: data.mediaType,
    mediaUrl: data.mediaUrl,
    publicId: data.publicId,
    isPublished: false,
    displayOrder: data.displayOrder ?? 0,

    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.thumbnailUrl !== undefined ? { thumbnailUrl: data.thumbnailUrl } : {}),
    ...(data.eventId !== undefined ? { eventId: data.eventId } : {}),
  };

  return createGalleryItem(galleryData);
}

/**
 * Retrieves a single non-deleted gallery item.
 */
export async function getGalleryItemById(id: string): Promise<Gallery> {
  const galleryItem = await findGalleryItemById(id);

  if (!galleryItem) {
    throw new GalleryNotFoundError(id);
  }

  return galleryItem;
}

/**
 * Retrieves a single published gallery item for public consumption.
 */
export async function getPublishedGalleryItemById(id: string): Promise<Gallery> {
  const galleryItem = await getGalleryItemById(id);

  if (!galleryItem.isPublished) {
    throw new GalleryNotFoundError(id);
  }

  return galleryItem;
}

/**
 * Retrieves gallery items for administrative management.
 */
export async function listGalleryItems(
  options: FindGalleryItemsOptions,
  actor: GalleryActor,
): Promise<PaginatedGalleryItems> {
  requireGalleryManager(actor);

  return findGalleryItems(options);
}

/**
 * Retrieves published gallery items for the public gallery.
 */
export async function listPublishedGalleryItems(
  options: FindGalleryItemsOptions,
): Promise<PaginatedGalleryItems> {
  return findPublishedGalleryItems(options);
}

/**
 * Retrieves published gallery items associated with a specific event.
 *
 * The event must exist before querying its gallery items.
 */
export async function listGalleryItemsByEventId(
  eventId: string,
  options: FindGalleryItemsOptions,
): Promise<PaginatedGalleryItems> {
  await getEventById(eventId);

  return findGalleryItemsByEventId(eventId, {
    ...options,
    isPublished: true,
  });
}

/**
 * Updates an existing gallery item's non-lifecycle fields.
 *
 * Publication state cannot be changed through this operation.
 */
export async function updateExistingGalleryItem(
  id: string,
  data: UpdateGalleryItemServiceData,
  actor: GalleryActor,
): Promise<Gallery> {
  requireGalleryManager(actor);

  await getGalleryItemById(id);

  if (data.eventId !== undefined && data.eventId !== null) {
    await getEventById(data.eventId);
  }

  assertValidDisplayOrder(data.displayOrder);

  const updateData: UpdateGalleryItemData = {
    ...data,
  };

  return updateGalleryItem(id, updateData);
}

/**
 * Publishes a gallery item.
 *
 * Idempotent if the item is already published.
 */
export async function publishGalleryItem(id: string, actor: GalleryActor): Promise<Gallery> {
  requireGalleryManager(actor);

  const galleryItem = await getGalleryItemById(id);

  if (galleryItem.isPublished) {
    return galleryItem;
  }

  return updateGalleryItem(id, {
    isPublished: true,
  });
}

/**
 * Unpublishes a gallery item.
 *
 * Idempotent if the item is already unpublished.
 */
export async function unpublishGalleryItem(id: string, actor: GalleryActor): Promise<Gallery> {
  requireGalleryManager(actor);

  const galleryItem = await getGalleryItemById(id);

  if (!galleryItem.isPublished) {
    return galleryItem;
  }

  return updateGalleryItem(id, {
    isPublished: false,
  });
}

/**
 * Soft-deletes an existing gallery item.
 */
export async function deleteGalleryItem(id: string, actor: GalleryActor): Promise<Gallery> {
  requireGalleryManager(actor);

  await getGalleryItemById(id);

  return softDeleteGalleryItem(id);
}
