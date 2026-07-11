import { Router } from "express";
import healthRoutes from "./health.routes.js";
import validationRoutes from "./validation.routes.js";
import llmRoutes from "./llm.routes.js";
import analyzeRoutes from "./analyze.routes.js";
import debugRoutes from "./debug.routes.js";

const router = Router();

// Mount sub‑routers
router.use(healthRoutes);
router.use(validationRoutes);
router.use(llmRoutes);
router.use(analyzeRoutes);
router.use(debugRoutes);

export default router;
