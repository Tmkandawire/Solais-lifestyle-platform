import type { ContactMessageStatus, Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';

export interface ContactMessageFilters {
  page: number;
  limit: number;
  status?: ContactMessageStatus;
  search?: string;
}

export function createContactMessage(data: Prisma.ContactMessageCreateInput) {
  return prisma.contactMessage.create({ data });
}

export async function findContactMessages(filters: ContactMessageFilters) {
  const { page, limit, status, search } = filters;

  const where: Prisma.ContactMessageWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { subject: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [messages, total] = await prisma.$transaction([
    prisma.contactMessage.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  return {
    messages,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export function findContactMessageById(id: string) {
  return prisma.contactMessage.findUnique({ where: { id } });
}

export function updateContactMessageStatus(id: string, status: ContactMessageStatus) {
  return prisma.contactMessage.update({
    where: { id },
    data: {
      status,
      resolvedAt: status === 'RESOLVED' ? new Date() : null,
    },
  });
}

export function deleteContactMessageById(id: string) {
  return prisma.contactMessage.delete({ where: { id } });
}
