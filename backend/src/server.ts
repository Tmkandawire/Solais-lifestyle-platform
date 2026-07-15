import { createServer } from 'node:http';

import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './shared/logger/logger.js';

const server = createServer(app);

server.listen(env.PORT, () => {
  logger.info(`Solaís Lifestyle API is running on http://localhost:${env.PORT}`);

  logger.info(`Environment: ${env.NODE_ENV}`);
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info(`${signal} received. Starting graceful shutdown.`);

  server.close((error) => {
    if (error) {
      logger.error('HTTP server failed to close gracefully.', {
        error,
      });

      process.exitCode = 1;

      return;
    }

    logger.info('HTTP server closed successfully.');

    process.exitCode = 0;
  });
}

process.once('SIGINT', shutdown);

process.once('SIGTERM', shutdown);
