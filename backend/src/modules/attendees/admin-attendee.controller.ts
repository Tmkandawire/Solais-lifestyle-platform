import type { NextFunction, Request, Response } from 'express';

import {
  getAdminAttendee,
  listAdminAttendees,
  type AdminAttendeeActor,
} from '../../services/admin-attendee.service.js';

import { successResponse } from '../../shared/responses/api-response.js';

import type {
  AdminAttendeeIdInput,
  AdminAttendeeListQueryInput,
} from './admin-attendee.schemas.js';

function asyncHandler<P, ResBody, ReqBody, ReqQuery>(
  handler: (
    request: Request<P, ResBody, ReqBody, ReqQuery>,
    response: Response<ResBody>,
  ) => Promise<void>,
) {
  return (
    request: Request<P, ResBody, ReqBody, ReqQuery>,
    response: Response<ResBody>,
    next: NextFunction,
  ): void => {
    handler(request, response).catch(next);
  };
}

function getAdminAttendeeActor(request: Pick<Request, 'user'>): AdminAttendeeActor {
  if (!request.user) {
    throw new Error('Authenticated attendee handler reached without request.user.');
  }

  return {
    accountId: request.user.accountId,
    role: request.user.role,
  };
}

export const getAdminAttendees = asyncHandler<Record<string, never>, unknown, unknown, unknown>(
  async (request, response) => {
    const actor = getAdminAttendeeActor(request);

    const query = response.locals.validatedQuery as AdminAttendeeListQueryInput;

    const result = await listAdminAttendees(actor, query);

    response.setHeader('Cache-Control', 'no-store');

    response.status(200).json(successResponse('Attendees retrieved successfully.', result));
  },
);

export const getAdminAttendeeById = asyncHandler<AdminAttendeeIdInput, unknown, unknown, unknown>(
  async (request, response) => {
    const actor = getAdminAttendeeActor(request);

    const attendee = await getAdminAttendee(actor, request.params.id);

    response.setHeader('Cache-Control', 'no-store');

    response.status(200).json(successResponse('Attendee retrieved successfully.', attendee));
  },
);
