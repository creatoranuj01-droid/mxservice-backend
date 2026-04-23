import { Router } from "express";
import { db } from "@workspace/db";
import { hospitalsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import {
  CreateHospitalBody,
  UpdateHospitalBody,
  ListHospitalsResponse,
  GetHospitalResponse,
  GetHospitalParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/hospitals", requireAuth, async (req, res): Promise<void> => {
  const hospitals = await db.select().from(hospitalsTable).orderBy(hospitalsTable.createdAt);
  res.json(ListHospitalsResponse.parse(hospitals));
});

router.post("/hospitals", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateHospitalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [hospital] = await db.insert(hospitalsTable).values(parsed.data).returning();
  res.status(201).json(GetHospitalResponse.parse(hospital));
});

router.get("/hospitals/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetHospitalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [hospital] = await db.select().from(hospitalsTable).where(eq(hospitalsTable.id, params.data.id));
  if (!hospital) {
    res.status(404).json({ error: "Hospital not found" });
    return;
  }
  res.json(GetHospitalResponse.parse(hospital));
});

router.patch("/hospitals/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = GetHospitalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateHospitalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(hospitalsTable)
    .set(parsed.data)
    .where(eq(hospitalsTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Hospital not found" });
    return;
  }
  res.json(GetHospitalResponse.parse(updated));
});

export default router;
