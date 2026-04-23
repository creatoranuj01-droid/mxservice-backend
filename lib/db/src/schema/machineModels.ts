import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const machineModelsTable = pgTable("machine_models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  manufacturer: text("manufacturer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type MachineModel = typeof machineModelsTable.$inferSelect;
