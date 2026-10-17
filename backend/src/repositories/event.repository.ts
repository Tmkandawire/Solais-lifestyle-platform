import { prisma } from '../lib/prisma.js';
import { EventStatus, Prisma, type Event } from '../generated/prisma/client.js';
import { EventNotFoundError } from '../shared/errors/event.errors.js';

type PrismaTransactionClient = Prisma.TransactionClient;

export interface CreateEventData {
  title: string;
  description: string;
  venue: string;
  city: string;
  startDate: Date;
  endDate: Date;
  bannerImageUrl?: string | null;
  capacity?: number | null;
  createdById: string;
  status?: EventStatus;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  venue?: string;
  city?: string;
  startDate?: Date;
  endDate?: Date;
  bannerImageUrl?: string | null;
  capacity?: number | null;
  status?: EventStatus;
}

export interface FindEventsOptions {
  page: number;
  limit: number;
  status?: EventStatus;
  city?: string;
}

export interface PaginatedEvents {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function createEvent(data: CreateEventData): Promise<Event> {
  return prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      venue: data.venue,
      city: data.city,
      startDate: data.startDate,
      endDate: data.endDate,
      createdById: data.createdById,

      ...(data.bannerImageUrl !== undefined ? { bannerImageUrl: data.bannerImageUrl } : {}),

      ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),

      ...(data.status !== undefined ? { status: data.status } : {}),
    },
  });
}

export async function findEventById(id: string): Promise<Event | null> {
  return prisma.event.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
}

export async function findPublishedEvents(options: FindEventsOptions): Promise<PaginatedEvents> {
  return findEvents({
    ...options,
    status: EventStatus.PUBLISHED,
  });
}

export async function findEvents(options: FindEventsOptions): Promise<PaginatedEvents> {
  const { page, limit, status, city } = options;

  const where: Prisma.EventWhereInput = {
    deletedAt: null,

    ...(status !== undefined ? { status } : {}),

    ...(city !== undefined
      ? {
          city: {
            equals: city,
            mode: 'insensitive',
          },
        }
      : {}),
  };

  const skip = (page - 1) * limit;

  const [events, total] = await prisma.$transaction(
    async (tx) => {
      const events = await tx.event.findMany({
        where,
        orderBy: { startDate: 'asc' },
        skip,
        take: limit,
      });

      const total = await tx.event.count({ where });

      return [events, total] as const;
    },
    {
      maxWait: 15000,
      timeout: 30000,
    },
  );

  return {
    events,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateEvent(
  id: string,
  data: UpdateEventData,
  client: PrismaTransactionClient = prisma,
): Promise<Event> {
  return updateOrThrow(id, data, client);
}

export async function softDeleteEvent(
  id: string,
  client: PrismaTransactionClient = prisma,
): Promise<Event> {
  return updateOrThrow(
    id,
    {
      deletedAt: new Date(),
    },
    client,
  );
}

async function updateOrThrow(
  id: string,
  data: Prisma.EventUpdateInput,
  client: PrismaTransactionClient = prisma,
): Promise<Event> {
  try {
    return await client.event.update({
      where: {
        id,
      },
      data,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new EventNotFoundError(id);
    }

    throw error;
  }
}
