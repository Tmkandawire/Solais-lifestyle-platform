import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

import { env } from '../config/env.js';
import { ApiError } from '../shared/errors/api-error.js';
import { logger } from '../shared/logger/logger.js';
import { errorResponse, type ApiErrorDetail } from '../shared/responses/api-response.js';

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  if (error instanceof ApiError) {
    const details = error.errors.filter(
      (item): item is ApiErrorDetail =>
        typeof item === 'object' &&
        item !== null &&
        'message' in item &&
        typeof item.message === 'string',
    );

    if (!error.isOperational) {
      logger.error('Non-operational application error', {
        method: request.method,
        path: request.originalUrl,
        error,
      });
    }

    response.status(error.statusCode).json(errorResponse(error.message, details));

    return;
  }

  logger.error('Unhandled application error', {
    method: request.method,
    path: request.originalUrl,
    error,
  });

  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : error instanceof Error
        ? error.message
        : 'An unexpected error occurred.';

  response.status(500).json(errorResponse(message));
};
