import { Router } from "express";
import { db } from "@workspace/db";
import { amcContractsTable, machinesTable, hospitalsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import {
  SendQuotationBody,
  DownloadQuotationPdfParams,
  DownloadQuotationPdfQueryParams,
} from "@workspace/api-zod";
import { generateQuotationPdf, sendQuotationEmail, type QuotationData } from "../lib/quotation";
import { logger } from "../lib/logger";

const router = Router();

async function fetchContractDetails(contractId: number) {
  const [row] = await db
    .select({
      id: amcContractsTable.id,
      machineId: amcContractsTable.machineId,
      machineSerial: machinesTable.serialNumber,
      startDate: amcContractsTable.startDate,
      endDate: amcContractsTable.endDate,
      contractValue: amcContractsTable.contractValue,
      status: amcContractsTable.status,
      hospitalName: hospitalsTable.name,
      hospitalAddress: hospitalsTable.address,
      contactPerson: hospitalsTable.contactPerson,
      hospitalEmail: hospitalsTable.email,
    })
    .from(amcContractsTable)
    .leftJoin(machinesTable, eq(amcContractsTable.machineId, machinesTable.id))
    .leftJoin(hospitalsTable, eq(machinesTable.hospitalId, hospitalsTable.id))
    .where(eq(amcContractsTable.id, contractId));
  return row ?? null;
}

function buildQuotationData(row: NonNullable<Awaited<ReturnType<typeof fetchContractDetails>>>, percentage: number, machineValue: number): QuotationData {
  const quotationAmount = Math.round((percentage / 100) * machineValue);
  const now = new Date();
  const validUntil = new Date(now);
  validUntil.setDate(validUntil.getDate() + 30);
  const quotationNumber = `QTN-${row.id}-${Date.now().toString().slice(-6)}`;

  return {
    quotationNumber,
    date: now,
    hospitalName: row.hospitalName ?? "Unknown Hospital",
    hospitalAddress: row.hospitalAddress ?? "",
    contactPerson: row.contactPerson ?? "",
    hospitalEmail: row.hospitalEmail ?? "",
    machineSerial: row.machineSerial ?? `Machine #${row.machineId}`,
    contractStartDate: new Date(row.startDate),
    contractEndDate: new Date(row.endDate),
    machineValue,
    percentage,
    quotationAmount,
    validUntil,
  };
}

router.post("/amc/quotation", requireAuth, async (req, res): Promise<void> => {
  const parsed = SendQuotationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { contractId, percentage, machineValue } = parsed.data;
  const row = await fetchContractDetails(contractId);
  if (!row) {
    res.status(404).json({ error: "AMC contract not found" });
    return;
  }

  const qData = buildQuotationData(row, percentage, machineValue);
  const pdfBuffer = await generateQuotationPdf(qData);

  let emailSent = false;
  const toEmail = row.hospitalEmail;
  if (toEmail) {
    try {
      emailSent = await sendQuotationEmail(toEmail, qData, pdfBuffer);
    } catch (err) {
      logger.warn({ err, toEmail }, "Failed to send quotation email");
    }
  }

  const msg = emailSent
    ? `Quotation emailed to ${toEmail}`
    : !process.env.SMTP_HOST
      ? "SMTP not configured — PDF generated but email not sent"
      : `PDF generated but email failed for ${toEmail || "unknown"}`;

  res.json({
    success: true,
    quotationAmount: qData.quotationAmount,
    emailSent,
    message: msg,
  });
});

router.get("/amc/quotation/:contractId/pdf", requireAuth, async (req, res): Promise<void> => {
  const params = DownloadQuotationPdfParams.safeParse(req.params);
  const query = DownloadQuotationPdfQueryParams.safeParse(req.query);

  if (!params.success || !query.success) {
    res.status(400).json({ error: "Invalid parameters" });
    return;
  }

  const row = await fetchContractDetails(params.data.contractId);
  if (!row) {
    res.status(404).json({ error: "AMC contract not found" });
    return;
  }

  const qData = buildQuotationData(row, query.data.percentage, query.data.machineValue);
  const pdfBuffer = await generateQuotationPdf(qData);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="Quotation-${qData.quotationNumber}.pdf"`,
    "Content-Length": pdfBuffer.length,
  });
  res.send(pdfBuffer);
});

export default router;
