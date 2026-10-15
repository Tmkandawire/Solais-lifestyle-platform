import { prisma } from '../lib/prisma.js';
import { Prisma } from '../generated/prisma/client.js';
import type { Account } from '../generated/prisma/client.js';
import { Role } from '../generated/prisma/enums.js';
import type { NotificationType } from '../generated/prisma/enums.js';
import { EmailAlreadyExistsError, AccountNotFoundError } from '../shared/errors/account.errors.js';

export interface CreateAccountData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role?: Role;
}

// The Prisma client applies a default omit of `passwordHash` on the Account
// model (see lib/prisma.ts). Every function here goes through that default
// client, so its inferred return type excludes passwordHash unless explicitly
// overridden.

export async function createAccount(
  data: CreateAccountData,
  client: Prisma.TransactionClient = prisma,
) {
  try {
    return await client.account.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role ?? Role.ATTENDEE,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new EmailAlreadyExistsError(data.email);
    }

    throw error;
  }
}

export async function findAccountById(id: string) {
  return prisma.account.findUnique({
    where: { id },
  });
}

/**
 * Retrieves an account with its password hash for password verification.
 * Never expose this result through a controller.
 */
export async function findAccountForPasswordChange(id: string): Promise<Account | null> {
  return prisma.account.findUnique({
    where: { id },
    omit: {
      passwordHash: false,
    },
  });
}

/**
 * Updates the password, revokes all active sessions, and creates the
 * supplied notification atomically.
 */
export async function updatePasswordAndRevokeSessions(
  accountId: string,
  passwordHash: string,
  notification: {
    type: NotificationType;
    title: string;
    message: string;
    actionUrl?: string | null;
  },
): Promise<void> {
  await prisma.$transaction(async (transaction) => {
    await transaction.account.update({
      where: { id: accountId },
      data: { passwordHash },
    });

    await transaction.session.updateMany({
      where: {
        accountId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    await transaction.notification.create({
      data: {
        accountId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        ...(notification.actionUrl !== undefined ? { actionUrl: notification.actionUrl } : {}),
      },
    });
  });
}

export async function updateAccountProfile(
  id: string,
  data: {
    firstName: string;
    lastName: string;
  },
) {
  return updateOrThrow(id, {
    firstName: data.firstName,
    lastName: data.lastName,
  });
}

// Soft-deleted or deactivated accounts are NOT filtered out here — this
// repository stays a neutral data-access layer. Whether a soft-deleted or
// inactive account should be treated as "not found" or "not allowed to log
// in" is an auth-service-level policy decision, not a repository one. Check
// `deletedAt` / `isActive` explicitly wherever this result is used to
// authenticate or authorize someone.
export async function findAccountByEmail(email: string) {
  return prisma.account.findUnique({
    where: { email },
  });
}

// The one deliberate exception to the default passwordHash omit. Use this
// ONLY in the login flow, and nowhere else — never return its result
// directly from a controller.
export async function findAccountByEmailForAuth(email: string) {
  return prisma.account.findUnique({
    where: { email },
    omit: {
      passwordHash: false,
    },
  });
}

export async function updateLastLogin(id: string) {
  return updateOrThrow(id, {
    lastLoginAt: new Date(),
  });
}

export async function verifyEmail(id: string) {
  return updateOrThrow(id, {
    emailVerifiedAt: new Date(),
  });
}

export async function deactivateAccount(id: string) {
  return updateOrThrow(id, {
    isActive: false,
  });
}

export async function softDeleteAccount(id: string) {
  return updateOrThrow(id, {
    deletedAt: new Date(),
  });
}

// Shared helper: every update function here has identical error-handling
// needs (translate a missing id into a domain error), so it lives in one
// place instead of being copy-pasted four times.
async function updateOrThrow(id: string, data: Prisma.AccountUpdateInput) {
  try {
    return await prisma.account.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new AccountNotFoundError(id);
    }
    throw error;
  }
}
