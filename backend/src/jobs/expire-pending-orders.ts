import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import {
  expireOrderInTransaction,
  findExpiredPendingOrderIds,
} from '../repositories/order.repository.js';

async function expirePendingOrders(): Promise<void> {
  const startedAt = Date.now();
  const failedOrderIds = new Set<string>();

  let processedCount = 0;
  let expiredCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  const isOutOfTime = (): boolean => Date.now() - startedAt >= env.ORDER_EXPIRY_MAX_RUNTIME_MS;

  try {
    while (!isOutOfTime()) {
      const now = new Date();

      // Failed orders are excluded in the query itself, so they can never
      // occupy batch slots and starve healthy expired orders behind them.
      const candidateIds = await findExpiredPendingOrderIds(now, env.ORDER_EXPIRY_BATCH_SIZE, [
        ...failedOrderIds,
      ]);

      if (candidateIds.length === 0) {
        break;
      }

      // Every attempted order leaves the candidate set (expired or skipped)
      // or joins failedOrderIds, so each loop iteration makes progress and
      // the loop ends when no candidates remain or the runtime cap is hit.
      for (const orderId of candidateIds) {
        if (isOutOfTime()) {
          break;
        }

        processedCount += 1;

        try {
          const expiredOrder = await expireOrderInTransaction(orderId, now);

          if (expiredOrder) {
            expiredCount += 1;
          } else {
            // Another worker, a payment or a cancellation got there first.
            skippedCount += 1;
          }
        } catch (error) {
          failedCount += 1;
          failedOrderIds.add(orderId);

          console.error(`Failed to expire order "${orderId}".`, error);
        }
      }
    }

    console.info(
      [
        'Pending-order expiry job completed.',
        `Processed: ${processedCount}`,
        `Expired: ${expiredCount}`,
        `Skipped: ${skippedCount}`,
        `Failed: ${failedCount}`,
        `Runtime: ${Date.now() - startedAt}ms`,
      ].join(' '),
    );

    if (failedCount > 0) {
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

try {
  await expirePendingOrders();
} catch (error) {
  console.error('Pending-order expiry job failed.', error);
  process.exitCode = 1;
}
