import type { NextFunction, Request, Response } from 'express';

import type { Role } from '../generated/prisma/enums.js';
import { verifyAccessToken } from '../services/jwt.service.js';
import { validateSession } from '../services/session.service.js';
import { ForbiddenError, InvalidCredentialsError } from '../shared/errors/auth.errors.js';
import { InvalidAccessTokenError } from '../shared/errors/jwt.errors.js';

export interface AuthenticatedUser {
  accountId: string;
  sessionId: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export async function authenticate(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authorization = request.get('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      throw new InvalidCredentialsError();
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      throw new InvalidCredentialsError();
    }

    const payload = await verifyAccessToken(token);

    const session = await validateSession(payload.sessionId, payload.sub);

    if (!session) {
      throw new InvalidCredentialsError();
    }

    const authenticatedRequest = request as AuthenticatedRequest;

    authenticatedRequest.user = {
      accountId: payload.sub,
      sessionId: payload.sessionId,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof InvalidAccessTokenError) {
      next(new InvalidCredentialsError());
      return;
    }

    next(error);
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const authenticatedRequest = request as AuthenticatedRequest;

    if (!authenticatedRequest.user) {
      next(new InvalidCredentialsError());
      return;
    }

    if (!allowedRoles.includes(authenticatedRequest.user.role)) {
      next(new ForbiddenError());
      return;
    }

    next();
  };
}
