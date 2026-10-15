import type { Request, Response } from 'express';

import {
  approveVendorApplication,
  createNewVendorApplication,
  deleteVendorApplication,
  getVendorApplicationById,
  listVendorApplications,
  rejectVendorApplication,
} from '../../services/vendor-application.service.js';
import { successResponse } from '../../shared/responses/api-response.js';

import { toPublicVendorApplication } from './vendor-application.mapper.js';
import type {
  CreateVendorApplicationInput,
  ReviewVendorApplicationInput,
  VendorApplicationIdInput,
  VendorApplicationListQueryInput,
} from './vendor-application.schemas.js';

type VendorApplicationIdRequest = Request<VendorApplicationIdInput>;
type CreateVendorApplicationRequest = Request<
  Record<string, never>,
  unknown,
  CreateVendorApplicationInput
>;
type ReviewVendorApplicationRequest = Request<
  VendorApplicationIdInput,
  unknown,
  ReviewVendorApplicationInput
>;

function requireUser(request: Request) {
  if (!request.user) {
    throw new Error('Authenticated route handler reached without request.user.');
  }

  return request.user;
}

/**
 * Public vendor application submission.
 */
export async function createVendorApplication(
  request: CreateVendorApplicationRequest,
  response: Response,
): Promise<void> {
  const application = await createNewVendorApplication({
    businessName: request.body.businessName,
    contactPerson: request.body.contactPerson,
    phoneNumber: request.body.phoneNumber,
    email: request.body.email,
    businessCategory: request.body.businessCategory,
    productsOrServices: request.body.productsOrServices,
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
        'Vendor application submitted successfully.',
        toPublicVendorApplication(application),
      ),
    );
}

/**
 * Lists vendor applications for administrators.
 */
export async function getVendorApplications(_request: Request, response: Response): Promise<void> {
  const user = requireUser(response.req);

  const query = response.locals.validatedQuery as VendorApplicationListQueryInput;

  const result = await listVendorApplications(
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

  response.json(successResponse('Vendor applications retrieved successfully.', result));
}

/**
 * Gets a single vendor application for administrators.
 */
export async function getVendorApplication(
  request: VendorApplicationIdRequest,
  response: Response,
): Promise<void> {
  const user = requireUser(request);

  const application = await getVendorApplicationById(request.params.id, {
    accountId: user.accountId,
    role: user.role,
  });

  response.json(successResponse('Vendor application retrieved successfully.', application));
}

/**
 * Approves a vendor application.
 */
export async function approveExistingVendorApplication(
  request: ReviewVendorApplicationRequest,
  response: Response,
): Promise<void> {
  const user = requireUser(request);

  const application = await approveVendorApplication(
    request.params.id,
    {
      accountId: user.accountId,
      role: user.role,
    },
    request.body.adminNotes,
  );

  response.json(successResponse('Vendor application approved successfully.', application));
}

/**
 * Rejects a vendor application.
 */
export async function rejectExistingVendorApplication(
  request: ReviewVendorApplicationRequest,
  response: Response,
): Promise<void> {
  const user = requireUser(request);

  const application = await rejectVendorApplication(
    request.params.id,
    {
      accountId: user.accountId,
      role: user.role,
    },
    request.body.adminNotes,
  );

  response.json(successResponse('Vendor application rejected successfully.', application));
}

/**
 * Deletes a vendor application.
 */
export async function deleteExistingVendorApplication(
  request: VendorApplicationIdRequest,
  response: Response,
): Promise<void> {
  const user = requireUser(request);

  await deleteVendorApplication(request.params.id, {
    accountId: user.accountId,
    role: user.role,
  });

  response.json(successResponse('Vendor application deleted successfully.', null));
}
