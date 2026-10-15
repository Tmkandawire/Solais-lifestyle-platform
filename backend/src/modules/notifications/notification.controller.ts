import type { NextFunction, Request, Response } from 'express';

import {
  deleteAccountNotification,
  getAccountUnreadNotificationCount,
  listAccountNotifications,
  markAccountNotificationRead,
  markAllAccountNotificationsRead,
  type NotificationActor,
} from '../../services/notification.service.js';
import { successResponse } from '../../shared/responses/api-response.js';
import type { NotificationIdInput, NotificationListQueryInput } from './notification.schemas.js';
import { ApiError } from '../../shared/errors/api-error.js';

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

function getNotificationActor(request: Pick<Request, 'user'>): NotificationActor {
  if (!request.user) {
    throw new ApiError({
      statusCode: 500,
      message: 'Authenticated notification handler reached without request.user.',
      isOperational: false,
    });
  }

  return { accountId: request.user.accountId };
}

export const getNotifications = asyncHandler<Record<string, never>, unknown, unknown, unknown>(
  async (request, response) => {
    const validatedQuery: unknown = response.locals.validatedQuery;

    if (
      typeof validatedQuery !== 'object' ||
      validatedQuery === null ||
      !('page' in validatedQuery) ||
      !('limit' in validatedQuery) ||
      !('unreadOnly' in validatedQuery)
    ) {
      throw new ApiError({
        statusCode: 500,
        message: 'Validated notification query is missing.',
        isOperational: false,
      });
    }

    const query = validatedQuery as NotificationListQueryInput;
    const result = await listAccountNotifications(query, getNotificationActor(request));

    response.status(200).json(successResponse('Notifications retrieved successfully.', result));
  },
);

export const getUnreadNotificationCount = asyncHandler<
  Record<string, never>,
  unknown,
  unknown,
  unknown
>(async (request, response) => {
  const count = await getAccountUnreadNotificationCount(getNotificationActor(request));

  response.status(200).json(
    successResponse('Unread notification count retrieved successfully.', {
      unreadCount: count,
    }),
  );
});

export const markNotificationAsRead = asyncHandler<NotificationIdInput, unknown, unknown, unknown>(
  async (request, response) => {
    await markAccountNotificationRead(request.params.id, getNotificationActor(request));

    response.status(200).json(successResponse('Notification marked as read.', null));
  },
);

export const markAllNotificationsAsRead = asyncHandler<
  Record<string, never>,
  unknown,
  unknown,
  unknown
>(async (request, response) => {
  const updatedCount = await markAllAccountNotificationsRead(getNotificationActor(request));

  response.status(200).json(successResponse('Notifications marked as read.', { updatedCount }));
});

export const removeNotification = asyncHandler<NotificationIdInput, unknown, unknown, unknown>(
  async (request, response) => {
    await deleteAccountNotification(request.params.id, getNotificationActor(request));

    response.status(200).json(successResponse('Notification deleted successfully.', null));
  },
);
