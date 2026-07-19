import bcrypt from 'bcrypt';
import { PasswordTooLongError } from '../shared/errors/password.errors.js';

const MIN_BCRYPT_ROUNDS = 10;
const MAX_BCRYPT_ROUNDS = 15;
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);

if (
  !Number.isInteger(BCRYPT_ROUNDS) ||
  BCRYPT_ROUNDS < MIN_BCRYPT_ROUNDS ||
  BCRYPT_ROUNDS > MAX_BCRYPT_ROUNDS
) {
  throw new Error(
    `BCRYPT_ROUNDS must be an integer between ${MIN_BCRYPT_ROUNDS} and ${MAX_BCRYPT_ROUNDS}.`,
  );
}

// bcrypt silently ignores any bytes beyond 72 — two passwords that are
// identical for the first 72 bytes and differ only after that point will
// hash to the SAME value. Reject overlong input explicitly rather than
// letting it truncate silently. Measured in bytes, not characters, since
// multi-byte UTF-8 characters (emoji, non-Latin scripts) count for more
// than one byte each.
const BCRYPT_MAX_PASSWORD_BYTES = 72;

function assertPasswordLength(password: string): void {
  if (Buffer.byteLength(password, 'utf8') > BCRYPT_MAX_PASSWORD_BYTES) {
    throw new PasswordTooLongError(BCRYPT_MAX_PASSWORD_BYTES);
  }
}

/**
 * Hash a plaintext password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  assertPasswordLength(password);
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  assertPasswordLength(password);
  return bcrypt.compare(password, passwordHash);
}

/**
 * Call after a successful password verification.
 * If true, re-hash the plaintext password using the current
 * BCRYPT_ROUNDS value and update the stored hash.
 */
export function needsRehash(passwordHash: string): boolean {
  return bcrypt.getRounds(passwordHash) < BCRYPT_ROUNDS;
}
