// =============================================================
// MONGODB ATLAS — Engineer Model
// Mirrors: PostgreSQL `engineers` table
// STATUS: COMMENTED OUT
// =============================================================

/*
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEngineer extends Document {
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const EngineerSchema = new Schema<IEngineer>(
  {
    name:         { type: String, required: true, trim: true },
    phone:        { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, default: "" },
    role:         { type: String, required: true, default: "engineer" },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "engineers",
  }
);

EngineerSchema.index({ email: 1 }, { unique: true });

export const EngineerModel: Model<IEngineer> =
  mongoose.models.Engineer || mongoose.model<IEngineer>("Engineer", EngineerSchema);
*/
