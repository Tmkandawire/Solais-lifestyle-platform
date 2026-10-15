import type { Request, Response } from 'express';

import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { successResponse } from '../../shared/responses/api-response.js';
import {
  changeCurrentPassword,
  getCurrentAccount,
  updateCurrentAccountProfile,
  getCurrentAccountThemePreference,
  updateCurrentAccountThemePreference,
} from '../../services/account.service.js';

/**
 * Retrieves the currently authenticated account.
 *
 * The route is protected by the authenticate middleware,
 * which guarantees that request.user exists before this
 * controller is executed.
 */
export async function getMe(request: Request, response: Response): Promise<void> {
  const authenticatedRequest = request as AuthenticatedRequest;

  const account = await getCurrentAccount({
    accountId: authenticatedRequest.user.accountId,
  });

  response.status(200).json(successResponse('Account retrieved successfully.', account));
}

export async function updateMe(request: Request, response: Response): Promise<void> {
  const authenticatedRequest = request as AuthenticatedRequest;

  const { firstName, lastName } = request.body as {
    firstName: string;
    lastName: string;
  };

  const account = await updateCurrentAccountProfile(
    { accountId: authenticatedRequest.user.accountId },
    { firstName, lastName },
  );

  response.status(200).json(successResponse('Profile updated successfully.', account));
}

export async function changePassword(request: Request, response: Response): Promise<void> {
  const authenticatedRequest = request as AuthenticatedRequest;

  const { currentPassword, newPassword } = request.body as {
    currentPassword: string;
    newPassword: string;
  };

  await changeCurrentPassword(
    { accountId: authenticatedRequest.user.accountId },
    currentPassword,
    newPassword,
  );

  response.clearCookie('solais_refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
  });

  response
    .status(200)
    .json(successResponse('Password changed successfully. Please sign in again.', null));
}

/**
 * GET /api/v1/account/preferences
 * Returns the authenticated account's saved theme preference.
 */
export async function getThemePreference(request: Request, response: Response): Promise<void> {
  const { user } = request as AuthenticatedRequest;

  const preference = await getCurrentAccountThemePreference({
    accountId: user.accountId,
  });

  response
    .status(200)
    .json(successResponse('Theme preference retrieved successfully.', preference));
}

/**
 * PATCH /api/v1/account/preferences
 * Updates the authenticated account's theme preference.
 */
export async function updateThemePreference(request: Request, response: Response): Promise<void> {
  const { user } = request as AuthenticatedRequest;

  const { theme } = request.body as { theme: 'LIGHT' | 'DARK' };

  const preference = await updateCurrentAccountThemePreference(
    {
      accountId: user.accountId,
    },
    theme,
  );

  response.status(200).json(successResponse('Theme preference updated successfully.', preference));
}
