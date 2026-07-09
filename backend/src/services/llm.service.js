import { getProvider } from "../providers/providerFactory.js";
import { LLMError, ErrorCodes } from "../utils/llmErrors.js";

class LLMService {
  /**
   * Tests communication with an LLM provider.
   * @param {Object} params
   * @param {string} params.providerId
   * @param {string} params.model
   * @param {string} params.apiKey
   * @param {string} params.prompt
   * @returns {Promise<Object>}
   */
  async testConnection({ providerId, model, apiKey, prompt }) {
    if (!providerId) throw new LLMError(ErrorCodes.INVALID_PROVIDER, "Provider is required.");
    if (!model) throw new LLMError(ErrorCodes.INVALID_MODEL, "Model is required.");
    if (!apiKey) throw new LLMError(ErrorCodes.INVALID_API_KEY, "API key is required.");
    if (!prompt) throw new LLMError(ErrorCodes.UNKNOWN_ERROR, "Prompt is required.");

    const providerInstance = getProvider(providerId);
    
    // We do NOT log the API key anywhere.
    return await providerInstance.generateResponse({
      model,
      apiKey,
      prompt
    });
  }
}

export const llmService = new LLMService();
