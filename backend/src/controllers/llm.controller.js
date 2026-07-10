import { llmService } from "../services/llm.service.js";
import { z, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import { LLMError } from "../utils/llmErrors.js";

const testSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

class LLMController {
  async testProvider(req, res, next) {
    try {
      const { prompt } = testSchema.parse(req.body);
      const result = await llmService.generateResponse({ prompt });

      return res.status(StatusCodes.OK).json({
        success: true,
        response: result.content
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.errors[0].message
          }
        });
      }
      
      if (error instanceof LLMError) {
        return res.status(StatusCodes.OK).json({
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          code: "LLM_ERROR",
          message: error.message || "Unable to generate response."
        }
      });
    }
  }
}

export const llmController = new LLMController();
