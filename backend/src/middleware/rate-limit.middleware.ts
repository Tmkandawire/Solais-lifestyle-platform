import { rateLimit } from 'express-rate-limit';

import { env } from '../config/env.js';

const WINDOW_MS = 15 * 60 * 1000;
const isProduction = env.NODE_ENV === 'production';

interface LimiterOptions {
  /** Production limit per IP per window. Development gets 20x this. */
  limit: number;
  message: string;
  /** Count only responses with status >= 400 (e.g. failed logins). */
  failuresOnly?: boolean;
}

function createLimiter({ limit, message, failuresOnly = false }: LimiterOptions) {
  return rateLimit({
    windowMs: WINDOW_MS,
    limit: isProduction ? limit : limit * 20,

    standardHeaders: 'draft-8',
    legacyHeaders: false,

    skipSuccessfulRequests: failuresOnly,

    message: {
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message,
      errors: [],
    },
  });
}

/**
 * Safety net for the whole API.
 * Authentication and health routes use dedicated handling.
 */
export const globalRateLimiter = createLimiter({
  limit: 300,
  message: 'Too many requests. Please try again later.',
});

/**
 * Failed attempts only.
 * Successful logins do not consume the login budget.
 */
export const loginRateLimiter = createLimiter({
  limit: 10,
  failuresOnly: true,
  message: 'Too many sign-in attempts. Please try again in a few minutes.',
});

export const registerRateLimiter = createLimiter({
  limit: 5,
  message: 'Too many registration attempts. Please try again later.',
});

/**
 * Refresh runs on every page initialization and whenever an expired
 * access token needs to be replaced.
 */
export const refreshRateLimiter = createLimiter({
  limit: 60,
  message: 'Too many session refresh attempts. Please try again shortly.',
});

/**
 * Contact form submissions are rate-limited to prevent spam and abuse.
 */
export const contactSubmissionRateLimiter = createLimiter({
  limit: 5,
  message: 'Too many enquiries submitted. Please try again later.',
});
