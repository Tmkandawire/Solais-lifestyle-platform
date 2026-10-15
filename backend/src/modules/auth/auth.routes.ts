import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import {
  loginRateLimiter,
  refreshRateLimiter,
  registerRateLimiter,
} from '../../middleware/rate-limit.middleware.js';

import {
  loginAccount,
  logoutAccount,
  logoutAllSessions,
  refreshAccessToken,
  registerAccount,
  getCurrentAccountHandler,
} from './auth.controller.js';

import { validateBody } from '../../middleware/validation.middleware.js';
import { loginSchema, registerSchema } from './auth.schemas.js';

export const authRouter = Router();

authRouter.post('/register', registerRateLimiter, validateBody(registerSchema), registerAccount);

authRouter.post('/login', loginRateLimiter, validateBody(loginSchema), loginAccount);

authRouter.post('/refresh', refreshRateLimiter, refreshAccessToken);

authRouter.get('/me', authenticate, getCurrentAccountHandler);

authRouter.post('/logout', authenticate, logoutAccount);

authRouter.post('/logout/all', authenticate, logoutAllSessions);
