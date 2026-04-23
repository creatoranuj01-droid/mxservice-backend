import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { machinesTable } from "./machines";

export const amcContractsTable = pgTable("amc_contracts", {
  id: serial("id").primaryKey(),
  machineId: integer("machine_id").notNull().references(() => machinesTable.id),
  contractType: text("contract_type").notNull().default("AMC"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  contractValue: numeric("contract_value", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("Active"),
  paymentReceived: numeric("payment_received", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAmcContractSchema = createInsertSchema(amcContractsTable).omit({ id: true, createdAt: true, updatedAt: true, status: true });
export type InsertAmcContract = z.infer<typeof insertAmcContractSchema>;
export type AmcContract = typeof amcContractsTable.$inferSelect;
