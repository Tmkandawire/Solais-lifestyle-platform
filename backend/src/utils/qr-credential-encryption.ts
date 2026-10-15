import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const VERSION = 'v1';

let cachedKey: Buffer | undefined;

function getEncryptionKey(): Buffer {
  if (cachedKey) {
    return cachedKey;
  }

  const encodedKey = process.env.QR_CREDENTIAL_ENCRYPTION_KEY;

  if (!encodedKey) {
    throw new Error('QR_CREDENTIAL_ENCRYPTION_KEY environment variable is required.');
  }

  const key = Buffer.from(encodedKey, 'base64');

  if (key.length !== KEY_LENGTH || key.toString('base64') !== encodedKey) {
    throw new Error('QR_CREDENTIAL_ENCRYPTION_KEY must be a valid base64-encoded 32-byte key.');
  }

  cachedKey = key;

  return cachedKey;
}

/**
 * Encrypts a QR credential using AES-256-GCM.
 *
 * Format:
 * version.iv.authTag.ciphertext
 *
 * All binary components are encoded using base64url.
 */
export function encryptQrCredential(credential: string): string {
  if (!credential) {
    throw new Error('QR credential cannot be empty.');
  }

  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  cipher.setAAD(Buffer.from(VERSION, 'utf8'));

  const ciphertext = Buffer.concat([cipher.update(credential, 'utf8'), cipher.final()]);

  const authTag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString('base64url'),
    authTag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

/**
 * Decrypts a QR credential previously encrypted by
 * encryptQrCredential().
 *
 * Authentication failures throw an error. Callers must translate
 * cryptographic errors into safe application-level errors.
 */
export function decryptQrCredential(encrypted: string): string {
  const parts = encrypted.split('.');

  if (parts.length !== 4) {
    throw new Error('Invalid encrypted QR credential format.');
  }

  const [version, encodedIv, encodedAuthTag, encodedCiphertext] = parts;

  if (version !== VERSION || !encodedIv || !encodedAuthTag || !encodedCiphertext) {
    throw new Error('Invalid encrypted QR credential format.');
  }

  const iv = Buffer.from(encodedIv, 'base64url');
  const authTag = Buffer.from(encodedAuthTag, 'base64url');
  const ciphertext = Buffer.from(encodedCiphertext, 'base64url');

  if (
    iv.length !== IV_LENGTH ||
    authTag.length !== AUTH_TAG_LENGTH ||
    ciphertext.length === 0 ||
    iv.toString('base64url') !== encodedIv ||
    authTag.toString('base64url') !== encodedAuthTag ||
    ciphertext.toString('base64url') !== encodedCiphertext
  ) {
    throw new Error('Invalid encrypted QR credential data.');
  }

  const key = getEncryptionKey();

  const decipher = createDecipheriv(ALGORITHM, key, iv);

  decipher.setAAD(Buffer.from(version, 'utf8'));
  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  return plaintext.toString('utf8');
}
