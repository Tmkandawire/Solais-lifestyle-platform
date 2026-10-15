import { Role, VendorApplicationStatus } from '../generated/prisma/enums.js';
import type { VendorApplication } from '../generated/prisma/client.js';
import {
  createVendorApplication,
  findVendorApplicationById,
  findVendorApplicationByIdWithRelations,
  findVendorApplications,
  softDeleteVendorApplication,
  updateVendorApplication,
  type CreateVendorApplicationData,
  type FindVendorApplicationsOptions,
  type PaginatedVendorApplications,
  type VendorApplicationWithRelations,
} from '../repositories/vendor-application.repository.js';
import {
  VendorApplicationForbiddenError,
  VendorApplicationInvalidStateError,
  VendorApplicationNotFoundError,
} from '../shared/errors/vendor-application.errors.js';

import { prisma } from '../lib/prisma.js';
import { createAccountNotifications } from './notification.service.js';
import { newVendorApplicationNotification } from '../shared/notifications/vendor-application-notification.messages.js';

/**
 * Service-layer input is kept separate from the repository contract so
 * request validation and transformation can evolve independently of persistence.
 */
export interface CreateVendorApplicationServiceData {
  businessName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  businessCategory: string;
  productsOrServices: string;
  websiteOrSocial?: string | null;
  preferredEventId?: string | null;
}

export interface VendorApplicationActor {
  accountId: string;
  role: Role;
}

function canManageVendorApplications(role: Role): boolean {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}

function requireVendorApplicationManager(actor: VendorApplicationActor): void {
  if (!canManageVendorApplications(actor.role)) {
    throw new VendorApplicationForbiddenError();
  }
}

/**
 * Creates a new vendor application.
 *
 * Applications are always created as PENDING.
 * The applicant does not control the application status.
 */

export async function createNewVendorApplication(
  data: CreateVendorApplicationServiceData,
): Promise<VendorApplication> {
  const applicationData: CreateVendorApplicationData = {
    businessName: data.businessName,
    contactPerson: data.contactPerson,
    phoneNumber: data.phoneNumber,
    email: data.email,
    businessCategory: data.businessCategory,
    productsOrServices: data.productsOrServices,
    websiteOrSocial: data.websiteOrSocial ?? null,
    preferredEventId: data.preferredEventId ?? null,
  };

  return prisma.$transaction(async (tx) => {
    const application = await createVendorApplication(applicationData, tx);

    const administrators = await tx.account.findMany({
      where: {
        role: { in: [Role.ADMIN, Role.SUPER_ADMIN] },
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });

    await createAccountNotifications(
      administrators.map(({ id }) => newVendorApplicationNotification(application, id)),
      tx,
    );

    return application;
  });
}

/**
 * Lists vendor applications for administrators.
 */
export async function listVendorApplications(
  options: FindVendorApplicationsOptions,
  actor: VendorApplicationActor,
): Promise<PaginatedVendorApplications> {
  requireVendorApplicationManager(actor);

  return findVendorApplications(options);
}

/**
 * Gets a single vendor application with its related event
 * and reviewing administrator.
 */
export async function getVendorApplicationById(
  id: string,
  actor: VendorApplicationActor,
): Promise<VendorApplicationWithRelations> {
  requireVendorApplicationManager(actor);

  const application = await findVendorApplicationByIdWithRelations(id);

  if (!application) {
    throw new VendorApplicationNotFoundError(id);
  }

  return application;
}

/**
 * Approves a pending vendor application.
 *
 * The reviewing administrator and review timestamp are recorded.
 */
export async function approveVendorApplication(
  id: string,
  actor: VendorApplicationActor,
  adminNotes?: string | null,
): Promise<VendorApplication> {
  requireVendorApplicationManager(actor);

  const application = await findVendorApplicationById(id);

  if (!application) {
    throw new VendorApplicationNotFoundError(id);
  }

  if (application.status === VendorApplicationStatus.APPROVED) {
    return application;
  }

  if (application.status === VendorApplicationStatus.REJECTED) {
    throw new VendorApplicationInvalidStateError(
      'Rejected vendor applications cannot be approved.',
    );
  }

  return updateVendorApplication(id, {
    status: VendorApplicationStatus.APPROVED,
    adminNotes: adminNotes ?? null,
    reviewedAt: new Date(),
    reviewedBy: {
      connect: {
        id: actor.accountId,
      },
    },
  });
}

/**
 * Rejects a pending vendor application.
 *
 * The reviewing administrator and review timestamp are recorded.
 */
export async function rejectVendorApplication(
  id: string,
  actor: VendorApplicationActor,
  adminNotes?: string | null,
): Promise<VendorApplication> {
  requireVendorApplicationManager(actor);

  const application = await findVendorApplicationById(id);

  if (!application) {
    throw new VendorApplicationNotFoundError(id);
  }

  if (application.status === VendorApplicationStatus.REJECTED) {
    return application;
  }

  if (application.status === VendorApplicationStatus.APPROVED) {
    throw new VendorApplicationInvalidStateError(
      'Approved vendor applications cannot be rejected.',
    );
  }

  return updateVendorApplication(id, {
    status: VendorApplicationStatus.REJECTED,
    adminNotes: adminNotes ?? null,
    reviewedAt: new Date(),
    reviewedBy: {
      connect: {
        id: actor.accountId,
      },
    },
  });
}

/**
 * Soft-deletes a vendor application.
 */
export async function deleteVendorApplication(
  id: string,
  actor: VendorApplicationActor,
): Promise<VendorApplication> {
  requireVendorApplicationManager(actor);

  return softDeleteVendorApplication(id);
}
