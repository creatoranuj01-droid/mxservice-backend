import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import { format } from "date-fns";

export interface QuotationData {
  quotationNumber: string;
  date: Date;
  hospitalName: string;
  hospitalAddress: string;
  contactPerson: string;
  hospitalEmail: string;
  machineSerial: string;
  contractStartDate: Date;
  contractEndDate: Date;
  machineValue: number;
  percentage: number;
  quotationAmount: number;
  validUntil: Date;
}

export function generateQuotationPdf(data: QuotationData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const primary = "#1a2236";
    const accent = "#3b82f6";
    const lightGray = "#f8fafc";
    const textGray = "#64748b";

    doc.rect(0, 0, doc.page.width, 100).fill(primary);
    doc.fill("white").fontSize(22).font("Helvetica-Bold").text("AMX ServiceHub", 50, 30);
    doc.fontSize(10).font("Helvetica").text("X-Ray Machine Maintenance Specialists", 50, 58);
    doc.fontSize(9).text("www.amxservicehub.com  |  support@amxservicehub.com", 50, 74);

    doc.fill(accent).fontSize(18).font("Helvetica-Bold").text("RENEWAL QUOTATION", 350, 38, { align: "right", width: 200 });
    doc.fill("white").fontSize(9).font("Helvetica")
      .text(`No: ${data.quotationNumber}`, 350, 62, { align: "right", width: 200 })
      .text(`Date: ${format(data.date, "dd MMM yyyy")}`, 350, 76, { align: "right", width: 200 });

    doc.moveDown(0.5);
    let y = 115;

    doc.fill(primary).fontSize(10).font("Helvetica-Bold").text("TO:", 50, y);
    doc.fill("#1e293b").fontSize(11).font("Helvetica-Bold").text(data.hospitalName, 50, y + 14);
    doc.fill(textGray).fontSize(9).font("Helvetica")
      .text(data.hospitalAddress, 50, y + 30)
      .text(`Attn: ${data.contactPerson}`, 50, y + 44)
      .text(data.hospitalEmail, 50, y + 58);

    doc.fill(primary).fontSize(10).font("Helvetica-Bold").text("VALID UNTIL:", 370, y);
    doc.fill(accent).fontSize(12).font("Helvetica-Bold").text(format(data.validUntil, "dd MMM yyyy"), 370, y + 14);

    y += 90;
    doc.rect(50, y, doc.page.width - 100, 1).fill("#e2e8f0");
    y += 15;

    doc.fill(primary).fontSize(12).font("Helvetica-Bold").text("AMC Renewal Quotation", 50, y);
    doc.fill(textGray).fontSize(9).font("Helvetica").text(
      "This quotation is for the renewal of the Annual Maintenance Contract (AMC) for the below X-ray machine.",
      50, y + 18, { width: doc.page.width - 100 }
    );

    y += 50;
    doc.rect(50, y, doc.page.width - 100, 30).fill(primary);
    const cols = [50, 220, 350, 450];
    doc.fill("white").fontSize(9).font("Helvetica-Bold")
      .text("Machine Serial", cols[0] + 8, y + 9)
      .text("Contract Period", cols[1] + 8, y + 9)
      .text("Machine Value", cols[2] + 8, y + 9)
      .text("% Applied", cols[3] + 8, y + 9);

    y += 30;
    doc.rect(50, y, doc.page.width - 100, 32).fill(lightGray);
    doc.fill("#1e293b").fontSize(9).font("Helvetica")
      .text(data.machineSerial, cols[0] + 8, y + 11)
      .text(
        `${format(data.contractStartDate, "dd/MM/yyyy")} – ${format(data.contractEndDate, "dd/MM/yyyy")}`,
        cols[1] + 8, y + 11
      )
      .text(`₹${data.machineValue.toLocaleString("en-IN")}`, cols[2] + 8, y + 11)
      .text(`${data.percentage}%`, cols[3] + 8, y + 11);

    y += 55;
    const boxW = 220;
    const boxX = doc.page.width - 50 - boxW;
    doc.rect(boxX, y, boxW, 60).fill(accent);
    doc.fill("white").fontSize(10).font("Helvetica").text("Total Quotation Amount", boxX + 12, y + 10);
    doc.fontSize(22).font("Helvetica-Bold").text(
      `₹${data.quotationAmount.toLocaleString("en-IN")}`,
      boxX + 12, y + 26
    );

    doc.fill(textGray).fontSize(8).font("Helvetica")
      .text(`Calculated as ${data.percentage}% of machine value ₹${data.machineValue.toLocaleString("en-IN")}`, 50, y + 18);

    y += 80;
    doc.rect(50, y, doc.page.width - 100, 1).fill("#e2e8f0");
    y += 12;

    doc.fill(primary).fontSize(10).font("Helvetica-Bold").text("Terms & Conditions", 50, y);
    y += 16;
    const terms = [
      "This quotation is valid for 30 days from the date of issue.",
      "AMC covers all preventive maintenance visits (every 90 days) and breakdown calls.",
      "Spare parts, if required, will be charged separately as per actuals.",
      "Payment is due within 15 days of acceptance.",
      "GST as applicable will be charged additionally.",
    ];
    terms.forEach((term) => {
      doc.fill(textGray).fontSize(8.5).font("Helvetica").text(`• ${term}`, 55, y, { width: doc.page.width - 110 });
      y += 14;
    });

    y += 10;
    doc.fill(primary).fontSize(9).font("Helvetica-Bold").text("To accept this quotation, please reply to this email or contact us.", 50, y);

    const footerY = doc.page.height - 50;
    doc.rect(0, footerY - 10, doc.page.width, 60).fill(primary);
    doc.fill("white").fontSize(8).font("Helvetica")
      .text("AMX ServiceHub  |  Authorized X-Ray Machine Service Provider", 50, footerY, { align: "center", width: doc.page.width - 100 });

    doc.end();
  });
}

