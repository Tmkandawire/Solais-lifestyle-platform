import { describe, expect, it, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

import { requireTrustedOrigin } from '../src/middleware/trusted-origin.middleware.js';
import { env } from '../src/config/env.js';

function makeRequest(origin?: string): Request {
  return {
    get: vi.fn((name: string) => {
      if (name.toLowerCase() === 'origin') {
        return origin;
      }

      return undefined;
    }),
  } as unknown as Request;
}

function makeResponse() {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };

  return response as unknown as Response & typeof response;
}

describe('trusted-origin middleware', () => {
  it('allows the configured frontend origin', () => {
    const request = makeRequest(new URL(env.FRONTEND_URL).origin);
    const response = makeResponse();
    const next = vi.fn() as NextFunction;

    requireTrustedOrigin(request, response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(response.status).not.toHaveBeenCalled();
    expect(response.json).not.toHaveBeenCalled();
  });

  it('rejects an untrusted origin', () => {
    const request = makeRequest('https://attacker.example');
    const response = makeResponse();
    const next = vi.fn() as NextFunction;

    requireTrustedOrigin(request, response, next);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Request origin is not allowed.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a missing origin', () => {
    const request = makeRequest();
    const response = makeResponse();
    const next = vi.fn() as NextFunction;

    requireTrustedOrigin(request, response, next);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a lookalike origin', () => {
    const trustedOrigin = new URL(env.FRONTEND_URL).origin;
    const request = makeRequest(`${trustedOrigin}.attacker.example`);
    const response = makeResponse();
    const next = vi.fn() as NextFunction;

    requireTrustedOrigin(request, response, next);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
