import { contextEngine } from "../../context/contextEngine.js";
import { buildPlanningContext } from "../../context/builders/planningContextBuilder.js";
import { buildPlanningPrompt } from "../../prompts/planningPromptBuilder.js";
import { llmService } from "../../services/llm.service.js";
import { validatePlanningResponse } from "./planningResponseValidator.js";
import { HttpError } from "../../utils/HttpError.js";

class PlanningAgent {
  async run(sessionId) {
    const session = contextEngine.getContext(sessionId);
    if (!session) {
      throw new HttpError(404, "SESSION_NOT_FOUND", "Analysis session not found or expired.");
    }

    if (!session.repositoryContext) {
      throw new HttpError(500, "CONTEXT_MISSING", "Repository context is missing from the session.");
    }

    // 1. Build Minimal Context
    const planningContext = buildPlanningContext(session.repositoryContext);

    // 2. Build Prompts
    const prompts = buildPlanningPrompt(planningContext);

    // Combine system and user prompt since our llm.service currently takes a single string.
    // In a more advanced implementation, these could be passed as a message array.
    const combinedPrompt = `${prompts.systemPrompt}\n\n${prompts.userPrompt}`;

    // 3. Request LLM
    const llmResponse = await llmService.generateResponse({
      agent: "planning",
      prompt: combinedPrompt,
    });

    if (!llmResponse.success) {
      throw new HttpError(500, "LLM_FAILURE", "Failed to generate AI response.");
    }

    // 4. Validate Output
    const validatedResult = validatePlanningResponse(llmResponse.content);

    // 5. Store inside Session
    contextEngine.updateAgentResult(sessionId, "planning", validatedResult);

    // 6. Return standard format for the controller
    return {
      success: true,
      sessionId,
      repositorySummary: validatedResult,
      recommendedAgents: validatedResult.recommendedAgents,
      estimatedAnalysisTime: validatedResult.estimatedAnalysisTime,
    };
  }
}

export const planningAgent = new PlanningAgent();
