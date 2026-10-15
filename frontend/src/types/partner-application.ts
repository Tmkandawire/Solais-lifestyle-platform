import type { Event } from "./event";
import type { PartnerApplicationStatus } from "./partner-application-status";
import type { Paginated, PaginationMeta } from "./pagination";

/**
 * Shape returned by the public submission endpoint
 * (POST /partner-applications), via toPublicPartnerApplication().
 */
export interface PublicPartnerApplication {
  id: string;
  organisationName: string;
  contactPerson: string;
  email: string;
  status: PartnerApplicationStatus;
  createdAt: string;
}

/**
 * Full record returned by admin list/approve/reject/delete endpoints.
 * These paths are already actor-gated, so no mapper strips fields —
 * matches the raw PartnerApplication Prisma shape.
 */
export interface AdminPartnerApplication {
  id: string;
  organisationName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  partnershipType: string;
  organisationDescription: string;
  partnershipInterest: string;
  contributionDescription: string;
  websiteOrSocial: string | null;
  preferredEventId: string | null;
  status: PartnerApplicationStatus;
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
export interface PartnerApplicationReviewer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

/**
 * Shape returned only by GET /partner-applications/manage/:id, which
 * includes the related event and reviewing admin. The list endpoint
 * does NOT include these — keep this type distinct from AdminPartnerApplication.
 */
export interface AdminPartnerApplicationDetail extends AdminPartnerApplication {
  preferredEvent: Event | null;
  reviewedBy: PartnerApplicationReviewer | null;
}

/**
 * Public submission payload. Matches createPartnerApplicationSchema —
 * optional fields are undefined-only (no null), since Zod's
 * .optional() with no .nullable() rejects null.
 */
export interface CreatePartnerApplicationPayload {
  organisationName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  partnershipType: string;
  organisationDescription: string;
  partnershipInterest: string;
  contributionDescription: string;
  websiteOrSocial?: string;
  preferredEventId?: string;
}

/**
 * Approve/reject payload. reviewPartnerApplicationSchema still requires
 * a request body to be present (even though adminNotes itself is
 * optional) since it's run through validateBody — always send at
 * least `{}`.
 */
export interface ReviewPartnerApplicationPayload {
  adminNotes?: string;
}

export interface PartnerApplicationListParams {
  page?: number;
  limit?: number;
  status?: PartnerApplicationStatus;
}

export type PartnerApplicationListMeta = PaginationMeta;

/**
 * The backend's findPartnerApplications() already returns { data, meta }
 * directly — no flat total/page/limit/totalPages shape to remap here,
 * same as Orders. Use the shared Paginated<T> generic as-is.
 */
export type PaginatedPartnerApplications = Paginated<AdminPartnerApplication>;
