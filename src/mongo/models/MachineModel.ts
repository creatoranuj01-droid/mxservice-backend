// =============================================================
// MONGODB ATLAS — MachineModel Model
// Mirrors: PostgreSQL `machine_models` table
// STATUS: COMMENTED OUT
// =============================================================

/*
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMachineModel extends Document {
  name: string;
  manufacturer?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MachineModelSchema = new Schema<IMachineModel>(
  {
    name:         { type: String, required: true, unique: true, trim: true },
    manufacturer: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "machine_models",
  }
);

MachineModelSchema.index({ name: 1 }, { unique: true });

export const MachineModelModel: Model<IMachineModel> =
  mongoose.models.MachineModel ||
  mongoose.model<IMachineModel>("MachineModel", MachineModelSchema);
*/
