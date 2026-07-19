import { createHash, randomBytes } from 'node:crypto';

const REFRESH_TOKEN_BYTES = 32;

// Base64URL of 32 random bytes is always ~43 characters. This upper bound
// isn't meant to be exact — it just rejects clearly-malformed input (e.g. a
// multi-KB string) before it reaches the hash function. Unlike
// generateRefreshToken's output, hashRefreshToken's input comes from the
// client (a cookie/header presented on refresh or logout), so it can't be
// assumed well-formed the way a server-generated value can.
const MAX_REFRESH_TOKEN_LENGTH = 512;

/**
 * Generates a cryptographically secure refresh token.
 *
 * Uses 32 bytes (256 bits) of entropy encoded as Base64URL, producing a
 * URL-safe token suitable for cookies and HTTP headers without additional
 * encoding.
 */
export function generateRefreshToken(): string {
  return randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
}

function assertRefreshToken(token: string): void {
  if (token.length === 0) {
    throw new Error('Refresh token cannot be empty.');
  }

  if (token.length > MAX_REFRESH_TOKEN_LENGTH) {
    throw new Error('Refresh token exceeds maximum expected length.');
  }
}

/**
 * Produces a deterministic SHA-256 hash of a refresh token for storage.
 *
 * Refresh tokens themselves are never persisted. Only this hash should be
 * stored in the database and used for equality lookups during token
 * rotation or revocation.
 */
export function hashRefreshToken(refreshToken: string): string {
  assertRefreshToken(refreshToken);

  return createHash('sha256').update(refreshToken, 'utf8').digest('hex');
}
