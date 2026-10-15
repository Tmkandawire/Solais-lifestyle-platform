import type { Request, Response } from 'express';

import {
  approvePartnerApplication,
  createNewPartnerApplication,
  deletePartnerApplication,
  getPartnerApplicationById,
  listPartnerApplications,
  rejectPartnerApplication,
} from '../../services/partner-application.service.js';
import { successResponse } from '../../shared/responses/api-response.js';

import { toPublicPartnerApplication } from './partner-application.mapper.js';
import type {
  CreatePartnerApplicationInput,
  ReviewPartnerApplicationInput,
  PartnerApplicationIdInput,
  PartnerApplicationListQueryInput,
} from './partner-application.schemas.js';

type PartnerApplicationIdRequest = Request<PartnerApplicationIdInput>;

type CreatePartnerApplicationRequest = Request<
  Record<string, never>,
  unknown,
  CreatePartnerApplicationInput
>;

type ReviewPartnerApplicationRequest = Request<
  PartnerApplicationIdInput,
  unknown,
  ReviewPartnerApplicationInput
>;

function requireUser(request: Request) {
  if (!request.user) {
    throw new Error('Authenticated route handler reached without request.user.');
  }

  return request.user;
}

/**
 * Public partner application submission.
 */
export async function createPartnerApplication(
  request: CreatePartnerApplicationRequest,
  response: Response,
): Promise<void> {
  const application = await createNewPartnerApplication({
    organisationName: request.body.organisationName,
    contactPerson: request.body.contactPerson,
    phoneNumber: request.body.phoneNumber,
    email: request.body.email,
    partnershipType: request.body.partnershipType,
    organisationDescription: request.body.organisationDescription,
    partnershipInterest: request.body.partnershipInterest,
    contributionDescription: request.body.contributionDescription,
    ...(request.body.websiteOrSocial !== undefined
      ? { websiteOrSocial: request.body.websiteOrSocial }
      : {}),
    ...(request.body.preferredEventId !== undefined
      ? { preferredEventId: request.body.preferredEventId }
      : {}),
  });

  response
    .status(201)
    .json(
      successResponse(
        'Partner application submitted successfully.',
        toPublicPartnerApplication(application),
      ),
    );
}

/**
 * Lists partner applications for administrators.
 */
export async function getPartnerApplications(_request: Request, response: Response): Promise<void> {
  const user = requireUser(response.req);

  const query = response.locals.validatedQuery as PartnerApplicationListQueryInput;

  const result = await listPartnerApplications(
    {
      page: query.page,
      limit: query.limit,
      ...(query.status !== undefined ? { status: query.status } : {}),
    },
    {
      accountId: user.accountId,
      role: user.role,
    },
  );

  response.json(successResponse('Partner applications retrieved successfully.', result));
}

/**
 * Gets a single partner application for administrators.
 */
export async function getPartnerApplication(
  request: PartnerApplicationIdRequest,
  response: Response,
): Promise<void> {
  const user = requireUser(request);

  const application = await getPartnerApplicationById(request.params.id, {
    accountId: user.accountId,
    role: user.role,
  });

  response.json(successResponse('Partner application retrieved successfully.', application));
}

/**
 * Approves a partner application.
 */
export async function approveExistingPartnerApplication(
  request: ReviewPartnerApplicationRequest,
  response: Response,
): Promise<void> {
  const user = requireUser(request);

  const application = await approvePartnerApplication(
    request.params.id,
    {
      accountId: user.accountId,
      role: user.role,
    },
    request.body.adminNotes,
  );

  response.json(successResponse('Partner application approved successfully.', application));
}

/**
 * Rejects a partner application.
 */
export async function rejectExistingPartnerApplication(
  request: ReviewPartnerApplicationRequest,
  response: Response,
): Promise<void> {
  const user = requireUser(request);

  const application = await rejectPartnerApplication(
    request.params.id,
    {
      accountId: user.accountId,
      role: user.role,
    },
    request.body.adminNotes,
  );

  response.json(successResponse('Partner application rejected successfully.', application));
}

/**
 * Deletes a partner application.
 */
export async function deleteExistingPartnerApplication(
  request: PartnerApplicationIdRequest,
  response: Response,
): Promise<void> {
  const user = requireUser(request);

  await deletePartnerApplication(request.params.id, {
    accountId: user.accountId,
    role: user.role,
  });

  response.json(successResponse('Partner application deleted successfully.', null));
}
