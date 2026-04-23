import { Router } from "express";
import { db } from "@workspace/db";
import { amcContractsTable, machinesTable, hospitalsTable, serviceTasksTable } from "@workspace/db";
import { eq, and, lte, gte, ne } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import {
  CreateAmcContractBody,
  CloseAmcContractBody,
  ListAmcContractsResponse,
  GetAmcContractResponse,
  GetAmcContractParams,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();

async function generateServiceTasks(contractId: number, machineId: number, startDate: Date, endDate: Date): Promise<void> {
  const tasks = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    tasks.push({ machineId, scheduledDate: new Date(current), status: "Pending" });
    current = new Date(current);
    current.setDate(current.getDate() + 90);
  }
  if (tasks.length > 0) {
    await db.insert(serviceTasksTable).values(tasks);
    logger.info({ contractId, taskCount: tasks.length }, "Auto-generated service tasks for AMC contract");
  }
}

function buildAmcSelect() {
  return {
    id: amcContractsTable.id,
    machineId: amcContractsTable.machineId,
    contractType: amcContractsTable.contractType,
    machineSerial: machinesTable.serialNumber,
    hospitalName: hospitalsTable.name,
    startDate: amcContractsTable.startDate,
    endDate: amcContractsTable.endDate,
    contractValue: amcContractsTable.contractValue,
    paymentReceived: amcContractsTable.paymentReceived,
    status: amcContractsTable.status,
    createdAt: amcContractsTable.createdAt,
  };
}

function parseContract(c: any) {
  return {
    ...c,
    contractValue: Number(c.contractValue ?? 0),
    paymentReceived: c.paymentReceived != null ? Number(c.paymentReceived) : null,
  };
}

router.get("/amc", requireAuth, async (req, res): Promise<void> => {
  const contracts = await db
    .select(buildAmcSelect())
    .from(amcContractsTable)
    .leftJoin(machinesTable, eq(amcContractsTable.machineId, machinesTable.id))
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .orderBy(amcContractsTable.createdAt);
  res.json(ListAmcContractsResponse.parse(contracts.map(parseContract)));
});

router.post("/amc", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateAmcContractBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const now = new Date();
  const endDate = new Date(parsed.data.endDate);
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  let status = "Active";
  if (endDate < now) {
    status = "Payment Pending";
  } else if (endDate <= thirtyDaysFromNow) {
    status = "Expiring Soon";
  }

  const [contract] = await db
    .insert(amcContractsTable)
    .values({ ...parsed.data, status })
    .returning();

  await generateServiceTasks(contract.id, contract.machineId, new Date(parsed.data.startDate), endDate);

  const [full] = await db
    .select(buildAmcSelect())
    .from(amcContractsTable)
    .leftJoin(machinesTable, eq(amcContractsTable.machineId, machinesTable.id))
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .where(eq(amcContractsTable.id, contract.id));

  res.status(201).json(GetAmcContractResponse.parse(parseContract(full)));
});

router.get("/amc/expiring", requireAuth, async (req, res): Promise<void> => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const contracts = await db
    .select(buildAmcSelect())
    .from(amcContractsTable)
    .leftJoin(machinesTable, eq(amcContractsTable.machineId, machinesTable.id))
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .where(and(
      gte(amcContractsTable.endDate, now),
      lte(amcContractsTable.endDate, thirtyDaysFromNow),
    ));

  res.json(ListAmcContractsResponse.parse(contracts.map(parseContract)));
});

router.get("/amc/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetAmcContractParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [contract] = await db
    .select(buildAmcSelect())
    .from(amcContractsTable)
    .leftJoin(machinesTable, eq(amcContractsTable.machineId, machinesTable.id))
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .where(eq(amcContractsTable.id, params.data.id));

  if (!contract) {
    res.status(404).json({ error: "AMC contract not found" });
    return;
  }

  res.json(GetAmcContractResponse.parse(parseContract(contract)));
});

router.patch("/amc/:id/close", requireAuth, async (req, res): Promise<void> => {
  const params = GetAmcContractParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = CloseAmcContractBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [updated] = await db
    .update(amcContractsTable)
    .set({ status: "Closed", paymentReceived: String(body.data.paymentAmount) })
    .where(eq(amcContractsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "AMC contract not found" });
    return;
  }

  const [full] = await db
    .select(buildAmcSelect())
    .from(amcContractsTable)
    .leftJoin(machinesTable, eq(amcContractsTable.machineId, machinesTable.id))
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .where(eq(amcContractsTable.id, updated.id));

  res.json(GetAmcContractResponse.parse(parseContract(full)));
});

export default router;
