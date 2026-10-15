import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info';
const isDev = process.env.NODE_ENV === 'development';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

function buildPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter,
    // Strip passwordHash from every query result by default. Repository
    // functions that genuinely need it (e.g. login) override this per-call
    // with `omit: { passwordHash: false }` rather than this default being
    // relaxed globally.
    omit: {
      account: { passwordHash: true },
    },
    log: isDev
      ? ['query', 'warn', 'error']
      : LOG_LEVEL === 'debug'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
  });
}

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? buildPrismaClient();

// In dev we deliberately keep the client on globalThis so it survives
// ts-node-dev / nodemon reloads instead of exhausting the connection pool.
// In production there's no reload cycle, so we don't need to pollute globalThis.
if (isDev) {
  globalThis.prisma = prisma;
}

// Graceful shutdown: close DB connections cleanly on process termination
// (container stop, k8s rolling deploy, CI teardown, etc.) instead of letting
// them get killed mid-query. Wrapped in try/catch so a failure here (e.g.
// the connection is already gone) doesn't surface as an unhandled rejection
// during shutdown.
async function disconnect() {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting Prisma', error);
  }
}

const shutdown = async () => {
  await disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
