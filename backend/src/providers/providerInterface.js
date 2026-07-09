import { LLMError, ErrorCodes } from "../utils/llmErrors.js";

/**
 * Base Provider Interface that all specific LLM providers must implement.
 */
export class ProviderInterface {
  /**
   * Generates a response from the LLM.
   *
   * @param {Object} params
   * @param {string} params.model - The model ID (e.g., "claude-3-5-sonnet-20240620").
   * @param {string} params.apiKey - The API key for the provider.
   * @param {string} params.prompt - The prompt to send to the LLM.
   * @returns {Promise<Object>} The normalized response object.
   *
   * Returned object must match:
   * {
   *   success: true,
   *   content: "response string",
   *   usage: {
   *     inputTokens: number,
   *     outputTokens: number
   *   },
   *   provider: "Provider Name",
   *   model: "Model Name"
   * }
   */
  async generateResponse(params) {
    throw new LLMError(ErrorCodes.PROVIDER_ERROR, "generateResponse method must be implemented by subclass");
  }
}
