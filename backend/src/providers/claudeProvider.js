import Anthropic from "@anthropic-ai/sdk";
import { ProviderInterface } from "./providerInterface.js";
import { normalizeProviderError } from "../utils/llmErrors.js";

export class ClaudeProvider extends ProviderInterface {
  async generateResponse({ model, apiKey, prompt }) {
    try {
      const anthropic = new Anthropic({ apiKey });

      const response = await anthropic.messages.create({
        model,
        max_tokens: 4096, // required by Anthropic API
        messages: [{ role: "user", content: prompt }],
      });

      return {
        success: true,
        content: response.content[0].text,
        usage: {
          inputTokens: response.usage?.input_tokens || 0,
          outputTokens: response.usage?.output_tokens || 0,
        },
        provider: "Claude",
        model: response.model || model,
      };
    } catch (error) {
      throw normalizeProviderError(error, "Claude");
    }
  }
}
