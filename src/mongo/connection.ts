// =============================================================
// MONGODB ATLAS — CONNECTION
// =============================================================
// STATUS: COMMENTED OUT — PostgreSQL (Drizzle) is active
//
// TO SWITCH TO MONGODB ATLAS:
//   1. Set MONGODB_URI in your .env file
//   2. Uncomment everything below
//   3. Call connectMongo() in src/index.ts after server starts
//   4. Comment out / remove Drizzle db initialization in lib/db
// =============================================================

/*
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

let isConnected = false;

export async function connectMongo(): Promise<void> {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      // Atlas recommended options
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ MongoDB Atlas connection failed:", error);
    process.exit(1);
  }
}

export async function disconnectMongo(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log("MongoDB Atlas disconnected");
}

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB Atlas disconnected — retrying...");
  isConnected = false;
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB Atlas error:", err);
});
*/
