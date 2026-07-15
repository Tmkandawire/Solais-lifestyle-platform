import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { app } from '../src/app.js';

const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.array(
    z.object({
      field: z.string().optional(),
      message: z.string(),
    }),
  ),
});

describe('Not-found middleware', () => {
  it('returns the standard API error response for an unknown route', async () => {
    const response = await request(app)
      .get('/api/v1/does-not-exist')
      .expect('Content-Type', /json/)
      .expect(404);

    const body = errorResponseSchema.parse(response.body);

    expect(body).toEqual({
      success: false,
      message: 'Route GET /api/v1/does-not-exist was not found.',
      errors: [],
    });
  });
});
