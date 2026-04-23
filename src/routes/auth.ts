import { Router } from "express";
import { db } from "@workspace/db";
import { adminsTable, engineersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { signJwt, hashPassword } from "../lib/jwt";
import { LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const hashedPw = hashPassword(password);

  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.email, email));
  if (admin && admin.passwordHash === hashedPw) {
    const token = signJwt({ id: admin.id, email: admin.email, name: admin.name, role: admin.role });
    res.json({
      token,
      user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    });
    return;
  }

  const [engineer] = await db.select().from(engineersTable).where(eq(engineersTable.email, email));
  if (engineer && engineer.passwordHash === hashedPw) {
    const token = signJwt({ id: engineer.id, email: engineer.email, name: engineer.name, role: engineer.role });
    res.json({
      token,
      user: { id: engineer.id, email: engineer.email, name: engineer.name, role: engineer.role },
    });
    return;
  }

  res.status(401).json({ error: "Invalid email or password" });
});

export default router;
