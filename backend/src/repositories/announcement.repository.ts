import type { AnnouncementStatus, Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';

export interface AnnouncementListFilters {
  page: number;
  limit: number;
  status?: AnnouncementStatus;
  search?: string;
}

export function createAnnouncement(data: Prisma.AnnouncementCreateInput) {
  return prisma.announcement.create({ data });
}

export async function findAnnouncements(filters: AnnouncementListFilters) {
  const { page, limit, status, search } = filters;

  const where: Prisma.AnnouncementWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { message: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [announcements, total] = await prisma.$transaction([
    prisma.announcement.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.announcement.count({ where }),
  ]);

  return {
    announcements,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export function findPublishedAnnouncements(page: number, limit: number) {
  const now = new Date();
  const where: Prisma.AnnouncementWhereInput = {
    status: 'PUBLISHED',
    publishedAt: { lte: now },
  };

  return prisma.$transaction(async (tx) => {
    const [announcements, total] = await Promise.all([
      tx.announcement.findMany({
        where,
        select: {
          id: true,
          title: true,
          message: true,
          publishedAt: true,
        },
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      tx.announcement.count({ where }),
    ]);

    return {
      announcements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  });
}

export function findAnnouncementById(id: string) {
  return prisma.announcement.findUnique({ where: { id } });
}

export function updateAnnouncement(id: string, data: Prisma.AnnouncementUpdateInput) {
  return prisma.announcement.update({
    where: { id },
    data,
  });
}

export function deleteAnnouncement(id: string) {
  return prisma.announcement.delete({ where: { id } });
}

export async function hasUnreadAnnouncements(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { announcementsViewedAt: true },
  });

  if (!account) {
    return false;
  }

  const now = new Date();

  const latestUnread = await prisma.announcement.findFirst({
    where: {
      status: 'PUBLISHED',
      publishedAt: {
        lte: now,
        gt: account.announcementsViewedAt ?? new Date(0),
      },
    },
    select: { id: true },
  });

  return latestUnread !== null;
}

export async function markAnnouncementsSeen(accountId: string, seenThrough: Date) {
  await prisma.account.updateMany({
    where: {
      id: accountId,
      OR: [{ announcementsViewedAt: null }, { announcementsViewedAt: { lt: seenThrough } }],
    },
    data: {
      announcementsViewedAt: seenThrough,
    },
  });
}
