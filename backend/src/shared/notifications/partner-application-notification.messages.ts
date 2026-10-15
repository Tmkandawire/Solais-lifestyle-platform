import type { PartnerApplication } from '../../generated/prisma/client.js';
import type { CreateNotificationData } from '../../repositories/notification.repository.js';

type PartnerApplicationReference = Pick<PartnerApplication, 'id' | 'organisationName'>;

export function newPartnerApplicationNotification(
  application: PartnerApplicationReference,
  accountId: string,
): CreateNotificationData {
  return {
    accountId,
    type: 'PARTNER_APPLICATION',
    title: 'New partner application',
    message: `A new partner application has been submitted by ${application.organisationName}. Review it in the admin dashboard.`,
    actionUrl: `/admin/partners/${application.id}`,
  };
}
