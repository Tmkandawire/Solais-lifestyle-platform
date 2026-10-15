import type { Role } from '../generated/prisma/enums.js';

import {
  findAccountById,
  findAccountForPasswordChange,
  updateAccountProfile,
  updatePasswordAndRevokeSessions,
} from '../repositories/account.repository.js';

import type { ThemePreference } from '../generated/prisma/enums.js';

import {
  findAccountPreference,
  upsertAccountThemePreference,
} from '../repositories/account-preference.repository.js';

import { AccountNotFoundError } from '../shared/errors/account.errors.js';
import { InvalidCredentialsError } from '../shared/errors/auth.errors.js';
import { hashPassword, verifyPassword } from './password.service.js';

import { passwordChangedNotification } from '../shared/notifications/security-notification.messages.js';

export interface AccountActor {
  accountId: string;
}

/**
 * Public-safe account shape.
 *
 * Sensitive/internal fields such as passwordHash and deletedAt
 * are deliberately excluded from this DTO.
 */
export interface SafeAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  emailVerifiedAt: Date | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Converts a Prisma Account entity into the safe account DTO
 * exposed outside the service layer.
 */
function toSafeAccount(account: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  emailVerifiedAt: Date | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): SafeAccount {
  return {
    id: account.id,
    email: account.email,
    firstName: account.firstName,
    lastName: account.lastName,
    role: account.role,
    emailVerifiedAt: account.emailVerifiedAt,
    isActive: account.isActive,
    lastLoginAt: account.lastLoginAt,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

/**
 * Retrieves the currently authenticated account.
 *
 * Account identity comes from the authenticated request rather than
 * from client-supplied parameters.
 *
 * Returns a SafeAccount so sensitive database fields such as
 * passwordHash and deletedAt never leave the service layer.
 */
export async function getCurrentAccount(actor: AccountActor): Promise<SafeAccount> {
  const account = await findAccountById(actor.accountId);

  if (!account) {
    throw new AccountNotFoundError(actor.accountId);
  }

  if (!account.isActive || account.deletedAt !== null) {
    throw new AccountNotFoundError(actor.accountId);
  }

  return toSafeAccount(account);
}

/**
 * Retrieves the authenticated account's saved theme preference.
 * Accounts without a saved preference default to LIGHT.
 */
export async function getCurrentAccountThemePreference(
  actor: AccountActor,
): Promise<{ theme: ThemePreference }> {
  // Reuse existing account checks for inactive or deleted accounts.
  await getCurrentAccount(actor);

  const preference = await findAccountPreference(actor.accountId);

  return {
    theme: preference?.theme ?? 'LIGHT',
  };
}

/**
 * Persists the authenticated account's theme preference.
 */
export async function updateCurrentAccountThemePreference(
  actor: AccountActor,
  theme: ThemePreference,
): Promise<{ theme: ThemePreference }> {
  // Ensure the account is active and exists before updating preferences.
  await getCurrentAccount(actor);

  const preference = await upsertAccountThemePreference(actor.accountId, theme);

  return {
    theme: preference.theme,
  };
}

export async function updateCurrentAccountProfile(
  actor: AccountActor,
  data: {
    firstName: string;
    lastName: string;
  },
): Promise<SafeAccount> {
  const account = await findAccountById(actor.accountId);

  if (!account || !account.isActive || account.deletedAt !== null) {
    throw new AccountNotFoundError(actor.accountId);
  }

  const updatedAccount = await updateAccountProfile(actor.accountId, {
    firstName: data.firstName,
    lastName: data.lastName,
  });

  return toSafeAccount(updatedAccount);
}

export async function changeCurrentPassword(
  actor: AccountActor,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const account = await findAccountForPasswordChange(actor.accountId);

  if (!account || !account.isActive || account.deletedAt !== null) {
    throw new AccountNotFoundError(actor.accountId);
  }

  const currentPasswordIsValid = await verifyPassword(currentPassword, account.passwordHash);

  if (!currentPasswordIsValid) {
    throw new InvalidCredentialsError();
  }

  const passwordHash = await hashPassword(newPassword);

  const notification = passwordChangedNotification(actor.accountId);

  await updatePasswordAndRevokeSessions(actor.accountId, passwordHash, {
    type: notification.type,
    title: notification.title,
    message: notification.message,
    ...(notification.actionUrl !== undefined ? { actionUrl: notification.actionUrl } : {}),
  });
}
