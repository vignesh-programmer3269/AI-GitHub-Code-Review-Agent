import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProviderInterface } from "./providerInterface.js";
import { normalizeProviderError } from "../utils/llmErrors.js";

export class GeminiProvider extends ProviderInterface {
  async generateResponse({ model, apiKey, prompt }) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const generativeModel = genAI.getGenerativeModel({ model });

      const result = await generativeModel.generateContent(prompt);
      const response = await result.response;

      const usageMetadata = response.usageMetadata;

      return {
        success: true,
        content: response.text(),
        usage: {
          inputTokens: usageMetadata?.promptTokenCount || 0,
          outputTokens: usageMetadata?.candidatesTokenCount || 0,
        },
        provider: "Gemini",
        model: model,
      };
    } catch (error) {
      throw normalizeProviderError(error, "Gemini");
    }
  }
}
