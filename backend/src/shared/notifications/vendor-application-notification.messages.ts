import type { VendorApplication } from '../../generated/prisma/client.js';
import type { CreateNotificationData } from '../../repositories/notification.repository.js';

type VendorApplicationReference = Pick<VendorApplication, 'id' | 'businessName'>;

export function newVendorApplicationNotification(
  application: VendorApplicationReference,
  accountId: string,
): CreateNotificationData {
  return {
    accountId,
    type: 'VENDOR_APPLICATION',
    title: 'New vendor application',
    message: `A new vendor application has been submitted by ${application.businessName}. Review it in the admin dashboard.`,
    actionUrl: `/admin/vendors/${application.id}`,
  };
}
