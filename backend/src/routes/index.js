// backend/src/routes/index.js
import { Router } from "express";
import healthRoutes from "./health.routes.js";
import validationRoutes from "./validation.routes.js";
import llmRoutes from "./llm.routes.js";

const router = Router();

// Mount sub‑routers
router.use(healthRoutes);
router.use(validationRoutes);
router.use(llmRoutes);

export default router;
