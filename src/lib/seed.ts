import { db } from "@workspace/db";
import {
  adminsTable,
  hospitalsTable,
  machinesTable,
  engineersTable,
  amcContractsTable,
  serviceTasksTable,
} from "@workspace/db";
import { hashPassword } from "./jwt";
import { logger } from "./logger";
import { count } from "drizzle-orm";

export async function seedDatabase(): Promise<void> {
  const [{ count: adminCount }] = await db.select({ count: count() }).from(adminsTable);
  if (adminCount > 0) {
    logger.info("Database already seeded, skipping");
    return;
  }

  logger.info("Seeding database...");

  await db.insert(adminsTable).values({
    name: "Admin User",
    email: "admin@amxservicehub.com",
    passwordHash: hashPassword("admin123"),
    role: "admin",
  });

  const [hospital1, hospital2] = await db
    .insert(hospitalsTable)
    .values([
      { name: "City General Hospital", address: "123 Main Street, Mumbai, MH 400001", contactPerson: "Dr. Priya Sharma", phone: "+91-22-1234-5678", email: "priya.sharma@citygeneral.in" },
      { name: "Metro Medical Centre", address: "456 Park Avenue, Delhi, DL 110001", contactPerson: "Dr. Rajesh Kumar", phone: "+91-11-9876-5432", email: "rajesh.kumar@metromedical.in" },
    ])
    .returning();

  const [m1, m2, m3, m4, m5] = await db
    .insert(machinesTable)
    .values([
      { serialNumber: "XRAY-2021-001", hospitalId: hospital1.id, installDate: new Date("2021-03-15"), warrantyEndDate: new Date("2024-03-15"), status: "Active" },
      { serialNumber: "XRAY-2021-002", hospitalId: hospital1.id, installDate: new Date("2021-06-10"), warrantyEndDate: new Date("2024-06-10"), status: "Active" },
      { serialNumber: "XRAY-2022-003", hospitalId: hospital2.id, installDate: new Date("2022-01-20"), warrantyEndDate: new Date("2025-01-20"), status: "Active" },
      { serialNumber: "XRAY-2022-004", hospitalId: hospital2.id, installDate: new Date("2022-09-05"), warrantyEndDate: new Date("2025-09-05"), status: "Under Maintenance" },
      { serialNumber: "XRAY-2023-005", hospitalId: hospital1.id, installDate: new Date("2023-04-01"), warrantyEndDate: new Date("2026-04-01"), status: "Active" },
    ])
    .returning();

  const pw = hashPassword("engineer123");
  const [eng1, eng2] = await db
    .insert(engineersTable)
    .values([
      { name: "Suresh Patel", phone: "+91-98765-43210", email: "suresh@amxservicehub.com", passwordHash: pw, role: "engineer" },
      { name: "Anil Verma", phone: "+91-87654-32109", email: "anil@amxservicehub.com", passwordHash: pw, role: "engineer" },
    ])
    .returning();

  const now = new Date();
  const twoYearsAgo = new Date(now);
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const oneYearFromNow = new Date(now);
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const thirtyFiveDaysFromNow = new Date(now);
  thirtyFiveDaysFromNow.setDate(thirtyFiveDaysFromNow.getDate() + 35);
  const twentyDaysFromNow = new Date(now);
  twentyDaysFromNow.setDate(twentyDaysFromNow.getDate() + 20);

  await db.insert(amcContractsTable).values([
    { machineId: m1.id, startDate: twoYearsAgo, endDate: oneYearFromNow, contractValue: "125000.00", status: "Active" },
    { machineId: m3.id, startDate: twoYearsAgo, endDate: twentyDaysFromNow, contractValue: "98000.00", status: "Expiring Soon" },
  ]);

  const pendingDate1 = new Date(now);
  pendingDate1.setDate(pendingDate1.getDate() + 15);
  const pendingDate2 = new Date(now);
  pendingDate2.setDate(pendingDate2.getDate() + 45);
  const pastDate = new Date(now);
  pastDate.setDate(pastDate.getDate() - 10);

  await db.insert(serviceTasksTable).values([
    { machineId: m1.id, engineerId: eng1.id, scheduledDate: pendingDate1, status: "Pending" },
    { machineId: m2.id, engineerId: eng2.id, scheduledDate: pastDate, status: "In Progress" },
    { machineId: m3.id, scheduledDate: pendingDate2, status: "Pending" },
    { machineId: m4.id, engineerId: eng1.id, scheduledDate: pastDate, status: "Payment Pending" },
    { machineId: m5.id, scheduledDate: pendingDate1, status: "Pending" },
  ]);

  logger.info("Database seeded successfully");
}
