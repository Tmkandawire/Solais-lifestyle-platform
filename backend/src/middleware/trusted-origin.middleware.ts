import type { Request, Response, NextFunction } from 'express';

import { env } from '../config/env.js';

export function requireTrustedOrigin(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const origin = request.get('origin');

  if (!origin || origin !== new URL(env.FRONTEND_URL).origin) {
    response.status(403).json({
      success: false,
      message: 'Request origin is not allowed.',
    });
    return;
  }

  next();
}
