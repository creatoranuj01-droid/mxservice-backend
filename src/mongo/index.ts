// =============================================================
// MONGODB ATLAS — Central Export
// STATUS: COMMENTED OUT — PostgreSQL (Drizzle) is active
//
// When switching to MongoDB:
//   1. Uncomment everything in this file
//   2. Uncomment each model file in ./models/
//   3. Uncomment ./connection.ts
//   4. In src/index.ts: import { connectMongo } from "./mongo"
//      and call await connectMongo() before app.listen()
//   5. Replace Drizzle db queries in each route file with
//      the corresponding Mongoose model below
// =============================================================

/*
export { connectMongo, disconnectMongo } from "./connection";

export { AdminModel }        from "./models/Admin";
export { HospitalModel }     from "./models/Hospital";
export { MachineModelModel } from "./models/MachineModel";
export { MachineModel }      from "./models/Machine";
export { EngineerModel }     from "./models/Engineer";
export { AmcContractModel }  from "./models/AmcContract";
export { ServiceTaskModel }  from "./models/ServiceTask";
export { ServiceCallModel }  from "./models/ServiceCall";
export { ServiceReportModel} from "./models/ServiceReport";
export { InvoiceModel }      from "./models/Invoice";
*/

// This export exists so TypeScript doesn't complain about an empty module
export {};
