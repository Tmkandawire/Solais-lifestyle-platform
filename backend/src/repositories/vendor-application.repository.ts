import {
  Prisma,
  type VendorApplicationStatus,
  type VendorApplication,
  type Event,
  type Account,
} from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { VendorApplicationNotFoundError } from '../shared/errors/vendor-application.errors.js';

type PrismaTransactionClient = Prisma.TransactionClient;

export interface CreateVendorApplicationData {
  businessName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  businessCategory: string;
  productsOrServices: string;
  websiteOrSocial?: string | null;
  preferredEventId?: string | null;
}

export interface FindVendorApplicationsOptions {
  page: number;
  limit: number;
  status?: VendorApplicationStatus;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedVendorApplications {
  data: VendorApplication[];
  meta: PaginationMeta;
}

export interface VendorApplicationWithRelations extends VendorApplication {
  preferredEvent: Event | null;
  reviewedBy: Account | null;
}

export async function createVendorApplication(
  data: CreateVendorApplicationData,
  client: PrismaTransactionClient = prisma,
): Promise<VendorApplication> {
  return client.vendorApplication.create({
    data: {
      businessName: data.businessName,
      contactPerson: data.contactPerson,
      phoneNumber: data.phoneNumber,
      email: data.email,
      businessCategory: data.businessCategory,
      productsOrServices: data.productsOrServices,
      websiteOrSocial: data.websiteOrSocial ?? null,
      preferredEventId: data.preferredEventId ?? null,
    },
  });
}

export async function findVendorApplicationById(id: string): Promise<VendorApplication | null> {
  return prisma.vendorApplication.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
}

export async function findVendorApplicationByIdWithRelations(
  id: string,
): Promise<VendorApplicationWithRelations | null> {
  return prisma.vendorApplication.findFirst({
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

export async function findVendorApplications(
  options: FindVendorApplicationsOptions,
): Promise<PaginatedVendorApplications> {
  const { page, limit, status } = options;

  const where: Prisma.VendorApplicationWhereInput = {
    deletedAt: null,

    ...(status !== undefined ? { status } : {}),
  };

  const skip = (page - 1) * limit;

  const [applications, total] = await prisma.$transaction([
    prisma.vendorApplication.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),

    prisma.vendorApplication.count({
      where,
    }),
  ]);

  return {
    data: applications,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateVendorApplication(
  id: string,
  data: Prisma.VendorApplicationUpdateInput,
): Promise<VendorApplication> {
  return updateOrThrow(id, data);
}

export async function softDeleteVendorApplication(id: string): Promise<VendorApplication> {
  return updateOrThrow(id, {
    deletedAt: new Date(),
  });
}

async function updateOrThrow(
  id: string,
  data: Prisma.VendorApplicationUpdateInput,
): Promise<VendorApplication> {
  try {
    return await prisma.vendorApplication.update({
      where: {
        id,
      },
      data,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new VendorApplicationNotFoundError(id);
    }

    throw error;
  }
}
