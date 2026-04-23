import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { machinesTable } from "./machines";
import { engineersTable } from "./engineers";

export const serviceCallsTable = pgTable("service_calls", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address"),
  machineId: integer("machine_id").references(() => machinesTable.id),
  issueDescription: text("issue_description").notNull(),
  engineerId: integer("engineer_id").references(() => engineersTable.id),
  status: text("status").notNull().default("Open"),
  reportRemarks: text("report_remarks"),
  reportFile: text("report_file"),
  paymentReceived: numeric("payment_received", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type ServiceCall = typeof serviceCallsTable.$inferSelect;
