import { IssuedTicketStatus, OrderStatus, Role } from '../generated/prisma/enums.js';
import type { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';

function termFilter(term: string): Prisma.AccountWhereInput {
  return {
    OR: [
      { firstName: { contains: term, mode: 'insensitive' } },
      { lastName: { contains: term, mode: 'insensitive' } },
      { email: { contains: term, mode: 'insensitive' } },
      { id: { contains: term, mode: 'insensitive' } },
    ],
  };
}

export interface FindAdminAttendeesOptions {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}

const attendeeListSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  isActive: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  createdAt: true,
  _count: {
    select: {
      orders: {
        where: {
          status: OrderStatus.PAID,
        },
      },
      issuedTickets: {
        where: {
          status: {
            not: IssuedTicketStatus.CANCELLED,
          },
        },
      },
    },
  },
} satisfies Prisma.AccountSelect;

const attendeeDetailSelect = {
  _count: {
    select: {
      orders: true,
      issuedTickets: true,
    },
  },

  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  isActive: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,

  orders: {
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 50,
    select: {
      id: true,
      status: true,
      totalAmount: true,
      currency: true,
      createdAt: true,
      expiresAt: true,
      paidAt: true,
      cancelledAt: true,
      event: {
        select: {
          id: true,
          title: true,
          startDate: true,
          venue: true,
          city: true,
        },
      },
      payment: {
        select: {
          id: true,
          status: true,
          provider: true,
          amount: true,
          currency: true,
          paidAt: true,
        },
      },
      items: {
        select: {
          id: true,
          ticketTypeName: true,
          quantity: true,
          unitPrice: true,
        },
      },
    },
  },

  issuedTickets: {
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 100,
    select: {
      id: true,
      ticketNumber: true,
      status: true,
      checkedInAt: true,
      createdAt: true,
      ticketTypeId: true,
      orderItem: {
        select: {
          ticketTypeName: true,
          unitPrice: true,
          order: {
            select: {
              id: true,
              status: true,
              currency: true,
              event: {
                select: {
                  id: true,
                  title: true,
                  startDate: true,
                  venue: true,
                  city: true,
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.AccountSelect;

export async function findAdminAttendees(options: FindAdminAttendeesOptions) {
  const { page, limit, search, isActive } = options;
  const normalizedSearch = search?.trim();

  const terms = normalizedSearch ? normalizedSearch.split(/\s+/).slice(0, 5) : [];

  const where: Prisma.AccountWhereInput = {
    role: Role.ATTENDEE,
    deletedAt: null,
    ...(isActive !== undefined ? { isActive } : {}),
    ...(terms.length > 0 ? { AND: terms.map((term) => termFilter(term)) } : {}),
  };

  const skip = (page - 1) * limit;

  const [attendees, total] = await prisma.$transaction([
    prisma.account.findMany({
      where,
      select: attendeeListSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.account.count({ where }),
  ]);

  return {
    attendees,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function findAdminAttendeeById(id: string) {
  return prisma.account.findFirst({
    where: {
      id,
      role: Role.ATTENDEE,
      deletedAt: null,
    },
    select: attendeeDetailSelect,
  });
}
