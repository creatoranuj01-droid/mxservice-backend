// =============================================================
// MONGODB ATLAS — Invoice Model
// Mirrors: PostgreSQL `invoices` table
// STATUS: COMMENTED OUT
// =============================================================

/*
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInvoice extends Document {
  contractId: Types.ObjectId;    // ref: AmcContract
  amount: number;
  status: string;                // "Pending" | "Paid"
  generatedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    contractId:    { type: Schema.Types.ObjectId, ref: "AmcContract", required: true },
    amount:        { type: Number, required: true, min: 0 },
    status:        { type: String, required: true, default: "Pending", enum: ["Pending", "Paid"] },
    generatedDate: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "invoices",
  }
);

InvoiceSchema.index({ contractId: 1 });
InvoiceSchema.index({ status: 1 });

export const InvoiceModel: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);
*/
