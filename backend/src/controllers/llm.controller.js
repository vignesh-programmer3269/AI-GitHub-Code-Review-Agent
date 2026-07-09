import { llmService } from "../services/llm.service.js";
import { LLMError } from "../utils/llmErrors.js";
import { z } from "zod";

const testSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  model: z.string().min(1, "Model is required"),
  apiKey: z.string().min(1, "API Key is required"),
  prompt: z.string().min(1, "Prompt is required"),
});

class LLMController {
  async testProvider(req, res, next) {
    try {
      // Validate input
      const validatedData = testSchema.parse(req.body);

      // Call service
      const result = await llmService.testConnection({
        providerId: validatedData.provider,
        model: validatedData.model,
        apiKey: validatedData.apiKey,
        prompt: validatedData.prompt,
      });

      // API_SPEC demands normalized success
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.errors[0].message
          }
        });
      }

      if (error instanceof LLMError) {
        // We ALWAYS return 200 with success: false for provider-level tests as per the requirements
        return res.status(200).json({
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        });
      }
      
      // Fallback
      return res.status(200).json({
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message: error.message || "An unexpected error occurred."
        }
      });
    }
  }
}

export const llmController = new LLMController();
