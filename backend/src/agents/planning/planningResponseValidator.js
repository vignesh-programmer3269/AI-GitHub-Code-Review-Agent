import { z } from "zod";
import { HttpError } from "../../utils/HttpError.js";

const planningSchema = z.object({
  repositoryName: z.string().default("Unknown Repository"),
  repositoryOwner: z.string().default("Unknown Owner"),
  repositoryType: z.string().default("Other"),
  repositorySummary: z.string().default("No summary provided."),
  architectureSummary: z.string().default("No architecture summary provided."),
  complexity: z.enum(["Simple", "Moderate", "Complex", "Enterprise"]).default("Moderate"),
  repositoryHealth: z.object({
    score: z.number().min(0).max(100).default(50),
    reason: z.string().default("No health reason provided.")
  }).default({ score: 50, reason: "No health reason provided." }),
  technologyStack: z.object({
    frontend: z.array(z.string()).default([]),
    backend: z.array(z.string()).default([]),
    database: z.array(z.string()).default([]),
    frameworks: z.array(z.string()).default([]),
    libraries: z.array(z.string()).default([]),
    runtime: z.array(z.string()).default([]),
    packageManager: z.array(z.string()).default([]),
    buildTool: z.array(z.string()).default([]),
    deployment: z.array(z.string()).default([]),
    ciCd: z.array(z.string()).default([]),
    containerization: z.array(z.string()).default([])
  }).default({
    frontend: [], backend: [], database: [], frameworks: [], libraries: [],
    runtime: [], packageManager: [], buildTool: [], deployment: [], ciCd: [], containerization: []
  }),
  recommendedAnalyses: z.array(z.object({
    agentId: z.enum(["codeReview", "security", "performance", "architecture", "documentation", "improvementRoadmap"]),
    agentName: z.string(),
    priority: z.enum(["Critical", "High", "Medium", "Low"]),
    selectedByDefault: z.boolean(),
    estimatedDuration: z.string(),
    estimatedTokens: z.number().int(),
    description: z.string()
  })).default([])
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
