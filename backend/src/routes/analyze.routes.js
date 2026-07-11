import { Router } from "express";
import { analyzeRepo } from "../controllers/analyze.controller.js";

const router = Router();

router.post("/repo/analyze", analyzeRepo);

export default router;
