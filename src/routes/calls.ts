import { Router } from "express";
import { db } from "@workspace/db";
import { serviceCallsTable, machinesTable, engineersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import {
  CreateServiceCallBody,
  AssignServiceCallBody,
  CompleteServiceCallBody,
  CloseServiceCallBody,
} from "@workspace/api-zod";

const router = Router();

function buildCallSelect() {
  return {
    id: serviceCallsTable.id,
    ticketNumber: serviceCallsTable.ticketNumber,
    customerName: serviceCallsTable.customerName,
    customerPhone: serviceCallsTable.customerPhone,
    customerAddress: serviceCallsTable.customerAddress,
    machineId: serviceCallsTable.machineId,
    machineSerial: machinesTable.serialNumber,
    issueDescription: serviceCallsTable.issueDescription,
    engineerId: serviceCallsTable.engineerId,
    engineerName: engineersTable.name,
    status: serviceCallsTable.status,
    reportRemarks: serviceCallsTable.reportRemarks,
    reportFile: serviceCallsTable.reportFile,
    paymentReceived: serviceCallsTable.paymentReceived,
    createdAt: serviceCallsTable.createdAt,
    updatedAt: serviceCallsTable.updatedAt,
  };
}

function parseCall(c: any) {
  return {
    ...c,
    paymentReceived: c.paymentReceived != null ? Number(c.paymentReceived) : null,
  };
}

async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const [{ total }] = await db.select({ total: count() }).from(serviceCallsTable);
  const seq = String(total + 1).padStart(4, "0");
  return `SC-${year}-${seq}`;
}

async function fetchFull(id: number) {
  const [full] = await db
    .select(buildCallSelect())
    .from(serviceCallsTable)
    .leftJoin(machinesTable, eq(serviceCallsTable.machineId, machinesTable.id))
    .leftJoin(engineersTable, eq(serviceCallsTable.engineerId, engineersTable.id))
    .where(eq(serviceCallsTable.id, id));
  return full ? parseCall(full) : null;
}

router.get("/calls", requireAuth, async (req, res): Promise<void> => {
  const calls = await db
    .select(buildCallSelect())
    .from(serviceCallsTable)
    .leftJoin(machinesTable, eq(serviceCallsTable.machineId, machinesTable.id))
    .leftJoin(engineersTable, eq(serviceCallsTable.engineerId, engineersTable.id))
    .orderBy(serviceCallsTable.createdAt);
  res.json(calls.map(parseCall));
});

router.post("/calls", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateServiceCallBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const ticketNumber = await generateTicketNumber();
  const [call] = await db
    .insert(serviceCallsTable)
    .values({
      ticketNumber,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerAddress: parsed.data.customerAddress ?? null,
      machineId: parsed.data.machineId ?? null,
      issueDescription: parsed.data.issueDescription,
      status: "Open",
    })
    .returning();

  const full = await fetchFull(call.id);
  if (!full) { res.status(500).json({ error: "Failed to retrieve created call" }); return; }
  res.status(201).json(full);
});

router.get("/calls/:id", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const full = await fetchFull(id);
  if (!full) { res.status(404).json({ error: "Not found" }); return; }
  res.json(full);
});

router.patch("/calls/:id/assign", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AssignServiceCallBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await db
    .update(serviceCallsTable)
    .set({ engineerId: parsed.data.engineerId, status: "Assigned" })
    .where(eq(serviceCallsTable.id, id));
  const full = await fetchFull(id);
  if (!full) { res.status(404).json({ error: "Not found" }); return; }
  res.json(full);
});

router.post("/calls/:id/complete", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = CompleteServiceCallBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await db
    .update(serviceCallsTable)
    .set({ reportRemarks: parsed.data.remarks, reportFile: parsed.data.reportFile, status: "Resolved" })
    .where(eq(serviceCallsTable.id, id));
  const full = await fetchFull(id);
  if (!full) { res.status(404).json({ error: "Not found" }); return; }
  res.json(full);
});

router.patch("/calls/:id/close", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = CloseServiceCallBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await db
    .update(serviceCallsTable)
    .set({ paymentReceived: String(parsed.data.paymentAmount), status: "Closed" })
    .where(eq(serviceCallsTable.id, id));
  const full = await fetchFull(id);
  if (!full) { res.status(404).json({ error: "Not found" }); return; }
  res.json(full);
});

export default router;
