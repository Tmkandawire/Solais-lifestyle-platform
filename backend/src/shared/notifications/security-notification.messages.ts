import type { CreateNotificationData } from '../../repositories/notification.repository.js';

/**
 * Notification copy for account security events.
 */
export function passwordChangedNotification(accountId: string): CreateNotificationData {
  return {
    accountId,
    type: 'SYSTEM',
    title: 'Password changed',
    message:
      'Your Solaís account password was changed successfully. If you did not make this change, please contact support immediately.',
    actionUrl: '/account/settings',
  };
}
