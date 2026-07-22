import { z } from "zod";
import { HttpError } from "../../utils/HttpError.js";

const coerceStringArray = z.preprocess((val) => {
  if (typeof val === "string") {
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (Array.isArray(val)) {
    return val.map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item !== null) {
        const values = Object.values(item);
        if (values.length > 0 && typeof values[0] === "string") return values[0];
        return JSON.stringify(item);
      }
      return String(item);
    });
  }
  return [];
}, z.array(z.string()));

const planningSchema = z.object({
  repositoryName: z.string(),
  repositoryOwner: z.string(),
  repositoryType: z.string(),
  repositorySummary: z.string(),
  architectureSummary: z.string(),
  folderOrganization: z.string(),
  complexity: z.enum(["Simple", "Moderate", "Medium", "Complex", "Enterprise"]),
  repositoryHealth: z.object({
    score: z.number().min(0).max(100),
    reason: z.string()
  }),
  technologyStack: z.object({
    frontend: coerceStringArray.default([]),
    backend: coerceStringArray.default([]),
    database: coerceStringArray.default([]),
    frameworks: coerceStringArray.default([]),
    libraries: coerceStringArray.default([]),
    runtime: coerceStringArray.default([]),
    packageManager: coerceStringArray.default([]),
    buildTool: coerceStringArray.default([]),
    deployment: coerceStringArray.default([]),
    ciCd: coerceStringArray.default([]),
    containerization: coerceStringArray.default([])
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
    description: z.string(),
    info: z.object({
      purpose: z.string(),
      analyzes: z.string(),
      typicalOutput: z.string(),
      recommendationReason: z.string()
    })
  })).default([])
});

export const validatePlanningResponse = (rawResponse, profiler = { start: () => {}, end: () => {} }) => {
  let jsonString = rawResponse;

  profiler.start("Response Parsing");
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
    profiler.end("Response Parsing");
    console.error("RAW JSON STRING FAILED PARSE:", jsonString);
    throw new HttpError(500, "LLM_PARSE_ERROR", "Failed to parse JSON response from LLM. Raw Output: " + jsonString.substring(0, 500));
  }
  profiler.end("Response Parsing");

  // Validate and apply defaults
  profiler.start("Response Validation");
  const result = planningSchema.safeParse(parsedJson);

  if (!result.success) {
    profiler.end("Response Validation");
    // If we fail strictly, we shouldn't crash completely. 
    // Wait, the prompt says "Throwing meaningful validation errors". 
    // We will throw HttpError.
    const errorMessage = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    console.error("ZOD VALIDATION FAILED. RAW JSON WAS:", jsonString);
    throw new HttpError(500, "LLM_VALIDATION_ERROR", `LLM response failed schema validation: ${errorMessage}`);
  }
  profiler.end("Response Validation");

  return result.data;
};
