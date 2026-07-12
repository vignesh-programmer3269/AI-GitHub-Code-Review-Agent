import { puter } from "@heyputer/puter.js";
import { config } from "../config/index.js";
import { agentModelConfig } from "../config/agentModelConfig.js";
import {
  LLMError,
  ErrorCodes,
  normalizeProviderError,
} from "../utils/llmErrors.js";

class LLMService {
  constructor() {
    // Puter is imported globally, but we ensure the API key is present in the environment
    if (!config.puterApiKey) {
      console.warn(
        "PUTER_API_KEY is not set. Puter may fail in a backend environment without authentication.",
      );
    } else {
      // Authenticate with the backend API key
      puter.setAuthToken(config.puterApiKey);
    }
  }


  /**
   * Generates a response using the Puter LLM Gateway.
   * @param {Object} params
   * @param {string} params.agent - The name of the agent calling this service
   * @param {string} params.prompt
   * @returns {Promise<Object>}
   */
  async generateResponse({ agent, prompt }) {
    if (!prompt)
      throw new LLMError(ErrorCodes.UNKNOWN_ERROR, "Prompt is required.");

    const targetModel =
      agentModelConfig[agent] || agentModelConfig.default;

    try {
      // Pass the configured model to Puter
      const res = await puter.ai.chat(prompt, { model: targetModel });
      const textResponse =
        res?.message?.content || res?.toString() || JSON.stringify(res);

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
