import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hospitalsTable } from "./hospitals";
import { machineModelsTable } from "./machineModels";

export const machinesTable = pgTable("machines", {
  id: serial("id").primaryKey(),
  serialNumber: text("serial_number").notNull().unique(),
  hospitalId: integer("hospital_id").notNull().references(() => hospitalsTable.id),
  modelId: integer("model_id").references(() => machineModelsTable.id),
  installDate: timestamp("install_date", { withTimezone: true }).notNull(),
  warrantyEndDate: timestamp("warranty_end_date", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMachineSchema = createInsertSchema(machinesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMachine = z.infer<typeof insertMachineSchema>;
export type Machine = typeof machinesTable.$inferSelect;
