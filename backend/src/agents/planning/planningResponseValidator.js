import { z } from "zod";
import { HttpError } from "../../utils/HttpError.js";

const planningSchema = z.object({
  summary: z.string().default("No summary provided."),
  projectType: z.string().default("Unknown"),
  techStack: z.array(z.string()).default([]),
  frameworks: z.array(z.string()).default([]),
  architectureStyle: z.string().default("Unknown"),
  complexity: z.enum(["low", "medium", "high"]).default("medium"),
  recommendedAgents: z.array(z.enum(["codeReview", "security", "performance", "architecture", "documentation", "improvementRoadmap"])).default(["codeReview"]),
  analysisPriority: z.string().default("General review"),
  estimatedTokenUsage: z.number().int().default(0),
  estimatedAnalysisTime: z.number().int().default(0),
});

export const validatePlanningResponse = (rawResponse) => {
  let jsonString = rawResponse;

  // Clean Markdown formatting (e.g. ```json ... ```)
  if (jsonString.includes("```")) {
    const match = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      jsonString = match[1];
    }
  }

  let parsedJson;
  try {
    parsedJson = JSON.parse(jsonString);
  } catch (err) {
    throw new HttpError(500, "LLM_PARSE_ERROR", "Failed to parse JSON response from LLM.");
  }

  // Validate and apply defaults
  const result = planningSchema.safeParse(parsedJson);

  if (!result.success) {
    // If we fail strictly, we shouldn't crash completely. 
    // Wait, the prompt says "Throwing meaningful validation errors". 
    // We will throw HttpError.
    const errorMessage = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    throw new HttpError(500, "LLM_VALIDATION_ERROR", `LLM response failed schema validation: ${errorMessage}`);
  }

  return result.data;
};
