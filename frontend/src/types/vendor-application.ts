import type { Event } from "./event";
import type { VendorApplicationStatus } from "./vendor-application-status";
import type { Paginated, PaginationMeta } from "./pagination";

/**
 * Shape returned by the public submission endpoint
 * (POST /vendor-applications), via toPublicVendorApplication().
 */
export interface PublicVendorApplication {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  status: VendorApplicationStatus;
  createdAt: string;
}

/**
 * Full record returned by admin list/approve/reject/delete endpoints.
 * These paths are already actor-gated, so no mapper strips fields —
 * matches the raw VendorApplication Prisma shape.
 */
export interface AdminVendorApplication {
  id: string;
  businessName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  businessCategory: string;
  productsOrServices: string;
  websiteOrSocial: string | null;
  preferredEventId: string | null;
  status: VendorApplicationStatus;
  adminNotes: string | null;
  reviewedAt: string | null;
  reviewedById: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Minimal reviewing-admin shape. Mirrors the SafeAccount DTO fields
 * (passwordHash is stripped globally at the Prisma client level).
 * If a shared Account/SafeAccount type already exists elsewhere in
 * the frontend, swap this out for it rather than keeping a duplicate.
 */
export interface VendorApplicationReviewer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

/**
 * Shape returned only by GET /vendor-applications/manage/:id, which
 * includes the related event and reviewing admin. The list endpoint
 * does NOT include these — keep this type distinct from AdminVendorApplication.
 */
export interface AdminVendorApplicationDetail extends AdminVendorApplication {
  preferredEvent: Event | null;
  reviewedBy: VendorApplicationReviewer | null;
}

/**
 * Public submission payload. Matches createVendorApplicationSchema —
 * optional fields are undefined-only (no null), since Zod's
 * .optional() with no .nullable() rejects null.
 */
export interface CreateVendorApplicationPayload {
  businessName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  businessCategory: string;
  productsOrServices: string;
  websiteOrSocial?: string;
  preferredEventId?: string;
}

/**
 * Approve/reject payload. reviewVendorApplicationSchema still requires
 * a request body to be present (even though adminNotes itself is
 * optional) since it's run through validateBody — always send at
 * least `{}`.
 */
export interface ReviewVendorApplicationPayload {
  adminNotes?: string;
}

export interface VendorApplicationListParams {
  page?: number;
  limit?: number;
  status?: VendorApplicationStatus;
}

export type VendorApplicationListMeta = PaginationMeta;

/**
 * The backend's findVendorApplications() already returns { data, meta }
 * directly — no flat total/page/limit/totalPages shape to remap here,
 * same as Orders. Use the shared Paginated<T> generic as-is.
 */
export type PaginatedVendorApplications = Paginated<AdminVendorApplication>;
