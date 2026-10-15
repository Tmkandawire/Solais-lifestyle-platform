import { apiClient } from "./client";
import type { ApiSuccessResponse } from "../types/api";

interface AnnouncementUnreadStatus {
  hasNewAnnouncements: boolean;
}

interface MarkAnnouncementsSeenResponse {
  success: boolean;
}

export async function getAnnouncementUnreadStatus(): Promise<boolean> {
  const response = await apiClient.get<
    ApiSuccessResponse<AnnouncementUnreadStatus>
  >("/announcements/unread-status");

  return response.data.data.hasNewAnnouncements;
}

export async function markAnnouncementsSeen(
  seenThrough: string,
): Promise<void> {
  await apiClient.patch<ApiSuccessResponse<MarkAnnouncementsSeenResponse>>(
    "/announcements/seen",
    { seenThrough },
  );
}
