import { Router } from "express";
import { db } from "@workspace/db";
import { invoicesTable, amcContractsTable, machinesTable, hospitalsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import {
  GenerateInvoiceBody,
  ListInvoicesResponse,
  ListInvoicesResponseItem,
  MarkInvoicePaidParams,
  MarkInvoicePaidResponse,
} from "@workspace/api-zod";

const router = Router();

function buildInvoiceSelect() {
  return {
    id: invoicesTable.id,
    contractId: invoicesTable.contractId,
    machineSerial: machinesTable.serialNumber,
    hospitalName: hospitalsTable.name,
    amount: invoicesTable.amount,
    status: invoicesTable.status,
    generatedDate: invoicesTable.generatedDate,
  };
}

router.get("/invoices", requireAuth, async (req, res): Promise<void> => {
  const invoices = await db
    .select(buildInvoiceSelect())
    .from(invoicesTable)
    .leftJoin(amcContractsTable, eq(invoicesTable.contractId, amcContractsTable.id))
    .leftJoin(machinesTable, eq(amcContractsTable.machineId, machinesTable.id))
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .orderBy(invoicesTable.generatedDate);
  res.json(ListInvoicesResponse.parse(invoices.map(i => ({ ...i, amount: Number(i.amount) }))));
});

router.post("/invoices/generate", requireAuth, async (req, res): Promise<void> => {
  const parsed = GenerateInvoiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [invoice] = await db.insert(invoicesTable).values(parsed.data).returning();
  const [full] = await db
    .select(buildInvoiceSelect())
    .from(invoicesTable)
    .leftJoin(amcContractsTable, eq(invoicesTable.contractId, amcContractsTable.id))
    .leftJoin(machinesTable, eq(amcContractsTable.machineId, machinesTable.id))
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .where(eq(invoicesTable.id, invoice.id));
  res.status(201).json(ListInvoicesResponseItem.parse({ ...full, amount: Number(full?.amount ?? 0) }));
});

router.patch("/invoices/:id/pay", requireAuth, async (req, res): Promise<void> => {
  const params = MarkInvoicePaidParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [invoice] = await db
    .update(invoicesTable)
    .set({ status: "Paid" })
    .where(eq(invoicesTable.id, params.data.id))
    .returning();
  if (!invoice) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }
  const [full] = await db
    .select(buildInvoiceSelect())
    .from(invoicesTable)
    .leftJoin(amcContractsTable, eq(invoicesTable.contractId, amcContractsTable.id))
    .leftJoin(machinesTable, eq(amcContractsTable.machineId, machinesTable.id))
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .where(eq(invoicesTable.id, invoice.id));
  res.json(MarkInvoicePaidResponse.parse({ ...full, amount: Number(full?.amount ?? 0) }));
});

export default router;
