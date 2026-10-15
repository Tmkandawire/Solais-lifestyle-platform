import type { NotificationType, Order } from '../../generated/prisma/client.js';
import type { CreateNotificationData } from '../../repositories/notification.repository.js';

/**
 * Notification copy for order lifecycle events.
 *
 * These are pure functions: fixed, server-authored text and an app-relative
 * action URL. They are written directly inside the order transactions, so
 * they deliberately avoid anything that can fail at runtime (no environment
 * lookups, no absolute URLs, no user-supplied text). A failed insert inside
 * a transaction cannot be swallowed, it aborts the whole transaction, so the
 * content must be deterministic.
 */

const ORDER_TYPE: NotificationType = 'ORDER';

type OrderRef = Pick<Order, 'id' | 'accountId'>;
type OrderWithTimes = OrderRef & Pick<Order, 'createdAt' | 'expiresAt'>;

function orderReference(order: OrderRef): string {
  return `#${order.id.slice(0, 8).toUpperCase()}`;
}

function orderUrl(order: OrderRef): string {
  return `/account/orders/${order.id}`;
}

export function orderCreatedNotification(order: OrderWithTimes): CreateNotificationData {
  const minutes = Math.max(
    1,
    Math.round((order.expiresAt.getTime() - order.createdAt.getTime()) / 60_000),
  );

  return {
    accountId: order.accountId,
    type: ORDER_TYPE,
    title: 'Order reserved',
    message: `Your tickets for order ${orderReference(order)} are reserved for ${minutes} minutes. Complete payment to confirm your order.`,
    actionUrl: orderUrl(order),
  };
}

export function orderCancelledNotification(
  order: OrderRef,
  options: { byOwner: boolean },
): CreateNotificationData {
  return {
    accountId: order.accountId,
    type: ORDER_TYPE,
    title: 'Order cancelled',
    message: options.byOwner
      ? `You cancelled order ${orderReference(order)}. The reserved tickets have been released.`
      : `Order ${orderReference(order)} was cancelled by the Solaís team. The reserved tickets have been released.`,
    actionUrl: orderUrl(order),
  };
}

export function orderExpiredNotification(order: OrderRef): CreateNotificationData {
  return {
    accountId: order.accountId,
    type: ORDER_TYPE,
    title: 'Reservation expired',
    message: `Order ${orderReference(order)} was not paid in time, so the reserved tickets have been released.`,
    actionUrl: orderUrl(order),
  };
}
