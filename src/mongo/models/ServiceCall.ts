// =============================================================
// MONGODB ATLAS — ServiceCall Model
// Mirrors: PostgreSQL `service_calls` table
// STATUS: COMMENTED OUT
// =============================================================

/*
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IServiceCall extends Document {
  machineId?: Types.ObjectId;    // ref: Machine
  issueDescription: string;
  engineerId?: Types.ObjectId;   // ref: Engineer
  status: string;                // "Open" | "In Progress" | "Completed" | "Closed"
  reportRemarks?: string;
  reportFile?: string;
  paymentReceived?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceCallSchema = new Schema<IServiceCall>(
  {
    machineId:        { type: Schema.Types.ObjectId, ref: "Machine" },
    issueDescription: { type: String, required: true, trim: true },
    engineerId:       { type: Schema.Types.ObjectId, ref: "Engineer" },
    status:           { type: String, required: true, default: "Open" },
    reportRemarks:    { type: String },
    reportFile:       { type: String },
    paymentReceived:  { type: Number, min: 0 },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "service_calls",
  }
);

ServiceCallSchema.index({ machineId: 1 });
ServiceCallSchema.index({ engineerId: 1 });
ServiceCallSchema.index({ status: 1 });

export const ServiceCallModel: Model<IServiceCall> =
  mongoose.models.ServiceCall ||
  mongoose.model<IServiceCall>("ServiceCall", ServiceCallSchema);
*/
