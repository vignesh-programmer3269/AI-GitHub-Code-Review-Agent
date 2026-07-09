import { ClaudeProvider } from "./claudeProvider.js";
import { OpenAIProvider } from "./openaiProvider.js";
import { GeminiProvider } from "./geminiProvider.js";
import { LLMError, ErrorCodes } from "../utils/llmErrors.js";

/**
 * Returns the appropriate provider implementation.
 * @param {string} providerId - "anthropic", "openai", "gemini"
 */
export function getProvider(providerId) {
  const normalized = providerId?.toLowerCase();

  switch (normalized) {
    case "anthropic":
    case "claude":
      return new ClaudeProvider();
    case "openai":
      return new OpenAIProvider();
    case "gemini":
    case "google":
      return new GeminiProvider();
    default:
      throw new LLMError(
        ErrorCodes.INVALID_PROVIDER,
        `Provider '${providerId}' is not supported.`,
      );
  }
}
