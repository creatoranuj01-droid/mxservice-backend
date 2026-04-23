import { Router } from "express";
import { db } from "@workspace/db";
import { machineModelsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

const parseModel = (m: any) => ({ ...m });

router.get("/machine-models", async (req, res): Promise<void> => {
  const models = await db
    .select()
    .from(machineModelsTable)
    .orderBy(machineModelsTable.name);
  res.json(models.map(parseModel));
});

router.post("/machine-models", requireAdmin, async (req, res): Promise<void> => {
  const { name, manufacturer } = req.body;
  if (!name?.trim()) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  try {
    const [model] = await db
      .insert(machineModelsTable)
      .values({ name: name.trim(), manufacturer: manufacturer?.trim() || null })
      .returning();
    res.status(201).json(parseModel(model));
  } catch (e: any) {
    if (e?.code === "23505") {
      res.status(409).json({ error: "A model with this name already exists" });
    } else {
      res.status(500).json({ error: "Failed to create model" });
    }
  }
});

router.patch("/machine-models/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { name, manufacturer } = req.body;
  if (!name?.trim()) { res.status(400).json({ error: "Name is required" }); return; }
  try {
    const [updated] = await db
      .update(machineModelsTable)
      .set({ name: name.trim(), manufacturer: manufacturer?.trim() || null })
      .where(eq(machineModelsTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Model not found" }); return; }
    res.json(parseModel(updated));
  } catch (e: any) {
    if (e?.code === "23505") {
      res.status(409).json({ error: "A model with this name already exists" });
    } else {
      res.status(500).json({ error: "Failed to update model" });
    }
  }
});

router.delete("/machine-models/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(machineModelsTable).where(eq(machineModelsTable.id, id));
  res.status(204).send();
});

export default router;
