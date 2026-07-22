import { contextEngine } from "../../context/contextEngine.js";
import { buildPlanningContext } from "../../context/builders/planningContextBuilder.js";
import { buildPlanningPrompt } from "../../prompts/planningPromptBuilder.js";
import { llmService } from "../../services/llm.service.js";
import { validatePlanningResponse } from "./planningResponseValidator.js";
import { HttpError } from "../../utils/HttpError.js";

import { dummyProfiler } from "../../utils/performanceProfiler.js";

class PlanningAgent {
  async run(sessionId, profiler = dummyProfiler) {
    const session = contextEngine.getContext(sessionId);
    if (!session) {
      throw new HttpError(
        404,
        "SESSION_NOT_FOUND",
        "Analysis session not found or expired.",
      );
    }

    if (!session.repositoryContext) {
      throw new HttpError(
        500,
        "CONTEXT_MISSING",
        "Repository context is missing from the session.",
      );
    }

    // 1. Build Minimal Context
    profiler.start("Context Builder");
    const planningContext = buildPlanningContext(session.repositoryContext);
    profiler.end("Context Builder");

    // 2. Build Prompts
    profiler.start("Prompt Builder");
    const prompts = buildPlanningPrompt(planningContext);

    // Combine system and user prompt since our llm.service currently takes a single string.
    // In a more advanced implementation, these could be passed as a message array.
    const combinedPrompt = `${prompts.systemPrompt}\n\nEXPECTED JSON SCHEMA:\n${JSON.stringify(prompts.expectedSchema, null, 2)}\n\n${prompts.userPrompt}`;
    profiler.end("Prompt Builder");

    // 3. Request LLM
    profiler.start("OpenRouter Request");
    const llmResponse = await llmService.generateResponse({
      agent: "planning",
      prompt: combinedPrompt,
    });
    profiler.end("OpenRouter Request");

    if (!llmResponse.success) {
      throw new HttpError(
        500,
        "LLM_FAILURE",
        "Failed to generate AI response.",
      );
    }

    // 4. Validate Output (Parse + Validate)
    const validatedResult = validatePlanningResponse(
      llmResponse.content,
      profiler,
    );

    // 5. Inject exact statistics from RepositoryContext to prevent LLM hallucinations
    const fileCount = session.repositoryContext.fileTree
      ? session.repositoryContext.fileTree.filter((f) => f.type === "file")
          .length
      : Object.keys(session.repositoryContext.fileHashes || {}).length;

    const folderCount = session.repositoryContext.fileTree
      ? session.repositoryContext.fileTree.filter((f) => f.type === "dir")
          .length
      : 0;

    validatedResult.repositoryName = session.repositoryContext.repo;
    validatedResult.repositoryOwner = session.repositoryContext.owner;

    validatedResult.repositoryStats = {
      files: fileCount,
      folders: folderCount,
      languages: session.repositoryContext.metadata.languages || [],
      repositorySize: session.repositoryContext.metadata.sizeKb || 0,
      defaultBranch: session.repositoryContext.defaultBranch || "main",
    };

    // Calculate totals for recommended analyses
    let estimatedTotalTime = 0;
    let estimatedTotalTokens = 0;

    if (Array.isArray(validatedResult.recommendedAnalyses)) {
      validatedResult.recommendedAnalyses.forEach((agent) => {
        if (agent.selectedByDefault) {
          estimatedTotalTokens += agent.estimatedTokens || 0;

          // Parse "2 min", "30 sec" etc into seconds roughly for the total, or just store a raw number.
          // Since the prompt asks for "estimatedDuration: string", we will just let it be strings per agent,
          // but we can let the LLM return seconds on the backend and we format on frontend, or just sum it up if we require integers.
          // The prompt currently asks for estimatedDuration as string. Let's just pass 0 for estimatedTotalTime here and let frontend handle or we parse it.
          // Actually, let's keep it simple and just do a naive parse of minutes if we can, otherwise 0.
          if (
            agent.estimatedDuration &&
            agent.estimatedDuration.includes("min")
          ) {
            estimatedTotalTime += parseInt(agent.estimatedDuration) * 60;
          } else if (
            agent.estimatedDuration &&
            agent.estimatedDuration.includes("sec")
          ) {
            estimatedTotalTime += parseInt(agent.estimatedDuration);
          }
        }
      });
    }

    validatedResult.estimatedTotalTime = estimatedTotalTime;
    validatedResult.estimatedTotalTokens = estimatedTotalTokens;

    // 6. Store inside Session
    profiler.start("Session Update");
    contextEngine.updateAgentResult(sessionId, "planning", validatedResult);
    profiler.end("Session Update");

    // 7. Return standard format for the controller
    return {
      success: true,
      sessionId,
      planning: validatedResult,
    };
  }
}

export const planningAgent = new PlanningAgent();
