import type { NotificationType, Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';

type DbClient = Prisma.TransactionClient;

const CREATE_MANY_CHUNK_SIZE = 1_000;

export interface CreateNotificationData {
  accountId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string | null;
}

export interface FindNotificationsOptions {
  accountId: string;
  page: number;
  limit: number;
  unreadOnly?: boolean;
}

function toCreateInput(data: CreateNotificationData): Prisma.NotificationCreateManyInput {
  return {
    accountId: data.accountId,
    type: data.type,
    title: data.title,
    message: data.message,
    ...(data.actionUrl !== undefined ? { actionUrl: data.actionUrl } : {}),
  };
}

export function createNotification(data: CreateNotificationData, client: DbClient = prisma) {
  return client.notification.create({
    data: toCreateInput(data),
  });
}

/**
 * Inserts notifications in bounded batches.
 * Pass a transaction client when the entire batch must be atomic.
 */
export async function createNotifications(
  notifications: CreateNotificationData[],
  client: DbClient = prisma,
): Promise<number> {
  let created = 0;

  for (let start = 0; start < notifications.length; start += CREATE_MANY_CHUNK_SIZE) {
    const chunk = notifications.slice(start, start + CREATE_MANY_CHUNK_SIZE);

    const result = await client.notification.createMany({
      data: chunk.map(toCreateInput),
    });

    created += result.count;
  }

  return created;
}

export async function findNotifications(options: FindNotificationsOptions) {
  const { accountId, page, limit, unreadOnly = false } = options;

  const where: Prisma.NotificationWhereInput = {
    accountId,
    ...(unreadOnly ? { readAt: null } : {}),
  };

  const [notifications, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  const unreadCount = unreadOnly ? total : await countUnreadNotifications(accountId);

  return {
    notifications,
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export function countUnreadNotifications(accountId: string): Promise<number> {
  return prisma.notification.count({
    where: { accountId, readAt: null },
  });
}

/**
 * Marks a notification as read.
 * Returns 1 if it belongs to the account, including when already read;
 * returns 0 if it is missing or belongs to another account.
 */
export async function markNotificationRead(id: string, accountId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { id, accountId, readAt: null },
    data: { readAt: new Date() },
  });

  if (result.count > 0) {
    return 1;
  }

  const existing = await prisma.notification.findFirst({
    where: { id, accountId },
    select: { id: true },
  });

  return existing ? 1 : 0;
}

export async function markAllNotificationsRead(accountId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { accountId, readAt: null },
    data: { readAt: new Date() },
  });

  return result.count;
}

export async function deleteNotification(id: string, accountId: string): Promise<number> {
  const result = await prisma.notification.deleteMany({
    where: { id, accountId },
  });

  return result.count;
}
