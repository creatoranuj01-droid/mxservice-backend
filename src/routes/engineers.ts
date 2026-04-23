import { Router } from "express";
import { db } from "@workspace/db";
import { engineersTable } from "@workspace/db";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import {
  CreateEngineerBody,
  UpdateEngineerBody,
  ListEngineersResponse,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/jwt";

const router = Router();

router.get("/engineers", requireAuth, async (req, res): Promise<void> => {
  const engineers = await db
    .select({
      id: engineersTable.id,
      name: engineersTable.name,
      phone: engineersTable.phone,
      email: engineersTable.email,
      createdAt: engineersTable.createdAt,
    })
    .from(engineersTable)
    .orderBy(engineersTable.createdAt);
  res.json(ListEngineersResponse.parse(engineers));
});

router.post("/engineers", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateEngineerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const defaultPassword = hashPassword("engineer123");
  const [engineer] = await db
    .insert(engineersTable)
    .values({ ...parsed.data, passwordHash: defaultPassword, role: "engineer" })
    .returning();
  res.status(201).json({
    id: engineer.id,
    name: engineer.name,
    phone: engineer.phone,
    email: engineer.email,
    createdAt: engineer.createdAt,
  });
});

router.patch("/engineers/:id", requireAdmin, async (req, res): Promise<void> => {
  const idParam = { id: Number(req.params.id) };
  if (isNaN(idParam.id)) {
    res.status(400).json({ error: "Invalid engineer id" });
    return;
  }
  const parsed = UpdateEngineerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(engineersTable)
    .set(parsed.data)
    .where(eq(engineersTable.id, idParam.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Engineer not found" });
    return;
  }
  res.json({
    id: updated.id,
    name: updated.name,
    phone: updated.phone,
    email: updated.email,
    createdAt: updated.createdAt,
  });
});

export default router;
