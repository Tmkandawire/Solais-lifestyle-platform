import type { NextFunction, Request, Response } from 'express';

import { Role } from '../../generated/prisma/enums.js';
import { ApiError } from '../../shared/errors/api-error.js';

/**
 * Roles allowed to manage gallery content (upload, list all, edit, publish,
 * unpublish, delete).
 *
 * This is the single source of truth for gallery management access. The
 * route middleware below and the gallery service checks should both use it,
 * so the two layers cannot drift apart.
 */
const GALLERY_MANAGER_ROLES: ReadonlySet<Role> = new Set<Role>([Role.ADMIN, Role.SUPER_ADMIN]);

export function canManageGallery(role: Role): boolean {
  return GALLERY_MANAGER_ROLES.has(role);
}

/**
 * Route-level guard for gallery management endpoints.
 *
 * Must run after `authenticate` and BEFORE any body or file parsing such as
 * Multer, so an unauthorised caller cannot make the server buffer or stream
 * an upload. The service layer still enforces the same rule as a second line
 * of defence.
 */
export function requireGalleryManager(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const user = request.user;

  if (!user) {
    // `authenticate` did not run first. That is a route wiring bug, not a
    // client error, so fail closed with a 500 instead of a misleading 401/403.
    next(
      new ApiError({
        statusCode: 500,
        message: 'Gallery authorization ran without an authenticated user.',
      }),
    );
    return;
  }

  if (!canManageGallery(user.role)) {
    next(
      new ApiError({
        statusCode: 403,
        message: 'You do not have permission to manage gallery items.',
      }),
    );
    return;
  }

  next();
}
