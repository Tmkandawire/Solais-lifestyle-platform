// payment.service.ts
import { OrderStatus, PaymentStatus } from '../generated/prisma/enums.js';
import type { PaymentProvider } from '../generated/prisma/enums.js';
import { Prisma } from '../generated/prisma/client.js';

import { prisma } from '../lib/prisma.js';

import { createNotification } from '../repositories/notification.repository.js';

import {
  paymentSuccessfulNotification,
  ticketsIssuedNotification,
} from '../shared/notifications/payment-notification.messages.js';

import { paymentFailedNotification } from '../shared/notifications/payment-failure-notification.messages.js';

import {
  createPayment,
  findPaymentByOrderId,
  getPaymentById,
  markPaymentSuccessfulInTransaction,
  updatePayment,
  type PaymentWithOrder,
} from '../repositories/payment.repository.js';

import { findOrderById, markOrderPaidInTransaction } from '../repositories/order.repository.js';

import {
  issueTicketsForOrderInTransaction,
  type IssueTicketsRequest,
  type IssuedTicketWithCredential,
} from './issued-ticket.service.js';

import { PaymentInvalidStateError, PaymentNotFoundError } from '../shared/errors/payment.errors.js';

import { ForbiddenError } from '../shared/errors/auth.errors.js';

import { isAdmin, type OrderActor } from './order.service.js';

export interface CreatePaymentInput {
  orderId: string;
  provider: PaymentProvider;
}

/**
 * Creates a payment for an existing pending order.
 *
 * Important invariants:
 * - The order must exist.
 * - Non-admin actors may only pay for their own orders.
 * - The order must still be PENDING.
 * - The order must not have expired.
 * - Only one payment may exist for an order.
 * - The payment amount is always resolved from the order.
 * - The client never supplies the payment amount.
 */
export async function createNewPayment(
  data: CreatePaymentInput,
  actor: OrderActor,
): Promise<PaymentWithOrder> {
  const order = await findOrderById(data.orderId, isAdmin(actor) ? undefined : actor.accountId);

  if (!order) {
    throw new PaymentNotFoundError(data.orderId);
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new PaymentInvalidStateError(
      `Order "${order.id}" cannot be paid from its current status.`,
    );
  }

  if (order.expiresAt <= new Date()) {
    throw new PaymentInvalidStateError(
      `Order "${order.id}" has expired and can no longer be paid.`,
    );
  }

  const existingPayment = await findPaymentByOrderId(order.id);

  if (existingPayment) {
    throw new PaymentInvalidStateError(
      `Order "${order.id}" already has a payment associated with it.`,
    );
  }

  try {
    return await createPayment({
      orderId: order.id,
      provider: data.provider,
      amount: order.totalAmount,
      currency: 'ZMW',
    });
  } catch (error) {
    // The findPaymentByOrderId check above is not atomic with this create,
    // so two concurrent requests for the same order can both pass it. If
    // Payment.orderId is unique at the schema level (as this repository's
    // docs assume), the race surfaces here as a P2002 constraint violation
    // rather than ever being caught by the pre-check. Translate it to the
    // same domain error the pre-check throws, instead of leaking a raw
    // Prisma error past the service boundary.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new PaymentInvalidStateError(
        `Order "${order.id}" already has a payment associated with it.`,
      );
    }

    throw error;
  }
}

/**
 * Retrieves a payment by ID.
 *
 * Administrators may retrieve any payment.
 * Attendees may retrieve only payments belonging to their own orders.
 */
export async function getPayment(id: string, actor: OrderActor): Promise<PaymentWithOrder> {
  const payment = await getPaymentById(id);

  if (!isAdmin(actor) && payment.order.accountId !== actor.accountId) {
    throw new PaymentNotFoundError(id);
  }

  return payment;
}

/**
 * Processes a successful payment.
 *
 * The payment repository atomically guards the transition from PENDING
 * to SUCCESS. This prevents duplicate webhook deliveries from repeatedly
 * applying the same lifecycle transition.
 *
 * Order status changes are intentionally not performed here yet. Ticket
 * issuance and order finalisation will be added once the payment workflow
 * is fully designed. NOTE: until that lands, a successfully paid order's
 * status remains PENDING, which means cancelExistingOrder() can still
 * cancel it — this must be closed before this module ships.
 */
export interface PaymentCompletionResult {
  payment: PaymentWithOrder;
  order: Awaited<ReturnType<typeof markOrderPaidInTransaction>>;
  tickets: IssuedTicketWithCredential[];
}

/**
 * Completes a successful payment atomically.
 *
 * A successful payment must transition all three parts of the ticketing
 * lifecycle together:
 *
 *   Payment: PENDING → SUCCESS
 *   Order:   PENDING → PAID
 *   Tickets: not issued → issued
 *
 * If any part fails, the entire transaction rolls back.
 *
 * This endpoint is currently provider-independent. The provider reference
 * is supplied by the caller, but no provider API/webhook is assumed here.
 */
