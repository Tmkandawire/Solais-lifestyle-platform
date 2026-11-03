import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/config/env.js', () => ({
  env: {
    JWT_REFRESH_EXPIRES_IN: '7d',
  },
}));

vi.mock('../src/repositories/account.repository.js', () => ({
  findAccountById: vi.fn(),
}));

vi.mock('../src/repositories/session.repository.js', () => ({
  createSession: vi.fn(),
  findSessionById: vi.fn(),
  updateRefreshTokenHash: vi.fn(),
  revokeSession: vi.fn(),
  revokeAllSessionsForAccount: vi.fn(),
  deleteExpiredSessions: vi.fn(),
}));

vi.mock('../src/services/jwt.service.js', () => ({
  generateRefreshToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
}));

import { findSessionById, updateRefreshTokenHash } from '../src/repositories/session.repository.js';
import { generateRefreshToken, verifyRefreshToken } from '../src/services/jwt.service.js';
import { hashRefreshToken } from '../src/services/token.service.js';
import { rotateRefreshToken } from '../src/services/session.service.js';

const mockedFindSessionById = vi.mocked(findSessionById);
const mockedUpdateRefreshTokenHash = vi.mocked(updateRefreshTokenHash);
const mockedGenerateRefreshToken = vi.mocked(generateRefreshToken);
const mockedVerifyRefreshToken = vi.mocked(verifyRefreshToken);

const originalRefreshToken = 'original-refresh-token';
const replacementRefreshToken = 'replacement-refresh-token';
const accountId = 'account-123';
const sessionId = 'session-123';

function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    id: sessionId,
    accountId,
    refreshTokenHash: hashRefreshToken(originalRefreshToken),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    revokedAt: null,
    ipAddress: null,
    userAgent: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('Refresh-token rotation security', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedVerifyRefreshToken.mockResolvedValue({
      sub: accountId,
      sessionId,
      tokenType: 'refresh',
    });

    mockedFindSessionById.mockResolvedValue(
      makeSession({
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      }),
    );

    mockedGenerateRefreshToken.mockResolvedValue(replacementRefreshToken);

    mockedUpdateRefreshTokenHash.mockResolvedValue(true);
  });

  it('rotates a valid token and preserves the original session expiry', async () => {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    mockedFindSessionById.mockResolvedValue(
      makeSession({
        expiresAt,
      }),
    );

    const result = await rotateRefreshToken(originalRefreshToken);

    expect(result).toEqual({
      accountId,
      sessionId,
      refreshToken: replacementRefreshToken,
      expiresAt,
    });

    expect(mockedUpdateRefreshTokenHash).toHaveBeenCalledWith(
      sessionId,
      hashRefreshToken(originalRefreshToken),
      hashRefreshToken(replacementRefreshToken),
    );
  });

  it('rejects a token when its session has expired', async () => {
    mockedFindSessionById.mockResolvedValue(
      makeSession({
        expiresAt: new Date(Date.now() - 60_000),
      }),
    );

    const result = await rotateRefreshToken(originalRefreshToken);

    expect(result).toBeNull();
    expect(mockedGenerateRefreshToken).not.toHaveBeenCalled();
    expect(mockedUpdateRefreshTokenHash).not.toHaveBeenCalled();
  });

  it('rejects a token when its session has been revoked', async () => {
    mockedFindSessionById.mockResolvedValue(
      makeSession({
        revokedAt: new Date(),
      }),
    );

    const result = await rotateRefreshToken(originalRefreshToken);

    expect(result).toBeNull();
    expect(mockedGenerateRefreshToken).not.toHaveBeenCalled();
    expect(mockedUpdateRefreshTokenHash).not.toHaveBeenCalled();
  });
  it('rejects a token whose hash no longer matches the stored hash', async () => {
    mockedFindSessionById.mockResolvedValue(
      makeSession({
        refreshTokenHash: hashRefreshToken(replacementRefreshToken),
      }),
    );

    const result = await rotateRefreshToken(originalRefreshToken);

    expect(result).toBeNull();
    expect(mockedGenerateRefreshToken).not.toHaveBeenCalled();
    expect(mockedUpdateRefreshTokenHash).not.toHaveBeenCalled();
  });

  it('rejects rotation when the atomic repository update loses a race', async () => {
    mockedUpdateRefreshTokenHash.mockResolvedValue(false);

    const result = await rotateRefreshToken(originalRefreshToken);

    expect(result).toBeNull();

    expect(mockedUpdateRefreshTokenHash).toHaveBeenCalledWith(
      sessionId,
      hashRefreshToken(originalRefreshToken),
      hashRefreshToken(replacementRefreshToken),
    );
  });

  it('rejects a token when the session belongs to another account', async () => {
    mockedFindSessionById.mockResolvedValue(
      makeSession({
        accountId: 'another-account',
      }),
    );

    const result = await rotateRefreshToken(originalRefreshToken);

    expect(result).toBeNull();
    expect(mockedGenerateRefreshToken).not.toHaveBeenCalled();
    expect(mockedUpdateRefreshTokenHash).not.toHaveBeenCalled();
  });
});
