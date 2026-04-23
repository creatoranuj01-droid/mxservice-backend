// =============================================================
// MONGODB ATLAS — ServiceTask Model
// Mirrors: PostgreSQL `service_tasks` table
// STATUS: COMMENTED OUT
// =============================================================

/*
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IServiceTask extends Document {
  machineId: Types.ObjectId;      // ref: Machine
  engineerId?: Types.ObjectId;    // ref: Engineer
  scheduledDate: Date;
  status: string;                 // "Pending" | "Assigned" | "Completed" | "Closed"
  paymentReceived?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceTaskSchema = new Schema<IServiceTask>(
  {
    machineId:       { type: Schema.Types.ObjectId, ref: "Machine", required: true },
    engineerId:      { type: Schema.Types.ObjectId, ref: "Engineer" },
    scheduledDate:   { type: Date, required: true },
    status:          { type: String, required: true, default: "Pending" },
    paymentReceived: { type: Number, min: 0 },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "service_tasks",
  }
);

ServiceTaskSchema.index({ machineId: 1 });
ServiceTaskSchema.index({ engineerId: 1 });
ServiceTaskSchema.index({ status: 1 });
ServiceTaskSchema.index({ scheduledDate: 1 });

export const ServiceTaskModel: Model<IServiceTask> =
  mongoose.models.ServiceTask ||
  mongoose.model<IServiceTask>("ServiceTask", ServiceTaskSchema);
*/
