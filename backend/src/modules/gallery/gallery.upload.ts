import multer from 'multer';
import type { FileFilterCallback } from 'multer';
import type { Request } from 'express';
import type { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

import { cloudinary } from '../../lib/cloudinary.js';
import { ApiError } from '../../shared/errors/api-error.js';

const MAX_GALLERY_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

const allowedMimeTypes = new Set([...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]);

const galleryStorage = multer.memoryStorage();

function galleryFileFilter(
  _request: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
): void {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(
      new ApiError({
        statusCode: 400,
        message:
          'Unsupported gallery media type. Only JPEG, PNG, WEBP, MP4, WEBM, and MOV files are allowed.',
      }),
    );

    return;
  }

  callback(null, true);
}

export const galleryUpload = multer({
  storage: galleryStorage,
  limits: {
    fileSize: MAX_GALLERY_FILE_SIZE,
    files: 1,
  },
  fileFilter: galleryFileFilter,
});

export interface GalleryCloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  resourceType: 'image' | 'video';
  format: string;
  width?: number;
  height?: number;
  duration?: number;
}

function uploadBufferToCloudinary(
  file: Express.Multer.File,
): Promise<GalleryCloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        upload_preset: 'solais_gallery',
        resource_type: resourceType,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          console.error('[Gallery Upload] Cloudinary error:', {
            message: error.message,
            http_code: error.http_code,
          });

          reject(
            new ApiError({
              statusCode: 502,
              message: 'Failed to upload gallery media to Cloudinary.',
              errors: [
                {
                  field: 'file',
                  message: error.message,
                },
              ],
            }),
          );

          return;
        }

        if (!result) {
          reject(
            new ApiError({
              statusCode: 502,
              message: 'Cloudinary returned no upload result.',
            }),
          );

          return;
        }

        const width = typeof result.width === 'number' ? result.width : undefined;
        const height = typeof result.height === 'number' ? result.height : undefined;
        const duration = typeof result.duration === 'number' ? result.duration : undefined;

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          resourceType,
          format: result.format,
          ...(width !== undefined ? { width } : {}),
          ...(height !== undefined ? { height } : {}),
          ...(duration !== undefined ? { duration } : {}),
        });
      },
    );

    uploadStream.end(file.buffer);
  });
}

/**
 * Uploads a validated gallery file to Cloudinary.
 */
export async function uploadGalleryMedia(
  file: Express.Multer.File,
): Promise<GalleryCloudinaryUploadResult> {
  return uploadBufferToCloudinary(file);
}
