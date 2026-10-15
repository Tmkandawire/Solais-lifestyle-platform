import type { MediaType, Prisma, Gallery } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { GalleryNotFoundError } from '../shared/errors/gallery.errors.js';

export interface CreateGalleryItemData {
  title: string;
  description?: string | null;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  publicId: string;
  eventId?: string | null;
  displayOrder?: number;
  isPublished?: boolean;
}

export interface UpdateGalleryItemData {
  title?: string;
  description?: string | null;
  mediaType?: MediaType;
  mediaUrl?: string;
  thumbnailUrl?: string | null;
  publicId?: string;
  eventId?: string | null;
  displayOrder?: number;
  isPublished?: boolean;
}

export interface FindGalleryItemsOptions {
  page: number;
  limit: number;
  mediaType?: MediaType;
  eventId?: string;
  isPublished?: boolean;
}

export interface PaginatedGalleryItems {
  galleryItems: Gallery[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Creates a gallery item.
 */
export async function createGalleryItem(data: CreateGalleryItemData): Promise<Gallery> {
  return await prisma.gallery.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      mediaType: data.mediaType,
      mediaUrl: data.mediaUrl,
      thumbnailUrl: data.thumbnailUrl ?? null,
      publicId: data.publicId,
      eventId: data.eventId ?? null,
      displayOrder: data.displayOrder ?? 0,
      isPublished: data.isPublished ?? false,
    },
  });
}

/**
 * Finds a non-deleted gallery item by ID.
 *
 * Soft-deleted gallery items are intentionally excluded from normal reads.
 */
export async function findGalleryItemById(id: string): Promise<Gallery | null> {
  return await prisma.gallery.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
}

/**
 * Finds gallery items using pagination and optional filters.
 *
 * Soft-deleted gallery items are excluded automatically.
 */
export async function findGalleryItems(
  options: FindGalleryItemsOptions,
): Promise<PaginatedGalleryItems> {
  const { page, limit, mediaType, eventId, isPublished } = options;

  const where: Prisma.GalleryWhereInput = {
    deletedAt: null,

    ...(mediaType !== undefined ? { mediaType } : {}),

    ...(eventId !== undefined ? { eventId } : {}),

    ...(isPublished !== undefined ? { isPublished } : {}),
  };

  const skip = (page - 1) * limit;

  const [galleryItems, total] = await prisma.$transaction([
    prisma.gallery.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),

    prisma.gallery.count({
      where,
    }),
  ]);

  return {
    galleryItems,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Finds published gallery items.
 *
 * Intended for the public-facing gallery.
 */
export async function findPublishedGalleryItems(
  options: FindGalleryItemsOptions,
): Promise<PaginatedGalleryItems> {
  return findGalleryItems({
    ...options,
    isPublished: true,
  });
}

/**
 * Finds gallery items belonging to a specific event.
 */
export async function findGalleryItemsByEventId(
  eventId: string,
  options: FindGalleryItemsOptions,
): Promise<PaginatedGalleryItems> {
  return findGalleryItems({
    ...options,
    eventId,
  });
}

/**
 * Updates a non-deleted gallery item.
 *
 * The deletedAt condition is enforced inside the database update itself,
 * preventing soft-deleted records from being modified.
 */
export async function updateGalleryItem(id: string, data: UpdateGalleryItemData): Promise<Gallery> {
  const result = await prisma.gallery.updateMany({
    where: {
      id,
      deletedAt: null,
    },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.mediaType !== undefined ? { mediaType: data.mediaType } : {}),
      ...(data.mediaUrl !== undefined ? { mediaUrl: data.mediaUrl } : {}),
      ...(data.thumbnailUrl !== undefined ? { thumbnailUrl: data.thumbnailUrl } : {}),
      ...(data.publicId !== undefined ? { publicId: data.publicId } : {}),
      ...(data.eventId !== undefined ? { eventId: data.eventId } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
    },
  });

  if (result.count === 0) {
    throw new GalleryNotFoundError(id);
  }

  const galleryItem = await findGalleryItemById(id);

  if (!galleryItem) {
    throw new GalleryNotFoundError(id);
  }

  return galleryItem;
}

/**
 * Soft-deletes a gallery item.
 *
 * A deleted gallery item cannot be modified again through the repository's
 * normal mutation paths.
 */
export async function softDeleteGalleryItem(id: string): Promise<Gallery> {
  const deletedAt = new Date();

  const result = await prisma.gallery.updateMany({
    where: {
      id,
      deletedAt: null,
    },
    data: {
      deletedAt,
    },
  });

  if (result.count === 0) {
    throw new GalleryNotFoundError(id);
  }

  const galleryItem = await prisma.gallery.findUnique({
    where: {
      id,
    },
  });

  if (!galleryItem) {
    throw new GalleryNotFoundError(id);
  }

  return galleryItem;
}
