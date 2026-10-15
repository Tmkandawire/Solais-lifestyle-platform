import {
  Prisma,
  type PartnerApplicationStatus,
  type PartnerApplication,
  type Event,
  type Account,
} from '../generated/prisma/client.js';

import { prisma } from '../lib/prisma.js';
import { PartnerApplicationNotFoundError } from '../shared/errors/partner-application.errors.js';

type PrismaTransactionClient = Prisma.TransactionClient;

export interface CreatePartnerApplicationData {
  organisationName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  partnershipType: string;
  organisationDescription: string;
  partnershipInterest: string;
  contributionDescription: string;
  websiteOrSocial?: string | null;
  preferredEventId?: string | null;
}

export interface FindPartnerApplicationsOptions {
  page: number;
  limit: number;
  status?: PartnerApplicationStatus;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedPartnerApplications {
  data: PartnerApplication[];
  meta: PaginationMeta;
}

export interface PartnerApplicationWithRelations extends PartnerApplication {
  preferredEvent: Event | null;
  reviewedBy: Account | null;
}

export async function createPartnerApplication(
  data: CreatePartnerApplicationData,
  client: PrismaTransactionClient = prisma,
): Promise<PartnerApplication> {
  return client.partnerApplication.create({
    data: {
      organisationName: data.organisationName,
      contactPerson: data.contactPerson,
      phoneNumber: data.phoneNumber,
      email: data.email,
      partnershipType: data.partnershipType,
      organisationDescription: data.organisationDescription,
      partnershipInterest: data.partnershipInterest,
      contributionDescription: data.contributionDescription,
      websiteOrSocial: data.websiteOrSocial ?? null,
      preferredEventId: data.preferredEventId ?? null,
    },
  });
}

export async function findPartnerApplicationById(id: string): Promise<PartnerApplication | null> {
  return prisma.partnerApplication.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
}

export async function findPartnerApplicationByIdWithRelations(
  id: string,
): Promise<PartnerApplicationWithRelations | null> {
  return prisma.partnerApplication.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      preferredEvent: true,
      reviewedBy: true,
    },
  });
}

export async function findPartnerApplications(
  options: FindPartnerApplicationsOptions,
): Promise<PaginatedPartnerApplications> {
  const { page, limit, status } = options;

  const where: Prisma.PartnerApplicationWhereInput = {
    deletedAt: null,
    ...(status ? { status } : {}),
  };

  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.partnerApplication.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.partnerApplication.count({
      where,
    }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updatePartnerApplication(
  id: string,
  data: Prisma.PartnerApplicationUpdateInput,
): Promise<PartnerApplication> {
  try {
    return await prisma.partnerApplication.update({
      where: {
        id,
        deletedAt: null,
      },
      data,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new PartnerApplicationNotFoundError(id);
    }

    throw error;
  }
}

export async function softDeletePartnerApplication(id: string): Promise<PartnerApplication> {
  return updatePartnerApplication(id, {
    deletedAt: new Date(),
  });
}
