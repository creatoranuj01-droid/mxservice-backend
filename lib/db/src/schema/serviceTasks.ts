import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { machinesTable } from "./machines";
import { engineersTable } from "./engineers";

export const serviceTasksTable = pgTable("service_tasks", {
  id: serial("id").primaryKey(),
  machineId: integer("machine_id").notNull().references(() => machinesTable.id),
  engineerId: integer("engineer_id").references(() => engineersTable.id),
  scheduledDate: timestamp("scheduled_date", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("Pending"),
  paymentReceived: numeric("payment_received", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertServiceTaskSchema = createInsertSchema(serviceTasksTable).omit({ id: true, createdAt: true, updatedAt: true, status: true, engineerId: true });
export type InsertServiceTask = z.infer<typeof insertServiceTaskSchema>;
export type ServiceTask = typeof serviceTasksTable.$inferSelect;
