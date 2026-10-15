import { PaymentStatus } from '../generated/prisma/enums.js';
import type { Order, Payment, PaymentProvider, Prisma } from '../generated/prisma/client.js';

import { prisma } from '../lib/prisma.js';
import { PaymentInvalidStateError, PaymentNotFoundError } from '../shared/errors/payment.errors.js';

export type PrismaTransactionClient = Prisma.TransactionClient;

export interface CreatePaymentData {
  orderId: string;
  provider: PaymentProvider;
  amount: Prisma.Decimal | string;
  currency: string;
  providerReference?: string | null;
}

export interface UpdatePaymentData {
  status?: PaymentStatus;
  providerReference?: string | null;
  failureReason?: string | null;
  paidAt?: Date | null;
}

export interface PaymentWithOrder extends Payment {
  order: Order;
}

/**
 * Creates a payment associated with an order.
 *
 * The repository receives server-resolved payment values. It does not
 * determine whether the order is payable or whether the caller owns it.
 * Those decisions belong to the service layer.
 */
export async function createPayment(data: CreatePaymentData): Promise<PaymentWithOrder> {
  return await prisma.payment.create({
    data: {
      orderId: data.orderId,
      provider: data.provider,
      amount: data.amount,
      currency: data.currency,
      ...(data.providerReference !== undefined
        ? { providerReference: data.providerReference }
        : {}),
    },
    include: {
      order: true,
    },
  });
}

/**
 * Finds a payment by its primary identifier.
 *
 * Returns null when no payment exists.
 */
export async function findPaymentById(id: string): Promise<PaymentWithOrder | null> {
  return await prisma.payment.findUnique({
    where: { id },
    include: { order: true },
  });
}

/**
 * Finds a payment by its provider reference.
 *
 * This is used by payment callbacks/webhooks to locate the payment
 * transaction associated with a provider-side reference.
 */
export async function findPaymentByProviderReference(
  providerReference: string,
): Promise<PaymentWithOrder | null> {
  return await prisma.payment.findUnique({
    where: { providerReference },
    include: { order: true },
  });
}

/**
 * Finds the payment belonging to an order.
 *
 * Order.payment is one-to-one in the current MVP schema, so orderId is
 * unique and findUnique() is appropriate here.
 */
export async function findPaymentByOrderId(orderId: string): Promise<PaymentWithOrder | null> {
  return await prisma.payment.findUnique({
    where: { orderId },
    include: { order: true },
  });
}

/**
 * Finds a payment by ID or throws the standard payment not-found error.
 */
export async function getPaymentById(id: string): Promise<PaymentWithOrder> {
  const payment = await findPaymentById(id);

  if (!payment) {
    throw new PaymentNotFoundError(id);
  }

  return payment;
}

/**
 * Updates payment metadata and lifecycle state, atomically guarded against
 * invalid status transitions.
 *
 * `updateMany` (rather than `update`) is used deliberately, mirroring the
 * order repository's `updateOrderStatus`: Prisma's `update()` only accepts
 * unique fields in `where`, so it cannot express "and only if the payment
 * is still in an expected status." This matters even more here than for
 * orders, because payment-status changes are typically driven by webhook
 * callbacks, which providers can and do retry or deliver more than once.
 * Guarding the transition atomically prevents a duplicate/late webhook
 * delivery from silently re-applying a status change (and any side effects
 * the service layer attaches to it, like ticket issuance).
 *
 * `fromStatuses`, when supplied, restricts the update to rows currently in
 * one of those statuses (e.g. only a PENDING payment may become PAID).
 * Callers that don't need transition safety (e.g. patching only
 * `providerReference` before a status exists) can omit it.
 *
 * A zero-row result is disambiguated with a follow-up read: it means either
 * the payment doesn't exist (404) or it exists but wasn't in an eligible
 * status for this transition (409) — those need different responses, and
 * collapsing them into one error would misreport a real state conflict as
 * a missing resource.
 */

export async function updatePayment(
  id: string,
  data: UpdatePaymentData,
  options?: {
    fromStatuses?: PaymentStatus[];
    client?: PrismaTransactionClient;
  },
): Promise<PaymentWithOrder> {
  const { fromStatuses, client } = options ?? {};
  const db = client ?? prisma;

  const result = await db.payment.updateMany({
    where: {
      id,
      ...(fromStatuses !== undefined ? { status: { in: fromStatuses } } : {}),
    },
    data: {
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.providerReference !== undefined
        ? { providerReference: data.providerReference }
        : {}),
      ...(data.failureReason !== undefined ? { failureReason: data.failureReason } : {}),
      ...(data.paidAt !== undefined ? { paidAt: data.paidAt } : {}),
    },
  });

  if (result.count === 0) {
    const existing = await db.payment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!existing) {
      throw new PaymentNotFoundError(id);
    }

    throw new PaymentInvalidStateError(
      `Payment "${id}" cannot be updated from its current status.`,
    );
  }

  return await db.payment.findUniqueOrThrow({
    where: { id },
    include: { order: true },
  });
}

/**
 * Atomically marks a payment as successful using an existing transaction.
 *
 * This is intentionally separate from updatePayment(): successful payment
 * completion is part of the larger payment → order → ticket workflow and
 * therefore must execute using the caller's transaction client.
 */
export async function markPaymentSuccessfulInTransaction(
  tx: PrismaTransactionClient,
  id: string,
  providerReference: string,
  paidAt: Date,
): Promise<PaymentWithOrder> {
  const result = await tx.payment.updateMany({
    where: {
      id,
      status: PaymentStatus.PENDING,
    },
    data: {
      status: PaymentStatus.SUCCESS,
      providerReference,
      paidAt,
    },
  });

  if (result.count === 0) {
    const existing = await tx.payment.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });

    if (!existing) {
      throw new PaymentNotFoundError(id);
    }

    throw new PaymentInvalidStateError(
      `Payment "${id}" cannot be marked successful from its current status.`,
    );
  }

  return await tx.payment.findUniqueOrThrow({
    where: { id },
    include: {
      order: true,
    },
  });
}

/**
 * Atomically cancels a pending payment belonging to an order.
 *
 * No error is raised when the order has no payment or when its payment is
 * already in a terminal state. This makes the operation safe for order
 * cancellation and expiry, both of which may legitimately occur before a
 * payment is created or after another process has already finalized it.
 */
export async function cancelPendingPaymentByOrderIdInTransaction(
  tx: PrismaTransactionClient,
  orderId: string,
): Promise<void> {
  await tx.payment.updateMany({
    where: {
      orderId,
      status: PaymentStatus.PENDING,
    },
    data: {
      status: PaymentStatus.CANCELLED,
    },
  });
}

/**
 * Atomically cancels a pending payment using an existing transaction.
 *
 * This is used by order expiry. The payment transition participates in the
 * same transaction as the order expiry and inventory release, so an order
 * cannot commit as EXPIRED while its pending payment remains PENDING.
 */
export async function cancelPaymentInTransaction(
  tx: PrismaTransactionClient,
  id: string,
): Promise<PaymentWithOrder> {
  const result = await tx.payment.updateMany({
    where: {
      id,
      status: PaymentStatus.PENDING,
    },
    data: {
      status: PaymentStatus.CANCELLED,
    },
  });

  if (result.count === 0) {
    const existing = await tx.payment.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });

    if (!existing) {
      throw new PaymentNotFoundError(id);
    }

    throw new PaymentInvalidStateError(
      `Payment "${id}" cannot be cancelled from its current status.`,
    );
  }

  return await tx.payment.findUniqueOrThrow({
    where: { id },
    include: {
      order: true,
    },
  });
}
