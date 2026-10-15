import type { VendorApplication } from '../../generated/prisma/client.js';

export interface PublicVendorApplication {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  status: VendorApplication['status'];
  createdAt: Date;
}

/**
 * Maps a vendor application to the limited shape exposed by the
 * public submission endpoint.
 *
 * Internal review fields are deliberately excluded.
 */
export function toPublicVendorApplication(application: VendorApplication): PublicVendorApplication {
  return {
    id: application.id,
    businessName: application.businessName,
    contactPerson: application.contactPerson,
    email: application.email,
    status: application.status,
    createdAt: application.createdAt,
  };
}
