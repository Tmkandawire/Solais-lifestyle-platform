import { randomUUID, timingSafeEqual } from 'node:crypto';

import { env } from '../config/env.js';
import { findAccountById } from '../repositories/account.repository.js';
import {
  createSession as createSessionRecord,
  findSessionById,
  updateRefreshTokenHash,
  revokeSession as revokeSessionRecord,
  revokeAllSessionsForAccount,
  deleteExpiredSessions,
} from '../repositories/session.repository.js';
import { hashRefreshToken } from './token.service.js';
import { generateRefreshToken as generateRefreshJwt, verifyRefreshToken } from './jwt.service.js';

export interface CreateSessionOptions {
  accountId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface SessionTokens {
  sessionId: string;
  refreshToken: string;
  expiresAt: Date;
}

function durationToMilliseconds(duration: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(duration.trim());

  if (!match) {
    throw new Error(
      `Unsupported JWT duration "${duration}". Expected values such as 30s, 15m, 1h, or 7d.`,
    );
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1_000;
    case 'm':
      return value * 60_000;
    case 'h':
      return value * 3_600_000;
    case 'd':
      return value * 86_400_000;
    default:
      throw new Error(`Unsupported JWT duration unit "${unit}".`);
  }
}

function getRefreshSessionExpiry(): Date {
  return new Date(Date.now() + durationToMilliseconds(env.JWT_REFRESH_EXPIRES_IN));
}

function hashesMatch(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const actualBuffer = Buffer.from(actual, 'utf8');

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

/**
 * Creates a server-side session and its associated refresh JWT.
 *
 * The session ID is generated first because the refresh JWT contains
 * the session ID in its payload.
 */
export async function createSession(options: CreateSessionOptions): Promise<SessionTokens> {
  const sessionId = randomUUID();
  const refreshToken = await generateRefreshJwt(options.accountId, sessionId);

  const refreshTokenHash = hashRefreshToken(refreshToken);
  const expiresAt = getRefreshSessionExpiry();

  await createSessionRecord({
    id: sessionId,
    accountId: options.accountId,
    refreshTokenHash,
    expiresAt,

    ...(options.ipAddress !== undefined ? { ipAddress: options.ipAddress } : {}),

    ...(options.userAgent !== undefined ? { userAgent: options.userAgent } : {}),
  });

  return {
    sessionId,
    refreshToken,
    expiresAt,
  };
}

/**
 * Retrieves a session by its ID.
 */
export async function getSession(sessionId: string) {
  return findSessionById(sessionId);
}

/**
 * Validates that a session is usable.
 *
 * A session is invalid when:
 * - it does not exist
 * - it has been revoked
 * - it has expired
 * - its account no longer exists
 * - its account has been deactivated
 * - its account has been soft-deleted
 */
export async function validateSession(sessionId: string, accountId: string) {
  const session = await findSessionById(sessionId);

  if (!session) {
    return null;
  }

  if (session.accountId !== accountId) {
    return null;
  }

  if (session.revokedAt !== null) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    return null;
  }

  const account = await findAccountById(accountId);

  if (!account) {
    return null;
  }

  if (!account.isActive || account.deletedAt !== null) {
    return null;
  }

  return session;
}

/**
 * Rotates a refresh token while keeping the same server-side session.
 *
 * The old refresh token becomes invalid as soon as its stored hash
 * is replaced.
 */
export async function rotateRefreshToken(refreshToken: string): Promise<SessionTokens | null> {
  const payload = await verifyRefreshToken(refreshToken);

  const session = await findSessionById(payload.sessionId);

  if (!session) {
    return null;
  }

  if (session.accountId !== payload.sub) {
    return null;
  }

  if (session.revokedAt !== null || session.expiresAt <= new Date()) {
    return null;
  }

  const presentedTokenHash = hashRefreshToken(refreshToken);

  if (!hashesMatch(session.refreshTokenHash, presentedTokenHash)) {
    return null;
  }

  const refreshTokenJwt = await generateRefreshJwt(payload.sub, payload.sessionId);

  const newRefreshTokenHash = hashRefreshToken(refreshTokenJwt);
  const expiresAt = getRefreshSessionExpiry();

  await updateRefreshTokenHash(payload.sessionId, newRefreshTokenHash, expiresAt);

  return {
    sessionId: payload.sessionId,
    refreshToken: refreshTokenJwt,
    expiresAt,
  };
}

/**
 * Revokes one session.
 */
export async function revokeSession(sessionId: string) {
  return revokeSessionRecord(sessionId);
}

/**
 * Revokes every active session belonging to an account.
 */
export async function revokeAllAccountSessions(accountId: string) {
  return revokeAllSessionsForAccount(accountId);
}

/**
 * Removes expired sessions from the database.
 *
 * Intended for scheduled/background cleanup.
 */
export async function cleanupExpiredSessions() {
  return deleteExpiredSessions();
}
