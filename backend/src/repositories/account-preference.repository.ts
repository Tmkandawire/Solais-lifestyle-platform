import { prisma } from '../lib/prisma.js';
import type { ThemePreference } from '../generated/prisma/enums.js';

export async function findAccountPreference(accountId: string) {
  return prisma.accountPreference.findUnique({
    where: { accountId },
    select: {
      theme: true,
    },
  });
}

export async function upsertAccountThemePreference(accountId: string, theme: ThemePreference) {
  return prisma.accountPreference.upsert({
    where: { accountId },
    create: {
      accountId,
      theme,
    },
    update: {
      theme,
    },
    select: {
      theme: true,
    },
  });
}