export async function sendQuotationEmail(
  to: string,
  data: QuotationData,
  pdfBuffer: Buffer
): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT ?? "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: `"AMX ServiceHub" <${smtpUser}>`,
    to,
    subject: `AMC Renewal Quotation – ${data.machineSerial} [${data.quotationNumber}]`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a2236; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">AMX ServiceHub</h1>
          <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">X-Ray Machine Maintenance Specialists</p>
        </div>
        <div style="background: #f8fafc; padding: 28px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #1e293b;">Dear <strong>${data.contactPerson}</strong>,</p>
          <p style="color: #475569;">
            We hope this message finds you well. Your Annual Maintenance Contract for X-ray machine 
            <strong>${data.machineSerial}</strong> at <strong>${data.hospitalName}</strong> is due for renewal.
          </p>
          <p style="color: #475569;">
            Please find attached our renewal quotation (<strong>${data.quotationNumber}</strong>) for your reference.
          </p>
          <div style="background: #3b82f6; border-radius: 8px; padding: 16px 24px; margin: 24px 0; text-align: center;">
            <p style="color: white; margin: 0; font-size: 13px; opacity: 0.85;">Total Quotation Amount</p>
            <p style="color: white; margin: 4px 0 0; font-size: 28px; font-weight: bold;">
              ₹${data.quotationAmount.toLocaleString("en-IN")}
            </p>
            <p style="color: white; margin: 4px 0 0; font-size: 11px; opacity: 0.75;">
              ${data.percentage}% of machine value — Valid until ${format(data.validUntil, "dd MMM yyyy")}
            </p>
          </div>
          <p style="color: #475569; font-size: 13px;">
            To accept this quotation, simply reply to this email or contact us at 
            <a href="mailto:support@amxservicehub.com" style="color: #3b82f6;">support@amxservicehub.com</a>.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            This quotation is valid for 30 days. GST as applicable will be charged additionally.
          </p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Quotation-${data.quotationNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  return true;
}
