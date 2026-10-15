import type { Request, Response } from 'express';

import {
  createNewGalleryItem,
  deleteGalleryItem,
  getGalleryItemById,
  getPublishedGalleryItemById,
  listGalleryItems,
  listPublishedGalleryItems,
  listGalleryItemsByEventId,
  publishGalleryItem,
  unpublishGalleryItem,
  updateExistingGalleryItem,
} from '../../services/gallery.service.js';

import { successResponse } from '../../shared/responses/api-response.js';
import { ApiError } from '../../shared/errors/api-error.js';

import { uploadGalleryMedia } from './gallery.upload.js';

import type {
  CreateGalleryItemInput,
  GalleryEventIdInput,
  GalleryIdInput,
  GalleryListQueryInput,
  UpdateGalleryItemInput,
} from './gallery.schemas.js';

type GalleryIdRequest = Request<GalleryIdInput>;

type GalleryListRequest = Request;

type GalleryEventListRequest = Request<GalleryEventIdInput>;

type CreateGalleryRequest = Request<Record<string, never>, unknown, CreateGalleryItemInput>;

type UpdateGalleryRequest = Request<GalleryIdInput, unknown, UpdateGalleryItemInput>;

/**
 * Narrows request.user from optional to required for handlers that only run
 * after the authenticate middleware.
 *
 * Reaching this without request.user means the route was wired without
 * the authenticate middleware — a server-side misconfiguration, not a
 * client error, so this is surfaced as an ApiError rather than a bare Error
 * to stay consistent with the rest of the error architecture.
 */
type AuthenticatedRequestUser = NonNullable<Request['user']>;

function requireUser(request: { user?: AuthenticatedRequestUser }): AuthenticatedRequestUser {
  if (!request.user) {
    throw new ApiError({
      statusCode: 500,
      message: 'Authenticated route handler reached without request.user.',
    });
  }

  return request.user;
}

function getGalleryListQuery(response: Response): GalleryListQueryInput {
  return response.locals.validatedQuery as GalleryListQueryInput;
}

/**
 * Creates a new gallery item.
 *
 * POST /gallery
 */
export async function createGalleryItemHandler(
  request: CreateGalleryRequest,
  response: Response,
): Promise<void> {
  const galleryItem = await createNewGalleryItem(
    {
      title: request.body.title,
      ...(request.body.description !== undefined ? { description: request.body.description } : {}),
      mediaType: request.body.mediaType,
      mediaUrl: request.body.mediaUrl,
      ...(request.body.thumbnailUrl !== undefined
        ? { thumbnailUrl: request.body.thumbnailUrl }
        : {}),
      publicId: request.body.publicId,
      ...(request.body.eventId !== undefined ? { eventId: request.body.eventId } : {}),
      ...(request.body.displayOrder !== undefined
        ? { displayOrder: request.body.displayOrder }
        : {}),
    },
    requireUser(request),
  );

  response.status(201).json(successResponse('Gallery item created successfully.', galleryItem));
}

/**
 * Uploads gallery media to Cloudinary and creates a gallery item.
 *
 * POST /gallery/upload
 */
export async function uploadGalleryItemHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const file = request.file;

  console.info('[Gallery Upload] Incoming file:', {
    present: Boolean(file),
    name: file?.originalname,
    mimeType: file?.mimetype,
    size: file?.size,
  });

  if (!file) {
    throw new ApiError({
      statusCode: 400,
      message: 'Gallery media file is required.',
    });
  }

  const uploadedMedia = await uploadGalleryMedia(file);

  response.status(201).json(
    successResponse('Gallery media uploaded successfully.', {
      mediaUrl: uploadedMedia.secureUrl,
      publicId: uploadedMedia.publicId,
      mediaType: uploadedMedia.resourceType === 'video' ? 'VIDEO' : 'IMAGE',
      format: uploadedMedia.format,
      ...(uploadedMedia.width !== undefined ? { width: uploadedMedia.width } : {}),
      ...(uploadedMedia.height !== undefined ? { height: uploadedMedia.height } : {}),
      ...(uploadedMedia.duration !== undefined ? { duration: uploadedMedia.duration } : {}),
    }),
  );
}

/**
 * Retrieves a single published gallery item for public discovery.
 *
 * GET /gallery/:id
 */
export async function getGalleryItemHandler(
  request: GalleryIdRequest,
  response: Response,
): Promise<void> {
  const galleryItem = await getPublishedGalleryItemById(request.params.id);

  response.status(200).json(successResponse('Gallery item retrieved successfully.', galleryItem));
}

/**
 * Retrieves a single gallery item for authenticated gallery managers,
 * regardless of publication state.
 *
 * GET /gallery/manage/:id
 */
