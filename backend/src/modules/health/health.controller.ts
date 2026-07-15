import type { Request, Response } from 'express';

import { env } from '../../config/env.js';
import { successResponse } from '../../shared/responses/api-response.js';

export function getHealth(_request: Request, response: Response): void {
  response.status(200).json(
    successResponse('Solaís Lifestyle API is healthy.', {
      service: 'solais-lifestyle-api',
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  );
}

export function getReadiness(_request: Request, response: Response): void {
  response.status(200).json(
    successResponse('Solaís Lifestyle API is ready.', {
      status: 'ready',
      timestamp: new Date().toISOString(),
    }),
  );
}
