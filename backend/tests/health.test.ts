import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { app } from '../src/app.js';

const healthResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    service: z.string(),
    environment: z.string(),
    uptime: z.number(),
    timestamp: z.string(),
  }),
});

const readinessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    status: z.string(),
    timestamp: z.string(),
  }),
});

describe('Health API', () => {
  describe('GET /api/v1/health', () => {
    it('returns the API health status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect('Content-Type', /json/)
        .expect(200);

      const body = healthResponseSchema.parse(response.body);

      expect(body).toMatchObject({
        success: true,
        message: 'Solaís Lifestyle API is healthy.',
        data: {
          service: 'solais-lifestyle-api',
          environment: 'test',
        },
      });

      expect(body.data.uptime).toEqual(expect.any(Number));

      expect(body.data.timestamp).toEqual(expect.any(String));
    });
  });

  describe('GET /api/v1/health/ready', () => {
    it('returns the API readiness status', async () => {
      const response = await request(app)
        .get('/api/v1/health/ready')
        .expect('Content-Type', /json/)
        .expect(200);

      const body = readinessResponseSchema.parse(response.body);

      expect(body).toMatchObject({
        success: true,
        message: 'Solaís Lifestyle API is ready.',
        data: {
          status: 'ready',
        },
      });

      expect(body.data.timestamp).toEqual(expect.any(String));
    });
  });
});
