// =============================================================
// MONGODB ATLAS — ServiceReport Model
// Mirrors: PostgreSQL `service_reports` table
// STATUS: COMMENTED OUT
// =============================================================

/*
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IServiceReport extends Document {
  taskId: Types.ObjectId;        // ref: ServiceTask (unique — 1 report per task)
  remarks: string;
  photos: string[];
  customerSignature?: string;
  completedAt: Date;
  createdAt: Date;
}

const ServiceReportSchema = new Schema<IServiceReport>(
  {
    taskId:            { type: Schema.Types.ObjectId, ref: "ServiceTask", required: true, unique: true },
    remarks:           { type: String, required: true, trim: true },
    photos:            { type: [String], default: [] },
    customerSignature: { type: String },
    completedAt:       { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt" },
    collection: "service_reports",
  }
);

ServiceReportSchema.index({ taskId: 1 }, { unique: true });

export const ServiceReportModel: Model<IServiceReport> =
  mongoose.models.ServiceReport ||
  mongoose.model<IServiceReport>("ServiceReport", ServiceReportSchema);
*/
