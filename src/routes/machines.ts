import { Router } from "express";
import { db } from "@workspace/db";
import { machinesTable, hospitalsTable, machineModelsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import {
  CreateMachineBody,
  UpdateMachineBody,
  ListMachinesResponse,
  GetMachineResponse,
  GetMachineParams,
} from "@workspace/api-zod";

const router = Router();

function buildMachineSelect() {
  return {
    id: machinesTable.id,
    serialNumber: machinesTable.serialNumber,
    hospitalId: machinesTable.hospitalId,
    hospitalName: hospitalsTable.name,
    modelId: machinesTable.modelId,
    modelName: machineModelsTable.name,
    installDate: machinesTable.installDate,
    warrantyEndDate: machinesTable.warrantyEndDate,
    status: machinesTable.status,
    createdAt: machinesTable.createdAt,
  };
}

router.get("/machines", requireAuth, async (req, res): Promise<void> => {
  const machines = await db
    .select(buildMachineSelect())
    .from(machinesTable)
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .leftJoin(machineModelsTable, eq(machinesTable.modelId, machineModelsTable.id))
    .orderBy(machinesTable.createdAt);
  res.json(ListMachinesResponse.parse(machines));
});

router.post("/machines", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateMachineBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [machine] = await db.insert(machinesTable).values(parsed.data).returning();
  const [row] = await db
    .select(buildMachineSelect())
    .from(machinesTable)
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .leftJoin(machineModelsTable, eq(machinesTable.modelId, machineModelsTable.id))
    .where(eq(machinesTable.id, machine.id));
  res.status(201).json(GetMachineResponse.parse(row));
});

router.get("/machines/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetMachineParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [machine] = await db
    .select(buildMachineSelect())
    .from(machinesTable)
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .leftJoin(machineModelsTable, eq(machinesTable.modelId, machineModelsTable.id))
    .where(eq(machinesTable.id, params.data.id));
  if (!machine) {
    res.status(404).json({ error: "Machine not found" });
    return;
  }
  res.json(GetMachineResponse.parse(machine));
});

router.patch("/machines/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = GetMachineParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateMachineBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(machinesTable)
    .set(parsed.data)
    .where(eq(machinesTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Machine not found" });
    return;
  }
  const [row] = await db
    .select(buildMachineSelect())
    .from(machinesTable)
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .leftJoin(machineModelsTable, eq(machinesTable.modelId, machineModelsTable.id))
    .where(eq(machinesTable.id, updated.id));
  res.json(GetMachineResponse.parse(row));
});

export default router;
