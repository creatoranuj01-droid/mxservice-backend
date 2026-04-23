import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { serviceTasksTable } from "./serviceTasks";

export const serviceReportsTable = pgTable("service_reports", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => serviceTasksTable.id).unique(),
  remarks: text("remarks").notNull(),
  photos: text("photos").array().notNull().default([]),
  customerSignature: text("customer_signature"),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertServiceReportSchema = createInsertSchema(serviceReportsTable).omit({ id: true, createdAt: true });
export type InsertServiceReport = z.infer<typeof insertServiceReportSchema>;
export type ServiceReport = typeof serviceReportsTable.$inferSelect;
