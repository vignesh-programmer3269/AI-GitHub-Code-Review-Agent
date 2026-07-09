import OpenAI from "openai";
import { ProviderInterface } from "./providerInterface.js";
import { normalizeProviderError } from "../utils/llmErrors.js";

export class OpenAIProvider extends ProviderInterface {
  async generateResponse({ model, apiKey, prompt }) {
    try {
      const openai = new OpenAI({ apiKey });

      const response = await openai.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        // We can add temperature and other parameters here later if needed
      });

      return {
        success: true,
        content: response.choices[0].message.content,
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
        },
        provider: "OpenAI",
        model: response.model || model,
      };
    } catch (error) {
      throw normalizeProviderError(error, "OpenAI");
    }
  }
}
