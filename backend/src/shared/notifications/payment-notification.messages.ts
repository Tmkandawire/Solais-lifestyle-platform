import type { NotificationType, Payment } from '../../generated/prisma/client.js';
import type { CreateNotificationData } from '../../repositories/notification.repository.js';

const PAYMENT_TYPE: NotificationType = 'PAYMENT';
const TICKET_TYPE: NotificationType = 'TICKET';

type PaymentReference = Pick<Payment, 'id' | 'orderId'>;

export function paymentSuccessfulNotification(
  payment: PaymentReference,
  accountId: string,
): CreateNotificationData {
  return {
    accountId,
    type: PAYMENT_TYPE,
    title: 'Payment successful',
    message: `Your payment for order #${payment.orderId.slice(0, 8).toUpperCase()} was successful.`,
    actionUrl: `/account/orders/${payment.orderId}`,
  };
}

export function ticketsIssuedNotification(
  orderId: string,
  accountId: string,
): CreateNotificationData {
  return {
    accountId,
    type: TICKET_TYPE,
    title: 'Your tickets are ready',
    message: `Your tickets for order #${orderId.slice(0, 8).toUpperCase()} have been issued and are ready to view.`,
    actionUrl: `/account/orders/${orderId}`,
  };
}
