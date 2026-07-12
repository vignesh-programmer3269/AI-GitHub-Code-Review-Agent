import { Router } from "express";
import { 
  testInitSession, 
  testGetSession, 
  testPlanningContext, 
  testPlanningPrompt, 
  testLlmGenerate, 
  testPlanningValidator 
} from "./test.controller.js";

const router = Router();

// 1. Context Engine
router.post("/context-engine/init", testInitSession);
router.get("/context-engine/session/:sessionId", testGetSession);

// 2. Planning Builders
router.get("/planning/context/:sessionId", testPlanningContext);
router.get("/planning/prompt/:sessionId", testPlanningPrompt);

// 3. LLM Service
router.post("/llm/generate", testLlmGenerate);

// 4. Validators
router.post("/planning/validate", testPlanningValidator);

export default router;
