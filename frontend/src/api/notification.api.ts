import { apiClient } from "./client";

import type { ApiSuccessResponse } from "../types/api";
import type {
  MarkAllNotificationsReadResult,
  NotificationListParams,
  NotificationListResponse,
  UnreadNotificationCount,
} from "../types/notification";

/**
 * Every function accepts an optional AbortSignal so hooks can cancel a
 * superseded request (a new page or filter, or an unmount) and ignore a late
 * response.
 */

export async function getNotifications(
  params: NotificationListParams = {},
  signal?: AbortSignal,
): Promise<NotificationListResponse> {
  const { page, limit, unreadOnly } = params;

  // Only send what the caller set. The backend owns the defaults (page 1,
  // limit 20, unreadOnly false), so they are not duplicated here.
  const response = await apiClient.get<
    ApiSuccessResponse<NotificationListResponse>
  >("/notifications", {
    params: {
      ...(page !== undefined ? { page } : {}),
      ...(limit !== undefined ? { limit } : {}),
      ...(unreadOnly !== undefined ? { unreadOnly } : {}),
    },
    signal,
  });

  return response.data.data;
}

export async function getUnreadNotificationCount(
  signal?: AbortSignal,
): Promise<number> {
  const response = await apiClient.get<
    ApiSuccessResponse<UnreadNotificationCount>
  >("/notifications/unread-count", { signal });

  return response.data.data.unreadCount;
}

/** Idempotent: marking an already-read notification still succeeds. */
export async function markNotificationAsRead(
  id: string,
  signal?: AbortSignal,
): Promise<void> {
  await apiClient.patch<ApiSuccessResponse<null>>(
    `/notifications/${encodeURIComponent(id)}/read`,
    undefined,
    { signal },
  );
}

/** Resolves with how many notifications changed. */
export async function markAllNotificationsAsRead(
  signal?: AbortSignal,
): Promise<number> {
  const response = await apiClient.patch<
    ApiSuccessResponse<MarkAllNotificationsReadResult>
  >("/notifications/read-all", undefined, { signal });

  return response.data.data.updatedCount;
}

export async function deleteNotification(
  id: string,
  signal?: AbortSignal,
): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<null>>(
    `/notifications/${encodeURIComponent(id)}`,
    { signal },
  );
}
