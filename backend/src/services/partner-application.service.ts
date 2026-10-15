import { Role, PartnerApplicationStatus } from '../generated/prisma/enums.js';
import type { PartnerApplication } from '../generated/prisma/client.js';
import {
  createPartnerApplication,
  findPartnerApplicationById,
  findPartnerApplicationByIdWithRelations,
  findPartnerApplications,
  softDeletePartnerApplication,
  updatePartnerApplication,
  type CreatePartnerApplicationData,
  type FindPartnerApplicationsOptions,
  type PaginatedPartnerApplications,
  type PartnerApplicationWithRelations,
} from '../repositories/partner-application.repository.js';
import {
  PartnerApplicationForbiddenError,
  PartnerApplicationInvalidStateError,
  PartnerApplicationNotFoundError,
} from '../shared/errors/partner-application.errors.js';

import { prisma } from '../lib/prisma.js';
import { createAccountNotifications } from './notification.service.js';
import { newPartnerApplicationNotification } from '../shared/notifications/partner-application-notification.messages.js';

/**
 * Service-layer input is kept separate from the repository contract so
 * request validation and transformation can evolve independently of persistence.
 */
export interface CreatePartnerApplicationServiceData {
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

export interface PartnerApplicationActor {
  accountId: string;
  role: Role;
}

function canManagePartnerApplications(role: Role): boolean {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}

function requirePartnerApplicationManager(actor: PartnerApplicationActor): void {
  if (!canManagePartnerApplications(actor.role)) {
    throw new PartnerApplicationForbiddenError();
  }
}

/**
 * Creates a new partner application.
 *
 * Applications are always created as PENDING.
 * The applicant does not control the application status.
 */
/**
 * Creates a new partner application and notifies active administrators.
 *
 * Applications are always created as PENDING.
 * The applicant does not control the application status.
 * Application creation and notifications are committed atomically.
 */
export async function createNewPartnerApplication(
  data: CreatePartnerApplicationServiceData,
): Promise<PartnerApplication> {
  const applicationData: CreatePartnerApplicationData = {
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
  };

  return prisma.$transaction(async (tx) => {
    const application = await createPartnerApplication(applicationData, tx);

    const administrators = await tx.account.findMany({
      where: {
        role: {
          in: [Role.ADMIN, Role.SUPER_ADMIN],
        },
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    await createAccountNotifications(
      administrators.map(({ id }) => newPartnerApplicationNotification(application, id)),
      tx,
    );

    return application;
  });
}

/**
 * Lists partner applications for administrators.
 */
export async function listPartnerApplications(
  options: FindPartnerApplicationsOptions,
  actor: PartnerApplicationActor,
): Promise<PaginatedPartnerApplications> {
  requirePartnerApplicationManager(actor);

  return findPartnerApplications(options);
}

/**
 * Gets a single partner application with its related event
 * and reviewing administrator.
 */
export async function getPartnerApplicationById(
  id: string,
  actor: PartnerApplicationActor,
): Promise<PartnerApplicationWithRelations> {
  requirePartnerApplicationManager(actor);

  const application = await findPartnerApplicationByIdWithRelations(id);

  if (!application) {
    throw new PartnerApplicationNotFoundError(id);
  }

  return application;
}

/**
 * Approves a pending partner application.
 *
 * The reviewing administrator and review timestamp are recorded.
 */
export async function approvePartnerApplication(
  id: string,
  actor: PartnerApplicationActor,
  adminNotes?: string | null,
): Promise<PartnerApplication> {
  requirePartnerApplicationManager(actor);

  const application = await findPartnerApplicationById(id);

  if (!application) {
    throw new PartnerApplicationNotFoundError(id);
  }

  if (application.status === PartnerApplicationStatus.APPROVED) {
    return application;
  }

  if (application.status === PartnerApplicationStatus.REJECTED) {
    throw new PartnerApplicationInvalidStateError(
      'Rejected partner applications cannot be approved.',
    );
  }

  return updatePartnerApplication(id, {
    status: PartnerApplicationStatus.APPROVED,
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
 * Rejects a pending partner application.
 *
 * The reviewing administrator and review timestamp are recorded.
 */
export async function rejectPartnerApplication(
  id: string,
  actor: PartnerApplicationActor,
  adminNotes?: string | null,
): Promise<PartnerApplication> {
  requirePartnerApplicationManager(actor);

  const application = await findPartnerApplicationById(id);

  if (!application) {
    throw new PartnerApplicationNotFoundError(id);
  }

  if (application.status === PartnerApplicationStatus.REJECTED) {
    return application;
  }

  if (application.status === PartnerApplicationStatus.APPROVED) {
    throw new PartnerApplicationInvalidStateError(
      'Approved partner applications cannot be rejected.',
    );
  }

  return updatePartnerApplication(id, {
    status: PartnerApplicationStatus.REJECTED,
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
 * Soft-deletes a partner application.
 */
export async function deletePartnerApplication(
  id: string,
  actor: PartnerApplicationActor,
): Promise<PartnerApplication> {
  requirePartnerApplicationManager(actor);

  return softDeletePartnerApplication(id);
}
