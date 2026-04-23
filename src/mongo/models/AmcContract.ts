// =============================================================
// MONGODB ATLAS — AMC Contract Model
// Mirrors: PostgreSQL `amc_contracts` table
// STATUS: COMMENTED OUT
// =============================================================

/*
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAmcContract extends Document {
  machineId: Types.ObjectId;     // ref: Machine
  contractType: string;          // "AMC" | "CMC"
  startDate: Date;
  endDate: Date;
  contractValue: number;
  status: string;                // "Active" | "Expiring Soon" | "Payment Pending" | "Closed"
  paymentReceived?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AmcContractSchema = new Schema<IAmcContract>(
  {
    machineId:       { type: Schema.Types.ObjectId, ref: "Machine", required: true },
    contractType:    { type: String, required: true, default: "AMC", enum: ["AMC", "CMC"] },
    startDate:       { type: Date, required: true },
    endDate:         { type: Date, required: true },
    contractValue:   { type: Number, required: true, min: 0 },
    status:          { type: String, required: true, default: "Active" },
    paymentReceived: { type: Number, min: 0 },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "amc_contracts",
  }
);

AmcContractSchema.index({ machineId: 1 });
AmcContractSchema.index({ status: 1 });
AmcContractSchema.index({ endDate: 1 });

export const AmcContractModel: Model<IAmcContract> =
  mongoose.models.AmcContract ||
  mongoose.model<IAmcContract>("AmcContract", AmcContractSchema);
*/
