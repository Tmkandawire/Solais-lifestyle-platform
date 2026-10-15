import { apiClient } from "./client";
import type { ApiSuccessResponse } from "../types/api";

import type {
  AdminAttendeeDetail,
  AdminAttendeeList,
  AdminAttendeeListItem,
  AdminAttendeeListMeta,
  AdminAttendeeListParams,
} from "../types/admin-attendee";

interface BackendAdminAttendeesPayload extends AdminAttendeeListMeta {
  attendees: AdminAttendeeListItem[];
}

export async function getAdminAttendees(
  params?: AdminAttendeeListParams,
  signal?: AbortSignal,
): Promise<AdminAttendeeList> {
  const response = await apiClient.get<
    ApiSuccessResponse<BackendAdminAttendeesPayload>
  >("/admin/attendees", {
    params,
    signal,
  });

  const { attendees, total, page, limit, totalPages } = response.data.data;

  return {
    attendees,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

export async function getAdminAttendeeById(
  id: string,
  signal?: AbortSignal,
): Promise<AdminAttendeeDetail> {
  const response = await apiClient.get<ApiSuccessResponse<AdminAttendeeDetail>>(
    `/admin/attendees/${encodeURIComponent(id)}`,
    {
      signal,
    },
  );

  return response.data.data;
}
