import { env } from '../../config/env.js';
import type { Request, Response } from 'express';

import {
  login,
  logout,
  logoutAll,
  refresh,
  register,
  getCurrentAccount,
} from '../../services/auth.service.js';
import { successResponse } from '../../shared/responses/api-response.js';
import { InvalidCredentialsError } from '../../shared/errors/auth.errors.js';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

interface RegisterRequestBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

type RegisterRequest = Request<unknown, unknown, RegisterRequestBody>;
type LoginRequest = Request<unknown, unknown, LoginRequestBody>;

interface RefreshRequestCookies {
  solais_refresh_token?: string;
}

type RefreshRequest = Request<unknown, unknown, unknown, unknown, RefreshRequestCookies>;

const REFRESH_COOKIE_NAME = 'solais_refresh_token';

function setRefreshTokenCookie(response: Response, refreshToken: string, expiresAt: Date): void {
  response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: expiresAt,
    path: '/api/v1/auth',
  });
}

function clearRefreshTokenCookie(response: Response): void {
  response.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/v1/auth',
  });
}

/**
 * Registers a new account and creates its initial authenticated session.
 */
export async function registerAccount(request: RegisterRequest, response: Response): Promise<void> {
  const userAgent = request.get('user-agent');
  const ipAddress = request.ip;

  const result = await register({
    email: request.body.email,
    password: request.body.password,
    firstName: request.body.firstName,
    lastName: request.body.lastName,

    ...(ipAddress !== undefined ? { ipAddress } : {}),
    ...(userAgent !== undefined ? { userAgent } : {}),
  });

  setRefreshTokenCookie(response, result.refreshToken, result.refreshTokenExpiresAt);

  response.status(201).json(
    successResponse('Account registered successfully.', {
      accessToken: result.accessToken,
      sessionId: result.sessionId,
      refreshTokenExpiresAt: result.refreshTokenExpiresAt,
    }),
  );
}

/**
 * Authenticates an account using its email and password.
 */
export async function loginAccount(request: LoginRequest, response: Response): Promise<void> {
  const userAgent = request.get('user-agent');
  const ipAddress = request.ip;

  const result = await login({
    email: request.body.email,
    password: request.body.password,

    ...(ipAddress !== undefined ? { ipAddress } : {}),
    ...(userAgent !== undefined ? { userAgent } : {}),
  });

  setRefreshTokenCookie(response, result.refreshToken, result.refreshTokenExpiresAt);

  response.status(200).json(
    successResponse('Login successful.', {
      accessToken: result.accessToken,
      sessionId: result.sessionId,
      refreshTokenExpiresAt: result.refreshTokenExpiresAt,
    }),
  );
}

/**
 * Rotates the refresh token stored in the HttpOnly cookie
 * and issues a new access token.
 */
export async function refreshAccessToken(
  request: RefreshRequest,
  response: Response,
): Promise<void> {
  const cookies = request.cookies as RefreshRequestCookies;
  const refreshToken = cookies.solais_refresh_token;

  if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
    clearRefreshTokenCookie(response);
    throw new InvalidCredentialsError();
  }

  const result = await refresh(refreshToken);

  setRefreshTokenCookie(response, result.refreshToken, result.refreshTokenExpiresAt);

  response.status(200).json(
    successResponse('Token refreshed successfully.', {
      accessToken: result.accessToken,
      sessionId: result.sessionId,
      refreshTokenExpiresAt: result.refreshTokenExpiresAt,
    }),
  );
}

/**
 * Returns the profile of the currently authenticated account.
 */
export async function getCurrentAccountHandler(
  request: Request,
  response: Response,
): Promise<void> {
  const authenticatedRequest = request as AuthenticatedRequest;

  const account = await getCurrentAccount(authenticatedRequest.user.accountId);

  response.status(200).json(successResponse('Current account retrieved successfully.', account));
}

export async function logoutAccount(request: Request, response: Response): Promise<void> {
  const authenticatedRequest = request as AuthenticatedRequest;

  await logout(authenticatedRequest.user.sessionId);

  clearRefreshTokenCookie(response);

  response.status(200).json(successResponse('Logged out successfully.', null));
}

/**
 * Revokes all active sessions belonging to the authenticated account
 * and clears the current refresh-token cookie.
 */
export async function logoutAllSessions(request: Request, response: Response): Promise<void> {
  const authenticatedRequest = request as AuthenticatedRequest;

  await logoutAll(authenticatedRequest.user.accountId);

  clearRefreshTokenCookie(response);

  response.status(200).json(successResponse('All sessions revoked successfully.', null));
}
