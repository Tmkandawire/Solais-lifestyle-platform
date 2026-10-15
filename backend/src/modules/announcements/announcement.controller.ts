import type { RequestHandler } from 'express';
import {
  changeAnnouncementStatus,
  createAnnouncementDraft,
  editAnnouncement,
  getAnnouncementById,
  listAnnouncements,
  listPublishedAnnouncements,
  removeAnnouncement,
  getAnnouncementUnreadStatus,
  markAnnouncementsAsSeen,
} from '../../services/announcement.service.js';
import type {
  AnnouncementInput,
  AnnouncementListQueryInput,
  PublicAnnouncementQueryInput,
} from './announcement.schemas.js';
import { ApiError } from '../../shared/errors/api-error.js';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

function getAnnouncementId(request: Parameters<RequestHandler>[0]): string {
  const id = request.params.id;

  if (typeof id !== 'string') {
    throw new ApiError({
      statusCode: 400,
      message: 'Invalid announcement ID.',
    });
  }

  return id;
}

function sendSuccess(
  response: Parameters<RequestHandler>[1],
  message: string,
  data: unknown,
  statusCode = 200,
) {
  return response.status(statusCode).json({
    success: true,
    message,
    data,
    errors: [],
  });
}

export const listPublicAnnouncementsHandler: RequestHandler = async (_request, response) => {
  const query = response.locals.validatedQuery as PublicAnnouncementQueryInput;
  const data = await listPublishedAnnouncements(query.page, query.limit);

  return sendSuccess(response, 'Announcements retrieved successfully.', data);
};

export const listAnnouncementsHandler: RequestHandler = async (_request, response) => {
  const query = response.locals.validatedQuery as AnnouncementListQueryInput;
  const data = await listAnnouncements({
    page: query.page,
    limit: query.limit,
    ...(query.status ? { status: query.status } : {}),
    ...(query.search ? { search: query.search } : {}),
  });

  return sendSuccess(response, 'Announcements retrieved successfully.', data);
};

export const getAnnouncementHandler: RequestHandler = async (request, response) => {
  const data = await getAnnouncementById(getAnnouncementId(request));

  return sendSuccess(response, 'Announcement retrieved successfully.', data);
};

export const createAnnouncementHandler: RequestHandler = async (request, response) => {
  const data = await createAnnouncementDraft(request.body as AnnouncementInput);

  return sendSuccess(response, 'Announcement draft created successfully.', data, 201);
};

export const updateAnnouncementHandler: RequestHandler = async (request, response) => {
  const data = await editAnnouncement(
    getAnnouncementId(request),
    request.body as AnnouncementInput,
  );

  return sendSuccess(response, 'Announcement updated successfully.', data);
};

export const publishAnnouncementHandler: RequestHandler = async (request, response) => {
  const data = await changeAnnouncementStatus(getAnnouncementId(request), 'PUBLISHED');

  return sendSuccess(response, 'Announcement published successfully.', data);
};

export const archiveAnnouncementHandler: RequestHandler = async (request, response) => {
  const data = await changeAnnouncementStatus(getAnnouncementId(request), 'ARCHIVED');

  return sendSuccess(response, 'Announcement archived successfully.', data);
};

export const deleteAnnouncementHandler: RequestHandler = async (request, response) => {
  await removeAnnouncement(getAnnouncementId(request));

  return sendSuccess(response, 'Announcement deleted successfully.', null);
};

export const announcementUnreadStatusHandler: RequestHandler = async (request, response) => {
  const authenticatedRequest = request as AuthenticatedRequest;

  const data = await getAnnouncementUnreadStatus(authenticatedRequest.user.accountId);

  return sendSuccess(response, 'Announcement unread status retrieved successfully.', data);
};

export const markAnnouncementsSeenHandler: RequestHandler = async (request, response) => {
  const authenticatedRequest = request as AuthenticatedRequest;
  const body = request.body as { seenThrough?: unknown };

  if (typeof body.seenThrough !== 'string' || Number.isNaN(Date.parse(body.seenThrough))) {
    throw new ApiError({
      statusCode: 400,
      message: 'A valid seenThrough timestamp is required.',
    });
  }

  const data = await markAnnouncementsAsSeen(authenticatedRequest.user.accountId, body.seenThrough);

  return sendSuccess(response, 'Announcements marked as seen.', data);
};
