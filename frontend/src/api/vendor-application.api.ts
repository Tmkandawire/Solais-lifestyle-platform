import { apiClient } from "./client";

import type {
  AdminVendorApplication,
  AdminVendorApplicationDetail,
  CreateVendorApplicationPayload,
  PaginatedVendorApplications,
  PublicVendorApplication,
  ReviewVendorApplicationPayload,
  VendorApplicationListParams,
} from "../types/vendor-application";
import type { ApiSuccessResponse } from "../types/api";

/**
 * Public vendor application submission. No authentication required —
 * this hits POST /vendor-applications, which is registered before the
 * authenticate middleware on the backend.
 */
export async function createVendorApplication(
  payload: CreateVendorApplicationPayload,
): Promise<PublicVendorApplication> {
  const response = await apiClient.post<
    ApiSuccessResponse<PublicVendorApplication>
  >("/vendor-applications", payload);

  return response.data.data;
}

/**
 * Admin: paginated vendor application list.
 * Backend returns { data, meta } directly — no remapping, matching Orders.
 */
export async function getAdminVendorApplications(
  params?: VendorApplicationListParams,
): Promise<PaginatedVendorApplications> {
  const response = await apiClient.get<
    ApiSuccessResponse<PaginatedVendorApplications>
  >("/vendor-applications/manage", { params });

  return response.data.data;
}

/**
 * Admin: single vendor application with related event/reviewer.
 */
export async function getAdminVendorApplicationById(
  id: string,
): Promise<AdminVendorApplicationDetail> {
  const response = await apiClient.get<
    ApiSuccessResponse<AdminVendorApplicationDetail>
  >(`/vendor-applications/manage/${id}`);

  return response.data.data;
}

/**
 * Admin: approve a pending application. Body is always sent, even
 * when adminNotes is omitted, since the route runs validateBody.
 */
export async function approveVendorApplication(
  id: string,
  payload: ReviewVendorApplicationPayload = {},
): Promise<AdminVendorApplication> {
  const response = await apiClient.post<
    ApiSuccessResponse<AdminVendorApplication>
  >(`/vendor-applications/${id}/approve`, payload);

  return response.data.data;
}

/**
 * Admin: reject a pending application.
 */
export async function rejectVendorApplication(
  id: string,
  payload: ReviewVendorApplicationPayload = {},
): Promise<AdminVendorApplication> {
  const response = await apiClient.post<
    ApiSuccessResponse<AdminVendorApplication>
  >(`/vendor-applications/${id}/reject`, payload);

  return response.data.data;
}

/**
 * Admin: soft-delete an application. Backend returns data: null.
 */
export async function deleteVendorApplication(id: string): Promise<null> {
  const response = await apiClient.delete<ApiSuccessResponse<null>>(
    `/vendor-applications/${id}`,
  );

  return response.data.data;
}
