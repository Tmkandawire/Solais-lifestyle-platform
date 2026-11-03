import { describe, expect, it } from 'vitest';

import { loginSchema, registerSchema } from '../src/modules/auth/auth.schemas.js';
import { changePasswordSchema } from '../src/modules/account/account.schemas.js';

const validRegistration = {
  email: 'test@example.com',
  password: 'Password123',
  firstName: 'Test',
  lastName: 'User',
};

describe('password byte-length validation', () => {
  it('accepts a password of exactly 72 UTF-8 bytes', () => {
    const password = 'a'.repeat(72);

    expect(
      registerSchema.safeParse({
        ...validRegistration,
        password,
      }).success,
    ).toBe(true);
  });

  it('rejects a password of 73 UTF-8 bytes during registration', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: 'a'.repeat(73),
    });

    expect(result.success).toBe(false);
  });

  it('rejects a password exceeding 72 bytes during login', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'a'.repeat(73),
    });

    expect(result.success).toBe(false);
  });

  it('rejects multi-byte UTF-8 input that exceeds 72 bytes', () => {
    // Each "é" occupies two UTF-8 bytes: 36 characters = 72 bytes.
    const exactly72Bytes = 'é'.repeat(36);
    const over72Bytes = `${exactly72Bytes}a`;

    expect(Buffer.byteLength(exactly72Bytes, 'utf8')).toBe(72);
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        password: exactly72Bytes,
      }).success,
    ).toBe(true);

    expect(
      registerSchema.safeParse({
        ...validRegistration,
        password: over72Bytes,
      }).success,
    ).toBe(false);
  });

  it('rejects a new password exceeding 72 bytes', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'OldPassword123',
      newPassword: 'a'.repeat(73),
    });

    expect(result.success).toBe(false);
  });

  it('still requires at least eight characters for new passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'OldPassword123',
      newPassword: 'short7',
    });

    expect(result.success).toBe(false);
  });
});
