import { StatusCodes } from "http-status-codes";
import { contextEngine } from "../context/contextEngine.js";
import { buildPlanningContext } from "../context/builders/planningContextBuilder.js";
import { buildPlanningPrompt } from "../prompts/planningPromptBuilder.js";
import { llmService } from "../services/llm.service.js";
import { validatePlanningResponse } from "../agents/planning/planningResponseValidator.js";

// 1. Context Engine: Initialize
export const testInitSession = async (req, res, next) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(StatusCodes.BAD_REQUEST).json({ error: "repoUrl is required" });
    
    const sessionId = await contextEngine.initializeRepository(repoUrl);
    res.status(StatusCodes.OK).json({ success: true, sessionId });
  } catch (err) {
    next(err);
  }
};

// 2. Context Engine: Get Session
export const testGetSession = (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = contextEngine.getContext(sessionId);
    if (!session) return res.status(StatusCodes.NOT_FOUND).json({ error: "Session not found" });
    
    res.status(StatusCodes.OK).json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

// 3. Planning: Build Context
export const testPlanningContext = (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = contextEngine.getContext(sessionId);
    if (!session) return res.status(StatusCodes.NOT_FOUND).json({ error: "Session not found" });

    const planningContext = buildPlanningContext(session.repositoryContext);
    res.status(StatusCodes.OK).json({ success: true, planningContext });
  } catch (err) {
    next(err);
  }
};

// 4. Planning: Build Prompt
export const testPlanningPrompt = (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = contextEngine.getContext(sessionId);
    if (!session) return res.status(StatusCodes.NOT_FOUND).json({ error: "Session not found" });

    const planningContext = buildPlanningContext(session.repositoryContext);
    const prompts = buildPlanningPrompt(planningContext);
    res.status(StatusCodes.OK).json({ success: true, prompts });
  } catch (err) {
    next(err);
  }
};

// 5. LLM Service: Generate (Manual test)
export const testLlmGenerate = async (req, res, next) => {
  try {
    const { agent, prompt } = req.body;
    if (!agent || !prompt) return res.status(StatusCodes.BAD_REQUEST).json({ error: "agent and prompt are required" });

    const llmResponse = await llmService.generateResponse({ agent, prompt });
    res.status(StatusCodes.OK).json({ success: true, llmResponse });
  } catch (err) {
    next(err);
  }
};

// 6. Planning: Validate Response (Pass manual JSON)
export const testPlanningValidator = (req, res, next) => {
  try {
    const { rawResponse } = req.body;
    if (!rawResponse) return res.status(StatusCodes.BAD_REQUEST).json({ error: "rawResponse is required" });

    const validatedResult = validatePlanningResponse(rawResponse);
    res.status(StatusCodes.OK).json({ success: true, validatedResult });
  } catch (err) {
    next(err);
  }
};
