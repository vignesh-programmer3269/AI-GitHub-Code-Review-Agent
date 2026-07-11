import { puter } from "@heyputer/puter.js";
import { config } from "../config/index.js";
import { LLMError, ErrorCodes, normalizeProviderError } from "../utils/llmErrors.js";

class LLMService {
  constructor() {
    // Puter is imported globally, but we ensure the API key is present in the environment
    if (!config.puterApiKey) {
      console.warn("PUTER_API_KEY is not set. Puter may fail in a backend environment without authentication.");
    } else {
      // Authenticate with the backend API key
      puter.setAuthToken(config.puterApiKey);
    }
  }

  /**
   * Internal configuration mapping agents to specific models.
   * This is not exposed to the frontend or to the agents themselves.
   */
  #agentModelConfig = {
    planning: "claude-3-5-sonnet",
    security: "claude-3-5-sonnet",
    performance: "claude-3-5-sonnet",
    architecture: "claude-3-5-sonnet",
    documentation: "claude-3-5-sonnet", // Could be swapped for a cheaper model
    codeReview: "claude-3-5-sonnet",
    improvementRoadmap: "claude-3-5-sonnet",
    default: "claude-3-5-sonnet",
  };

  /**
   * Generates a response using the Puter LLM Gateway.
   * @param {Object} params
   * @param {string} params.agent - The name of the agent calling this service
   * @param {string} params.prompt
   * @returns {Promise<Object>}
   */
  async generateResponse({ agent, prompt }) {
    if (!prompt) throw new LLMError(ErrorCodes.UNKNOWN_ERROR, "Prompt is required.");

    const targetModel = this.#agentModelConfig[agent] || this.#agentModelConfig.default;

    try {
      // Pass the configured model to Puter
      const res = await puter.ai.chat(prompt, { model: targetModel });
      const textResponse = res?.message?.content || res?.toString() || JSON.stringify(res);

      return {
        success: true,
        content: textResponse,
        usage: {
          inputTokens: res?.usage?.prompt_tokens || 0,
          outputTokens: res?.usage?.completion_tokens || 0,
        },
        provider: "Puter",
        model: targetModel,
      };
    } catch (error) {
      throw normalizeProviderError(error, "Puter");
    }
  }
}

export const llmService = new LLMService();
