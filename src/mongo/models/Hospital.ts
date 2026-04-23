// =============================================================
// MONGODB ATLAS — Hospital Model
// Mirrors: PostgreSQL `hospitals` table
// STATUS: COMMENTED OUT
// =============================================================

/*
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHospital extends Document {
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    name:          { type: String, required: true, trim: true },
    address:       { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    phone:         { type: String, required: true, trim: true },
    email:         { type: String, required: false, default: "", lowercase: true, trim: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "hospitals",
  }
);

HospitalSchema.index({ name: 1 });

export const HospitalModel: Model<IHospital> =
  mongoose.models.Hospital || mongoose.model<IHospital>("Hospital", HospitalSchema);
*/
