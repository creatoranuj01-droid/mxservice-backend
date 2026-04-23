import { db } from "@workspace/db";
import { amcContractsTable } from "@workspace/db";
import { and, lte, gte, ne } from "drizzle-orm";
import { logger } from "./logger";

async function runAmcExpiryCheck(): Promise<void> {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringSoon = await db
    .update(amcContractsTable)
    .set({ status: "Expiring Soon" })
    .where(
      and(
        gte(amcContractsTable.endDate, now),
        lte(amcContractsTable.endDate, thirtyDaysFromNow),
        ne(amcContractsTable.status, "Expiring Soon"),
      ),
    )
    .returning({ id: amcContractsTable.id });

  const paymentPending = await db
    .update(amcContractsTable)
    .set({ status: "Payment Pending" })
    .where(
      and(
        lte(amcContractsTable.endDate, now),
        ne(amcContractsTable.status, "Payment Pending"),
        ne(amcContractsTable.status, "Closed"),
      ),
    )
    .returning({ id: amcContractsTable.id });

  if (expiringSoon.length > 0) {
    logger.info({ count: expiringSoon.length, ids: expiringSoon.map(c => c.id) }, "AMC contracts marked as Expiring Soon");
  }
  if (paymentPending.length > 0) {
    logger.info({ count: paymentPending.length, ids: paymentPending.map(c => c.id) }, "AMC contracts marked as Payment Pending");
  }
}

export function startCronJobs(): void {
  const INTERVAL_MS = 24 * 60 * 60 * 1000;

  runAmcExpiryCheck().catch((err) => {
    logger.error({ err }, "Initial AMC expiry check failed");
  });

  setInterval(() => {
    runAmcExpiryCheck().catch((err) => {
      logger.error({ err }, "AMC expiry check failed");
    });
  }, INTERVAL_MS);

  logger.info("AMC expiry cron job started (runs every 24h)");
}