export async function getManagedGalleryItemHandler(
  request: GalleryIdRequest,
  response: Response,
): Promise<void> {
  const galleryItem = await getGalleryItemById(request.params.id);

  response.status(200).json(successResponse('Gallery item retrieved successfully.', galleryItem));
}

/**
 * Retrieves published gallery items for public discovery.
 *
 * GET /gallery
 */
export async function getPublishedGalleryHandler(
  request: GalleryListRequest,
  response: Response,
): Promise<void> {
  const query = getGalleryListQuery(response);

  const result = await listPublishedGalleryItems({
    page: query.page,
    limit: query.limit,
    ...(query.mediaType !== undefined ? { mediaType: query.mediaType } : {}),
    ...(query.eventId !== undefined ? { eventId: query.eventId } : {}),
  });

  response
    .status(200)
    .json(successResponse('Published gallery items retrieved successfully.', result));
}

/**
 * Retrieves gallery items for authenticated gallery managers.
 *
 * GET /gallery/manage
 */
export async function getGalleryItemsHandler(
  request: GalleryListRequest,
  response: Response,
): Promise<void> {
  const query = getGalleryListQuery(response);

  const result = await listGalleryItems(
    {
      page: query.page,
      limit: query.limit,
      ...(query.mediaType !== undefined ? { mediaType: query.mediaType } : {}),
      ...(query.eventId !== undefined ? { eventId: query.eventId } : {}),
      ...(query.isPublished !== undefined ? { isPublished: query.isPublished } : {}),
    },
    requireUser(request),
  );

  response.status(200).json(successResponse('Gallery items retrieved successfully.', result));
}

/**
 * Retrieves published gallery items belonging to an event.
 *
 * GET /gallery/event/:eventId
 */
export async function getEventGalleryHandler(
  request: GalleryEventListRequest,
  response: Response,
): Promise<void> {
  const query = getGalleryListQuery(response);

  const result = await listGalleryItemsByEventId(request.params.eventId, {
    page: query.page,
    limit: query.limit,
    ...(query.mediaType !== undefined ? { mediaType: query.mediaType } : {}),
    isPublished: true,
  });

  response.status(200).json(successResponse('Event gallery items retrieved successfully.', result));
}

/**
 * Updates an existing gallery item.
 *
 * PATCH /gallery/:id
 */
export async function updateGalleryItemHandler(
  request: UpdateGalleryRequest,
  response: Response,
): Promise<void> {
  const galleryItem = await updateExistingGalleryItem(
    request.params.id,
    {
      ...(request.body.title !== undefined ? { title: request.body.title } : {}),
      ...(request.body.description !== undefined ? { description: request.body.description } : {}),
      ...(request.body.mediaType !== undefined ? { mediaType: request.body.mediaType } : {}),
      ...(request.body.mediaUrl !== undefined ? { mediaUrl: request.body.mediaUrl } : {}),
      ...(request.body.thumbnailUrl !== undefined
        ? { thumbnailUrl: request.body.thumbnailUrl }
        : {}),
      ...(request.body.publicId !== undefined ? { publicId: request.body.publicId } : {}),
      ...(request.body.eventId !== undefined ? { eventId: request.body.eventId } : {}),
      ...(request.body.displayOrder !== undefined
        ? { displayOrder: request.body.displayOrder }
        : {}),
    },
    requireUser(request),
  );

  response.status(200).json(successResponse('Gallery item updated successfully.', galleryItem));
}

/**
 * Publishes an existing gallery item.
 *
 * POST /gallery/:id/publish
 */
export async function publishGalleryItemHandler(
  request: GalleryIdRequest,
  response: Response,
): Promise<void> {
  const galleryItem = await publishGalleryItem(request.params.id, requireUser(request));

  response.status(200).json(successResponse('Gallery item published successfully.', galleryItem));
}

/**
 * Unpublishes an existing gallery item.
 *
 * POST /gallery/:id/unpublish
 */
export async function unpublishGalleryItemHandler(
  request: GalleryIdRequest,
  response: Response,
): Promise<void> {
  const galleryItem = await unpublishGalleryItem(request.params.id, requireUser(request));

  response.status(200).json(successResponse('Gallery item unpublished successfully.', galleryItem));
}

/**
 * Soft-deletes an existing gallery item.
 *
 * DELETE /gallery/:id
 */
export async function deleteGalleryItemHandler(
  request: GalleryIdRequest,
  response: Response,
): Promise<void> {
  const galleryItem = await deleteGalleryItem(request.params.id, requireUser(request));

  response.status(200).json(successResponse('Gallery item deleted successfully.', galleryItem));
}
