import type { Request, Response } from 'express';

import { errorResponse } from '../shared/responses/api-response.js';

export function notFoundMiddleware(request: Request, response: Response): void {
  response
    .status(404)
    .json(errorResponse(`Route ${request.method} ${request.originalUrl} was not found.`));
}
