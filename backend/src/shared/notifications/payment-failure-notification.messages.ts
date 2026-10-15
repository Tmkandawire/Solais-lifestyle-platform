import type { Payment } from '../../generated/prisma/client.js';
import type { CreateNotificationData } from '../../repositories/notification.repository.js';

type FailedPaymentReference = Pick<Payment, 'orderId'>;

export function paymentFailedNotification(
  payment: FailedPaymentReference,
  accountId: string,
): CreateNotificationData {
  const orderReference = `#${payment.orderId.slice(0, 8).toUpperCase()}`;

  return {
    accountId,
    type: 'PAYMENT',
    title: 'Payment failed',
    message: `Your payment for order ${orderReference} was marked as failed. Please review your order or contact support if you need assistance.`,
    actionUrl: `/account/orders/${payment.orderId}`,
  };
}
