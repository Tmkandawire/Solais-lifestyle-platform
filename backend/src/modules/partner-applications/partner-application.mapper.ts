import type { PartnerApplication } from '../../generated/prisma/client.js';

export interface PublicPartnerApplication {
  id: string;
  organisationName: string;
  contactPerson: string;
  email: string;
  status: PartnerApplication['status'];
  createdAt: Date;
}

/**
 * Maps a partner application to the limited shape exposed by the
 * public submission endpoint.
 *
 * Internal review fields are deliberately excluded.
 */
export function toPublicPartnerApplication(
  application: PartnerApplication,
): PublicPartnerApplication {
  return {
    id: application.id,
    organisationName: application.organisationName,
    contactPerson: application.contactPerson,
    email: application.email,
    status: application.status,
    createdAt: application.createdAt,
  };
}
