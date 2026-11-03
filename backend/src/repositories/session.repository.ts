import { prisma } from '../lib/prisma.js';
import { Prisma } from '../generated/prisma/client.js';
import { SessionNotFoundError } from '../shared/errors/session.errors.js';

export interface CreateSessionData {
  id?: string;
  accountId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function createSession(data: CreateSessionData) {
  return prisma.session.create({
    data: {
      ...(data.id !== undefined ? { id: data.id } : {}),
      accountId: data.accountId,
      refreshTokenHash: data.refreshTokenHash,
      expiresAt: data.expiresAt,

      ...(data.ipAddress !== undefined ? { ipAddress: data.ipAddress } : {}),

      ...(data.userAgent !== undefined ? { userAgent: data.userAgent } : {}),
    },
  });
}

export async function findSessionById(id: string) {
  return prisma.session.findUnique({
    where: { id },
  });
}

// IMPORTANT:
// refreshTokenHash must use a deterministic hash (e.g. SHA-256 or
// HMAC-SHA256), never bcrypt. This lookup relies on exact equality.
// Requires refreshTokenHash to be @unique in schema.prisma.
export async function findSessionByRefreshTokenHash(refreshTokenHash: string) {
  return prisma.session.findUnique({
    where: { refreshTokenHash },
  });
}

/**
 * Atomically rotates a refresh token only when the stored hash
 * still matches the token presented by the caller.
 *
 * The existing expiresAt is intentionally preserved to enforce
 * an absolute session lifetime.
 */
export async function updateRefreshTokenHash(
  sessionId: string,
  expectedRefreshTokenHash: string,
  newRefreshTokenHash: string,
): Promise<boolean> {
  const result = await prisma.session.updateMany({
    where: {
      id: sessionId,
      refreshTokenHash: expectedRefreshTokenHash,
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    data: {
      refreshTokenHash: newRefreshTokenHash,
    },
  });

  return result.count === 1;
}

export async function revokeSession(id: string) {
  return updateOrThrow(id, {
    revokedAt: new Date(),
  });
}

export async function revokeAllSessionsForAccount(accountId: string): Promise<Prisma.BatchPayload> {
  return prisma.session.updateMany({
    where: {
      accountId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function deleteExpiredSessions(): Promise<Prisma.BatchPayload> {
  return prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

async function updateOrThrow(id: string, data: Prisma.SessionUpdateInput) {
  try {
    return await prisma.session.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new SessionNotFoundError(id);
    }

    throw error;
  }
}
