import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import hospitalsRouter from "./hospitals";
import machinesRouter from "./machines";
import engineersRouter from "./engineers";
import amcRouter from "./amc";
import quotationsRouter from "./quotations";
import servicesRouter from "./services";
import dashboardRouter from "./dashboard";
import callsRouter from "./calls";
import machineModelsRouter from "./machineModels";
import adminUsersRouter from "./adminUsers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(hospitalsRouter);
router.use(machinesRouter);
router.use(engineersRouter);
router.use(quotationsRouter);
router.use(amcRouter);
router.use(servicesRouter);
router.use(dashboardRouter);
router.use(callsRouter);
router.use(machineModelsRouter);
router.use(adminUsersRouter);

export default router;
