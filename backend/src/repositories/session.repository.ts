import { prisma } from '../lib/prisma.js';
import { Prisma } from '../generated/prisma/client.js';
import { SessionNotFoundError } from '../shared/errors/session.errors.js';

export interface CreateSessionData {
  accountId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function createSession(data: CreateSessionData) {
  return prisma.session.create({
    data: {
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

export async function updateRefreshTokenHash(id: string, refreshTokenHash: string) {
  return updateOrThrow(id, {
    refreshTokenHash,
  });
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
