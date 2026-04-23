import { Router } from "express";
import { db } from "@workspace/db";
import { adminsTable, engineersTable } from "@workspace/db";
import { eq, ne } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import { hashPassword } from "../lib/jwt";

const router = Router();

// List all users
router.get("/admin/users", requireAdmin, async (req, res): Promise<void> => {
  const admins = await db
    .select({ id: adminsTable.id, name: adminsTable.name, email: adminsTable.email, role: adminsTable.role, createdAt: adminsTable.createdAt })
    .from(adminsTable)
    .orderBy(adminsTable.createdAt);

  const engineers = await db
    .select({ id: engineersTable.id, name: engineersTable.name, email: engineersTable.email, phone: engineersTable.phone, role: engineersTable.role, createdAt: engineersTable.createdAt })
    .from(engineersTable)
    .orderBy(engineersTable.createdAt);

  res.json({ admins, engineers });
});

// Create user
router.post("/admin/users", requireAdmin, async (req, res): Promise<void> => {
  const { type, name, email, password, phone } = req.body;

  if (!type || !name?.trim() || !email?.trim() || !password?.trim()) {
    res.status(400).json({ error: "type, name, email, and password are required" });
    return;
  }
  if (!["operator", "engineer"].includes(type)) {
    res.status(400).json({ error: "type must be 'operator' or 'engineer'" });
    return;
  }

  const passwordHash = hashPassword(password);

  try {
    if (type === "operator") {
      const [created] = await db
        .insert(adminsTable)
        .values({ name: name.trim(), email: email.trim().toLowerCase(), passwordHash, role: "operator" })
        .returning({ id: adminsTable.id, name: adminsTable.name, email: adminsTable.email, role: adminsTable.role, createdAt: adminsTable.createdAt });
      res.status(201).json(created);
    } else {
      if (!phone?.trim()) {
        res.status(400).json({ error: "phone is required for engineers" });
        return;
      }
      const [created] = await db
        .insert(engineersTable)
        .values({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), passwordHash, role: "engineer" })
        .returning({ id: engineersTable.id, name: engineersTable.name, email: engineersTable.email, phone: engineersTable.phone, role: engineersTable.role, createdAt: engineersTable.createdAt });
      res.status(201).json(created);
    }
  } catch (e: any) {
    if (e?.code === "23505") {
      res.status(409).json({ error: "A user with this email already exists" });
    } else {
      res.status(500).json({ error: "Failed to create user" });
    }
  }
});

// Update user (name + optional password reset)
router.patch("/admin/users/:type/:id", requireAdmin, async (req, res): Promise<void> => {
  const { type, id } = req.params;
  const numId = Number(id);
  if (isNaN(numId)) { res.status(400).json({ error: "Invalid id" }); return; }
  if (!["admin", "operator", "engineer"].includes(type)) { res.status(400).json({ error: "Invalid type" }); return; }

  const { name, password } = req.body;
  if (!name?.trim()) { res.status(400).json({ error: "name is required" }); return; }

  const updates: Record<string, any> = { name: name.trim() };
  if (password?.trim()) updates.passwordHash = hashPassword(password.trim());

  if (type === "engineer") {
    const [updated] = await db
      .update(engineersTable)
      .set(updates)
      .where(eq(engineersTable.id, numId))
      .returning({ id: engineersTable.id, name: engineersTable.name, email: engineersTable.email, phone: engineersTable.phone, role: engineersTable.role });
    if (!updated) { res.status(404).json({ error: "User not found" }); return; }
    res.json(updated);
  } else {
    const [updated] = await db
      .update(adminsTable)
      .set(updates)
      .where(eq(adminsTable.id, numId))
      .returning({ id: adminsTable.id, name: adminsTable.name, email: adminsTable.email, role: adminsTable.role });
    if (!updated) { res.status(404).json({ error: "User not found" }); return; }
    res.json(updated);
  }
});

// Delete user
router.delete("/admin/users/:type/:id", requireAdmin, async (req, res): Promise<void> => {
  const { type, id } = req.params;
  const numId = Number(id);
  if (isNaN(numId)) { res.status(400).json({ error: "Invalid id" }); return; }

  if (type === "engineer") {
    await db.delete(engineersTable).where(eq(engineersTable.id, numId));
    res.status(204).send();
    return;
  }

  // For admins/operators — prevent deleting the last admin
  if (type === "admin") {
    const remaining = await db.select({ id: adminsTable.id }).from(adminsTable).where(ne(adminsTable.id, numId));
    const otherAdmins = remaining.filter(a => a.id !== numId);
    // Count actual admins (not operators)
    const allAdmins = await db.select({ id: adminsTable.id, role: adminsTable.role }).from(adminsTable);
    const adminCount = allAdmins.filter(a => a.role === "admin").length;
    if (adminCount <= 1 && allAdmins.find(a => a.id === numId)?.role === "admin") {
      res.status(400).json({ error: "Cannot delete the last admin account" });
      return;
    }
  }

  await db.delete(adminsTable).where(eq(adminsTable.id, numId));
  res.status(204).send();
});

export default router;
