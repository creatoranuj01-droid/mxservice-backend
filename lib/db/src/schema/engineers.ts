import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const engineersTable = pgTable("engineers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull().default(""),
  role: text("role").notNull().default("engineer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEngineerSchema = createInsertSchema(engineersTable).omit({ id: true, createdAt: true, updatedAt: true, passwordHash: true, role: true });
export type InsertEngineer = z.infer<typeof insertEngineerSchema>;
export type Engineer = typeof engineersTable.$inferSelect;
