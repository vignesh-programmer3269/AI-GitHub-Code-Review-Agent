import { Router } from "express";
import { llmController } from "../controllers/llm.controller.js";

const router = Router();

router.post("/llm/test", llmController.testProvider.bind(llmController));

export default router;
