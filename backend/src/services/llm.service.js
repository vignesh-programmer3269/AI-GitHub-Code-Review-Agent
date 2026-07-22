import axios from "axios";
import { config } from "../config/index.js";
import { agentModelConfig } from "../config/agentModelConfig.js";
import {
  LLMError,
  ErrorCodes,
  normalizeProviderError,
} from "../utils/llmErrors.js";

class LLMService {
  constructor() {
    if (!config.openRouterApiKey) {
      console.warn(
        "OPENROUTER_API_KEY is not set. OpenRouter calls will fail without authentication.",
      );
    }

    this.client = axios.create({
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + config.openRouterApiKey,
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "AI GitHub Code Review Agent",
      },
    });
  }

  /**
   * Generates a response using the OpenRouter LLM Gateway.
   * @param {Object} params
   * @param {string} params.agent - The name of the agent calling this service
   * @param {string} params.prompt
   * @returns {Promise<Object>}
   */
  async generateResponse({ agent, prompt }) {
    if (!prompt)
      throw new LLMError(ErrorCodes.UNKNOWN_ERROR, "Prompt is required.");

    const targetModel = "poolside/laguna-xs-2.1:free";

    try {
      const response = await this.client.post("/chat/completions", {
        model: targetModel,
        messages: [{ role: "user", content: prompt }],
      });

      const data = response.data;
      const textResponse = data.choices?.[0]?.message?.content || "";

      return {
        success: true,
        content: textResponse,
        usage: {
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0,
        },
        provider: "OpenRouter",
        model: targetModel,
      };
    } catch (error) {
      throw normalizeProviderError(error, "OpenRouter");
    }
  }
}

export const llmService = new LLMService();
