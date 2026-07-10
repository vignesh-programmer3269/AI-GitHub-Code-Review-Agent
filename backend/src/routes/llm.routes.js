import { Router } from "express";
import { llmController } from "../controllers/llm.controller.js";

const router = Router();

router.post("/llm/test", (req, res, next) => llmController.testProvider(req, res, next));

export default router;
