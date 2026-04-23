// =============================================================
// MONGODB ATLAS — Machine Model
// Mirrors: PostgreSQL `machines` table
// STATUS: COMMENTED OUT
// =============================================================

/*
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMachine extends Document {
  serialNumber: string;
  hospitalId: Types.ObjectId;   // ref: Hospital
  modelId?: Types.ObjectId;     // ref: MachineModel
  installDate: Date;
  warrantyEndDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const MachineSchema = new Schema<IMachine>(
  {
    serialNumber:   { type: String, required: true, unique: true, trim: true },
    hospitalId:     { type: Schema.Types.ObjectId, ref: "Hospital", required: true },
    modelId:        { type: Schema.Types.ObjectId, ref: "MachineModel" },
    installDate:    { type: Date, required: true },
    warrantyEndDate:{ type: Date, required: true },
    status:         { type: String, required: true, default: "Active" },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "machines",
  }
);

MachineSchema.index({ serialNumber: 1 }, { unique: true });
MachineSchema.index({ hospitalId: 1 });

export const MachineModel: Model<IMachine> =
  mongoose.models.Machine || mongoose.model<IMachine>("Machine", MachineSchema);
*/