export async function markPaymentSuccessful(
  id: string,
  providerReference: string,
  actor?: OrderActor,
): Promise<PaymentCompletionResult> {
  const payment = await getPaymentById(id);

  if (actor && !isAdmin(actor) && payment.order.accountId !== actor.accountId) {
    throw new PaymentNotFoundError(id);
  }

  /*
   * A successful payment is terminal.
   *
   * Do not issue tickets again if a duplicate success request arrives.
   * The original completion already created the tickets.
   */
  if (payment.status === PaymentStatus.SUCCESS) {
    if (payment.order.status !== OrderStatus.PAID) {
      throw new PaymentInvalidStateError(
        `Payment "${id}" is successful but its order is not marked as paid.`,
      );
    }

    throw new PaymentInvalidStateError(`Payment "${id}" has already been completed.`);
  }

  if (payment.status !== PaymentStatus.PENDING) {
    throw new PaymentInvalidStateError(
      `Payment "${id}" cannot be marked successful from its current status.`,
    );
  }

  if (payment.order.status !== OrderStatus.PENDING) {
    throw new PaymentInvalidStateError(
      `Payment "${id}" cannot be completed because its order is no longer pending.`,
    );
  }

  if (payment.order.expiresAt <= new Date()) {
    throw new PaymentInvalidStateError(
      `Payment "${id}" cannot be completed because its order has expired.`,
    );
  }

  return await prisma.$transaction(async (tx) => {
    const paidAt = new Date();

    /*
     * 1. Order: PENDING → PAID
     *
     * The order transition is intentionally performed before the payment
     * transition. Order expiry uses the same lock ordering:
     *
     *   Order → Payment → Inventory
     *
     * Keeping the ordering consistent prevents the payment-completion and
     * order-expiry transactions from acquiring these rows in opposite orders.
     */
    const paidOrder = await markOrderPaidInTransaction(tx, payment.orderId, paidAt);

    /*
     * 2. Payment: PENDING → SUCCESS
     */
    const successfulPayment = await markPaymentSuccessfulInTransaction(
      tx,
      id,
      providerReference,
      paidAt,
    );

    /*
     * 3. Build ticket issuance requests from server-side order items.
     *
     * The client never supplies ticket quantities or account ownership
     * here. Everything comes from the persisted order.
     */
    const ticketRequests: IssueTicketsRequest[] = paidOrder.items.map((item) => ({
      orderItemId: item.id,
      ticketTypeId: item.ticketTypeId,
      accountId: paidOrder.accountId,
      quantity: item.quantity,
    }));

    /*
     * 4. Issue every ticket using THIS SAME transaction.
     */
    const tickets = await issueTicketsForOrderInTransaction(tx, ticketRequests);

    await createNotification(
      paymentSuccessfulNotification(successfulPayment, paidOrder.accountId),
      tx,
    );

    await createNotification(ticketsIssuedNotification(paidOrder.id, paidOrder.accountId), tx);

    return {
      payment: successfulPayment,
      order: paidOrder,
      tickets,
    };
  });
}

/**
 * Marks a pending payment as failed.
 *
 * This transition is guarded atomically at the repository layer so a
 * repeated or late provider callback cannot overwrite a terminal state.
 */

export async function markPaymentFailed(
  id: string,
  failureReason: string,
  actor: OrderActor,
): Promise<PaymentWithOrder> {
  if (!isAdmin(actor)) {
    throw new ForbiddenError();
  }

  const payment = await getPaymentById(id);

  if (payment.status === PaymentStatus.FAILED) {
    return payment;
  }

  if (payment.status !== PaymentStatus.PENDING) {
    throw new PaymentInvalidStateError(
      `Payment "${id}" cannot be marked failed from its current status.`,
    );
  }

  return await prisma.$transaction(async (tx) => {
    const failedPayment = await updatePayment(
      id,
      { status: PaymentStatus.FAILED, failureReason },
      {
        fromStatuses: [PaymentStatus.PENDING],
        client: tx,
      },
    );

    await createNotification(
      paymentFailedNotification(failedPayment, failedPayment.order.accountId),
      tx,
    );

    return failedPayment;
  });
}

/**
 * Cancels a pending payment.
 *
 * Only PENDING payments may currently be cancelled.
 */
export async function cancelPayment(id: string): Promise<PaymentWithOrder> {
  const payment = await getPaymentById(id);

  if (payment.status !== PaymentStatus.PENDING) {
    throw new PaymentInvalidStateError(
      `Payment "${id}" cannot be cancelled from its current status.`,
    );
  }

  return await updatePayment(
    id,
    { status: PaymentStatus.CANCELLED },
    { fromStatuses: [PaymentStatus.PENDING] },
  );
}
