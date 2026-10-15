import type { NextFunction, Request, Response } from 'express';

import { Role } from '../generated/prisma/enums.js';
import { ForbiddenError } from '../shared/errors/auth.errors.js';
import type { AuthenticatedRequest } from './auth.middleware.js';

/**
 * Requires the authenticated account to have an administrative role.
 *
 * Authentication must run before this middleware. If request.user is
 * missing here, that indicates requireAdmin was wired onto a route
 * without authenticate running first — a route-configuration bug, not a
 * legitimate authorization outcome — and is thrown as a hard error rather
 * than folded into the same ForbiddenError a real non-admin user would
 * receive.
 *
 * Allowed roles:
 * - ADMIN
 * - SUPER_ADMIN
 */
export function requireAdmin(request: Request, _response: Response, next: NextFunction): void {
  const authenticatedRequest = request as AuthenticatedRequest;

  if (!authenticatedRequest.user) {
    next(new Error('requireAdmin reached without request.user — authenticate must run first.'));
    return;
  }

  const { role } = authenticatedRequest.user;

  if (role !== Role.ADMIN && role !== Role.SUPER_ADMIN) {
    next(new ForbiddenError());
    return;
  }

  next();
}
