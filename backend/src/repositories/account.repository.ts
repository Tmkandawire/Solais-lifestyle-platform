import { prisma } from '../lib/prisma.js';
import { Prisma } from '../generated/prisma/client.js';
import { Role } from '../generated/prisma/enums.js';
import { EmailAlreadyExistsError, AccountNotFoundError } from '../shared/errors/account.errors.js';

export interface CreateAccountData {
  email: string;
  passwordHash: string;
  role?: Role;
}

// The Prisma client applies a default omit of `passwordHash` on the Account
// model (see lib/prisma.ts). Every function here goes through that default
// client, so its inferred return type excludes passwordHash unless explicitly
// overridden.

export async function createAccount(data: CreateAccountData) {
  try {
    return await prisma.account.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
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
