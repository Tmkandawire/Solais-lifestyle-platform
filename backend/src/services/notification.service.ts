import type { NotificationType, Prisma } from '../generated/prisma/client.js';
import {
  countUnreadNotifications,
  createNotification,
  createNotifications,
  deleteNotification,
  findNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type CreateNotificationData,
  type FindNotificationsOptions,
} from '../repositories/notification.repository.js';
import { ApiError } from '../shared/errors/api-error.js';
import { NotificationNotFoundError } from '../shared/errors/notification.errors.js';

const MAX_TITLE_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 1_000;
const MAX_ACTION_URL_LENGTH = 500;

type DbClient = Prisma.TransactionClient;

export interface NotificationActor {
  accountId: string;
}

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string | null;
}

interface NormalizedNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  actionUrl: string | null;
}

function normalizeAndValidateInput(input: CreateNotificationInput): NormalizedNotificationInput {
  const title = input.title.trim();
  const message = input.message.trim();
  const actionUrl = input.actionUrl?.trim() || null;

  if (!title || title.length > MAX_TITLE_LENGTH) {
    throw new ApiError({
      statusCode: 400,
      message: `Notification title must contain 1–${MAX_TITLE_LENGTH} characters.`,
    });
  }

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    throw new ApiError({
      statusCode: 400,
      message: `Notification message must contain 1–${MAX_MESSAGE_LENGTH} characters.`,
    });
  }

  if (actionUrl !== null) {
    const hasUnsafeCharacters = [...actionUrl].some((character) => {
      const code = character.charCodeAt(0);
      return code <= 31 || code === 127 || character === '\\';
    });

    if (
      actionUrl.length > MAX_ACTION_URL_LENGTH ||
      hasUnsafeCharacters ||
      actionUrl.startsWith('//')
    ) {
      throw new ApiError({
        statusCode: 400,
        message: 'Notification action URL is invalid.',
      });
    }

    if (!actionUrl.startsWith('/')) {
      let parsedUrl: URL;

      try {
        parsedUrl = new URL(actionUrl);
      } catch {
        throw new ApiError({
          statusCode: 400,
          message: 'Notification action URL must be a relative path or HTTPS URL.',
        });
      }

      if (
        parsedUrl.protocol !== 'https:' ||
        !parsedUrl.hostname ||
        parsedUrl.username ||
        parsedUrl.password
      ) {
        throw new ApiError({
          statusCode: 400,
          message: 'Notification action URL must be a safe HTTPS URL.',
        });
      }

      const frontendUrl = process.env.FRONTEND_URL;

      if (!frontendUrl) {
        throw new ApiError({
          statusCode: 400,
          message: 'Absolute action URLs require FRONTEND_URL to be configured.',
        });
      }

      let frontendOrigin: string;

      try {
        frontendOrigin = new URL(frontendUrl).origin;
      } catch {
        throw new Error('FRONTEND_URL must be a valid absolute URL.');
      }

      if (parsedUrl.origin !== frontendOrigin) {
        throw new ApiError({
          statusCode: 400,
          message: 'Notification action URL must use the configured frontend origin.',
        });
      }
    }
  }

  return { type: input.type, title, message, actionUrl };
}

export async function createAccountNotification(
  accountId: string,
  input: CreateNotificationInput,
  client?: DbClient,
) {
  const normalized = normalizeAndValidateInput(input);

  const data: CreateNotificationData = {
    accountId,
    type: normalized.type,
    title: normalized.title,
    message: normalized.message,
    actionUrl: normalized.actionUrl,
  };

  return client ? createNotification(data, client) : createNotification(data);
}

export async function createAccountNotifications(
  notifications: CreateNotificationData[],
  client?: DbClient,
): Promise<number> {
  const normalized = notifications.map((notification) => {
    const input = normalizeAndValidateInput({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      ...(notification.actionUrl !== undefined ? { actionUrl: notification.actionUrl } : {}),
    });

    return {
      accountId: notification.accountId,
      type: input.type,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl,
    };
  });

  return client ? createNotifications(normalized, client) : createNotifications(normalized);
}

export function listAccountNotifications(
  options: Omit<FindNotificationsOptions, 'accountId'>,
  actor: NotificationActor,
) {
  return findNotifications({
    ...options,
    accountId: actor.accountId,
  });
}

export function getAccountUnreadNotificationCount(actor: NotificationActor): Promise<number> {
  return countUnreadNotifications(actor.accountId);
}

export async function markAccountNotificationRead(
  id: string,
  actor: NotificationActor,
): Promise<void> {
  const result = await markNotificationRead(id, actor.accountId);

  if (result === 0) {
    throw new NotificationNotFoundError();
  }
}

export function markAllAccountNotificationsRead(actor: NotificationActor): Promise<number> {
  return markAllNotificationsRead(actor.accountId);
}

export async function deleteAccountNotification(
  id: string,
  actor: NotificationActor,
): Promise<void> {
  const result = await deleteNotification(id, actor.accountId);

  if (result === 0) {
    throw new NotificationNotFoundError();
  }
}
