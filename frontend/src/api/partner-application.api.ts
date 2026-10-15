import { apiClient } from "./client";

import type {
  AdminPartnerApplication,
  AdminPartnerApplicationDetail,
  CreatePartnerApplicationPayload,
  PaginatedPartnerApplications,
  PublicPartnerApplication,
  ReviewPartnerApplicationPayload,
  PartnerApplicationListParams,
} from "../types/partner-application";
import type { ApiSuccessResponse } from "../types/api";

/**
 * Public partner application submission. No authentication required —
 * this hits POST /partner-applications, which is registered before the
 * authenticate middleware on the backend.
 */
export async function createPartnerApplication(
  payload: CreatePartnerApplicationPayload,
): Promise<PublicPartnerApplication> {
  const response = await apiClient.post<
    ApiSuccessResponse<PublicPartnerApplication>
  >("/partner-applications", payload);

  return response.data.data;
}

/**
 * Admin: paginated partner application list.
 * Backend returns { data, meta } directly — no remapping, matching Orders.
 */
export async function getAdminPartnerApplications(
  params?: PartnerApplicationListParams,
): Promise<PaginatedPartnerApplications> {
  const response = await apiClient.get<
    ApiSuccessResponse<PaginatedPartnerApplications>
  >("/partner-applications/manage", { params });

  return response.data.data;
}

/**
 * Admin: single partner application with related event/reviewer.
 */
export async function getAdminPartnerApplicationById(
  id: string,
): Promise<AdminPartnerApplicationDetail> {
  const response = await apiClient.get<
    ApiSuccessResponse<AdminPartnerApplicationDetail>
  >(`/partner-applications/manage/${id}`);

  return response.data.data;
}

/**
 * Admin: approve a pending application. Body is always sent, even
 * when adminNotes is omitted, since the route runs validateBody.
 */
export async function approvePartnerApplication(
  id: string,
  payload: ReviewPartnerApplicationPayload = {},
): Promise<AdminPartnerApplication> {
  const response = await apiClient.post<
    ApiSuccessResponse<AdminPartnerApplication>
  >(`/partner-applications/${id}/approve`, payload);

  return response.data.data;
}

/**
 * Admin: reject a pending application.
 */
export async function rejectPartnerApplication(
  id: string,
  payload: ReviewPartnerApplicationPayload = {},
): Promise<AdminPartnerApplication> {
  const response = await apiClient.post<
    ApiSuccessResponse<AdminPartnerApplication>
  >(`/partner-applications/${id}/reject`, payload);

  return response.data.data;
}

/**
 * Admin: soft-delete an application. Backend returns data: null.
 */
export async function deletePartnerApplication(id: string): Promise<null> {
  const response = await apiClient.delete<ApiSuccessResponse<null>>(
    `/partner-applications/${id}`,
  );

  return response.data.data;
}
