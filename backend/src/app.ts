import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { globalRateLimiter } from './middleware/rate-limit.middleware.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { healthRouter } from './modules/health/health.routes.js';

export const app = express();

app.disable('x-powered-by');

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(compression());

app.use(express.json({ limit: '1mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  }),
);

app.use(cookieParser());

app.use(globalRateLimiter);

app.use('/api/v1/health', healthRouter);

app.use('/api/v1/auth', authRouter);

app.use(notFoundMiddleware);

app.use(errorMiddleware);
