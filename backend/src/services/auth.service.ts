import type { Role } from '../generated/prisma/enums.js';
import {
  createAccount,
  findAccountByEmailForAuth,
  findAccountById,
  updateLastLogin,
} from '../repositories/account.repository.js';
import {
  hashPassword,
  verifyPassword,
  verifyPasswordAgainstDummyHash,
} from './password.service.js';
import {
  createSession,
  revokeAllAccountSessions,
  revokeSession,
  rotateRefreshToken,
} from './session.service.js';
import { generateAccessToken } from './jwt.service.js';

import { InvalidCredentialsError } from '../shared/errors/auth.errors.js';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface LoginData {
  email: string;
  password: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuthenticationResult {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  refreshTokenExpiresAt: Date;
}

/**
 * Registers a new account and creates its initial authenticated session.
 */
export async function register(data: RegisterData): Promise<AuthenticationResult> {
  const passwordHash = await hashPassword(data.password);

  const account = await createAccount({
    email: data.email,
    passwordHash,
    firstName: data.firstName,
    lastName: data.lastName,
    ...(data.role !== undefined ? { role: data.role } : {}),
  });

  const session = await createSession({
    accountId: account.id,

    ...(data.ipAddress !== undefined ? { ipAddress: data.ipAddress } : {}),

    ...(data.userAgent !== undefined ? { userAgent: data.userAgent } : {}),
  });

  const accessToken = await generateAccessToken(account.id, session.sessionId, account.role);

  return {
    accessToken,
    refreshToken: session.refreshToken,
    sessionId: session.sessionId,
    refreshTokenExpiresAt: session.expiresAt,
  };
}

/**
 * Authenticates an account using its email and password.
 */
export async function login(data: LoginData): Promise<AuthenticationResult> {
  const account = await findAccountByEmailForAuth(data.email);

  if (!account) {
    await verifyPasswordAgainstDummyHash(data.password);
    throw new InvalidCredentialsError();
  }

  if (!account.isActive || account.deletedAt !== null) {
    await verifyPassword(data.password, account.passwordHash);
    throw new InvalidCredentialsError();
  }

  const passwordValid = await verifyPassword(data.password, account.passwordHash);

  if (!passwordValid) {
    throw new InvalidCredentialsError();
  }

  await updateLastLogin(account.id);

  const session = await createSession({
    accountId: account.id,

    ...(data.ipAddress !== undefined ? { ipAddress: data.ipAddress } : {}),

    ...(data.userAgent !== undefined ? { userAgent: data.userAgent } : {}),
  });

  const accessToken = await generateAccessToken(account.id, session.sessionId, account.role);

  return {
    accessToken,
    refreshToken: session.refreshToken,
    sessionId: session.sessionId,
    refreshTokenExpiresAt: session.expiresAt,
  };
}

/**
 * Rotates a refresh token and issues a new access token.
 */
export async function refresh(refreshToken: string): Promise<AuthenticationResult> {
  const session = await rotateRefreshToken(refreshToken);

  if (!session) {
    throw new InvalidCredentialsError();
  }

  const account = await findAccountById(session.accountId);

  if (!account || !account.isActive || account.deletedAt !== null) {
    throw new InvalidCredentialsError();
  }

  const accessToken = await generateAccessToken(account.id, session.sessionId, account.role);

  return {
    accessToken,
    refreshToken: session.refreshToken,
    sessionId: session.sessionId,
    refreshTokenExpiresAt: session.expiresAt,
  };
}

/**
 * Revokes the current authenticated session.
 */
export async function logout(sessionId: string): Promise<void> {
  await revokeSession(sessionId);
}

/**
 * Revokes all active sessions belonging to an account.
 */
export async function logoutAll(accountId: string): Promise<void> {
  await revokeAllAccountSessions(accountId);
}
