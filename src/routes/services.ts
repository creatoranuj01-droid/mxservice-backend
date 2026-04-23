import { Router } from "express";
import { db } from "@workspace/db";
import { serviceTasksTable, serviceReportsTable, machinesTable, hospitalsTable, engineersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import {
  CloseServiceTaskBody,
  ListServiceTasksResponse,
  AssignServiceBody,
  AssignServiceResponse,
  CompleteServiceBody,
  CompleteServiceResponse,
  GetServiceTaskParams,
  GetServiceTaskResponse,
  GetServiceReportParams,
  GetServiceReportResponse,
} from "@workspace/api-zod";

const router = Router();

function parseTask(t: any) {
  return {
    ...t,
    paymentReceived: t.paymentReceived != null ? Number(t.paymentReceived) : null,
  };
}

function buildTaskSelect() {
  return {
    id: serviceTasksTable.id,
    machineId: serviceTasksTable.machineId,
    machineSerial: machinesTable.serialNumber,
    engineerId: serviceTasksTable.engineerId,
    engineerName: engineersTable.name,
    hospitalName: hospitalsTable.name,
    scheduledDate: serviceTasksTable.scheduledDate,
    status: serviceTasksTable.status,
    paymentReceived: serviceTasksTable.paymentReceived,
    createdAt: serviceTasksTable.createdAt,
  };
}

router.get("/services", requireAuth, async (req, res): Promise<void> => {
  const tasks = await db
    .select(buildTaskSelect())
    .from(serviceTasksTable)
    .leftJoin(machinesTable, eq(serviceTasksTable.machineId, machinesTable.id))
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .leftJoin(engineersTable, eq(serviceTasksTable.engineerId, engineersTable.id))
    .orderBy(serviceTasksTable.scheduledDate);
  res.json(ListServiceTasksResponse.parse(tasks.map(parseTask)));
});

router.get("/services/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetServiceTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [task] = await db
    .select(buildTaskSelect())
    .from(serviceTasksTable)
    .leftJoin(machinesTable, eq(serviceTasksTable.machineId, machinesTable.id))
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .leftJoin(engineersTable, eq(serviceTasksTable.engineerId, engineersTable.id))
    .where(eq(serviceTasksTable.id, params.data.id));
  if (!task) {
    res.status(404).json({ error: "Service task not found" });
    return;
  }
  res.json(GetServiceTaskResponse.parse(parseTask(task)));
});

router.post("/services/assign", requireAuth, async (req, res): Promise<void> => {
  const parsed = AssignServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [task] = await db
    .update(serviceTasksTable)
    .set({ engineerId: parsed.data.engineerId, status: "In Progress" })
    .where(eq(serviceTasksTable.id, parsed.data.taskId))
    .returning();
  if (!task) {
    res.status(404).json({ error: "Service task not found" });
    return;
  }
  const [full] = await db
    .select(buildTaskSelect())
    .from(serviceTasksTable)
    .leftJoin(machinesTable, eq(serviceTasksTable.machineId, machinesTable.id))
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .leftJoin(engineersTable, eq(serviceTasksTable.engineerId, engineersTable.id))
    .where(eq(serviceTasksTable.id, task.id));
  res.json(AssignServiceResponse.parse(parseTask(full)));
});

router.post("/services/complete", requireAuth, async (req, res): Promise<void> => {
  const parsed = CompleteServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [task] = await db
    .update(serviceTasksTable)
    .set({ status: "Payment Pending" })
    .where(eq(serviceTasksTable.id, parsed.data.taskId))
    .returning();

  if (!task) {
    res.status(404).json({ error: "Service task not found" });
    return;
  }

  const [report] = await db
    .insert(serviceReportsTable)
    .values({
      taskId: parsed.data.taskId,
      remarks: parsed.data.remarks,
      photos: parsed.data.photos ?? [],
      customerSignature: parsed.data.customerSignature ?? null,
      completedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: serviceReportsTable.taskId,
      set: {
        remarks: parsed.data.remarks,
        photos: parsed.data.photos ?? [],
        customerSignature: parsed.data.customerSignature ?? null,
        completedAt: new Date(),
      },
    })
    .returning();

  res.json(CompleteServiceResponse.parse(report));
});

router.patch("/services/:id/close", requireAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid service task id" });
    return;
  }
  const body = CloseServiceTaskBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [updated] = await db
    .update(serviceTasksTable)
    .set({ status: "Closed", paymentReceived: String(body.data.paymentAmount) })
    .where(eq(serviceTasksTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Service task not found" });
    return;
  }
  const [full] = await db
    .select(buildTaskSelect())
    .from(serviceTasksTable)
    .leftJoin(machinesTable, eq(serviceTasksTable.machineId, machinesTable.id))
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .leftJoin(engineersTable, eq(serviceTasksTable.engineerId, engineersTable.id))
    .where(eq(serviceTasksTable.id, updated.id));
  res.json(GetServiceTaskResponse.parse(parseTask(full)));
});

router.get("/reports/:taskId", requireAuth, async (req, res): Promise<void> => {
  const params = GetServiceReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [report] = await db
    .select()
    .from(serviceReportsTable)
    .where(eq(serviceReportsTable.taskId, params.data.taskId));
  if (!report) {
    res.status(404).json({ error: "Service report not found" });
    return;
  }
  res.json(GetServiceReportResponse.parse(report));
});

export default router;
