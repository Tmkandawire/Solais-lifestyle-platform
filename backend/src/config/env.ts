import 'dotenv/config';

import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  PORT: z.coerce.number().int().positive().max(65535).default(5000),

  FRONTEND_URL: z.url(),

  JWT_ACCESS_SECRET: z.string().min(32),

  JWT_REFRESH_SECRET: z.string().min(32),

  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),

  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error('Invalid environment configuration:', z.treeifyError(parsedEnvironment.error));

  throw new Error('Environment validation failed.');
}

export const env = Object.freeze(parsedEnvironment.data);

export type Environment = z.infer<typeof environmentSchema>;
