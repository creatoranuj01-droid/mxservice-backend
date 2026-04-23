import { Router } from "express";
import { db } from "@workspace/db";
import { machinesTable, amcContractsTable, serviceTasksTable, serviceCallsTable } from "@workspace/db";
import { count, sum, eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";

const router = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const [[machineCount], contractRows, serviceRows, [amcRevenue], [serviceRevenue], [callRevenue]] = await Promise.all([
    db.select({ count: count() }).from(machinesTable),
    db.select({ status: amcContractsTable.status, count: count() }).from(amcContractsTable).groupBy(amcContractsTable.status),
    db.select({ status: serviceTasksTable.status, count: count() }).from(serviceTasksTable).groupBy(serviceTasksTable.status),
    db.select({ total: sum(amcContractsTable.paymentReceived) }).from(amcContractsTable).where(eq(amcContractsTable.status, "Closed")),
    db.select({ total: sum(serviceTasksTable.paymentReceived) }).from(serviceTasksTable).where(eq(serviceTasksTable.status, "Closed")),
    db.select({ total: sum(serviceCallsTable.paymentReceived) }).from(serviceCallsTable).where(eq(serviceCallsTable.status, "Closed")),
  ]);

  const totalMachines = machineCount?.count ?? 0;

  const totalContracts = contractRows.reduce((s, r) => s + r.count, 0);
  const activeContracts = contractRows.find(r => r.status === "Active")?.count ?? 0;
  const expiringContracts = contractRows.find(r => r.status === "Expiring Soon")?.count ?? 0;
  const expiredContracts = contractRows.find(r => r.status === "Expired")?.count ?? 0;

  const pendingServices = serviceRows.find(r => r.status === "Pending")?.count ?? 0;
  const inProgressServices = serviceRows.find(r => r.status === "In Progress")?.count ?? 0;
  const completedServices = (serviceRows.find(r => r.status === "Payment Pending")?.count ?? 0) + (serviceRows.find(r => r.status === "Closed")?.count ?? 0);

  const totalRevenue = Number(amcRevenue?.total ?? 0) + Number(serviceRevenue?.total ?? 0) + Number(callRevenue?.total ?? 0);

  res.json(GetDashboardSummaryResponse.parse({
    totalMachines,
    totalContracts,
    activeContracts,
    expiringContracts,
    expiredContracts,
    pendingServices,
    inProgressServices,
    completedServices,
    totalRevenue,
  }));
});

export default router;
