/**
 * Builds the prompts and schema for the Planning Agent.
 * This is a pure function that prepares data for the LLM.
 *
 * @param {Object} planningContext The optimized context from PlanningContextBuilder
 * @returns {Object} An object containing systemPrompt, userPrompt, and expectedSchema
 */
export const buildPlanningPrompt = (planningContext) => {
  const systemPrompt = `You are an expert Software Architect and Repository Analyst.
Your goal is to thoroughly analyze the provided repository context and produce a structured architectural plan.

You must:
1. Understand the repository's main purpose.
2. Identify the core technology stack, programming languages, and frameworks.
3. Determine the architectural style and overall complexity.
4. Recommend which specialized agents should be executed based on the project's nature.
5. Provide a health score and detailed technology stack breakdown.

You must respond EXCLUSIVELY in valid JSON that strictly matches the expected schema. Do not include markdown formatting or extra text outside of the JSON block.`;

  const userPrompt = `Please analyze the following repository context and provide your architectural plan as a JSON object:

${JSON.stringify(planningContext, null, 2)}`;

  const expectedSchema = {
    type: "object",
    properties: {
      repositoryName: { type: "string" },
      repositoryOwner: { type: "string" },
      repositoryType: {
        type: "string",
        enum: [
          "Frontend", "Backend", "Full Stack", "CLI", "Library", "Package",
          "Microservice", "AI Application", "AI Agent", "Browser Extension",
          "Mobile App", "Desktop App", "Script", "Framework", "SDK", "Other"
        ]
      },
      repositorySummary: {
        type: "string",
        description: "2-4 concise paragraphs explaining what the repository does, its purpose, and major functionality."
      },
      architectureSummary: {
        type: "string",
        description: "Describe the architecture style, folder organization, project organization, and overall design."
      },
      complexity: {
        type: "string",
        enum: ["Simple", "Moderate", "Complex", "Enterprise"]
      },
      repositoryHealth: {
        type: "object",
        properties: {
          score: { type: "number", description: "0-100" },
          reason: { type: "string" }
        },
        required: ["score", "reason"]
      },
      technologyStack: {
        type: "object",
        properties: {
          frontend: { type: "array", items: { type: "string" } },
          backend: { type: "array", items: { type: "string" } },
          database: { type: "array", items: { type: "string" } },
          frameworks: { type: "array", items: { type: "string" } },
          libraries: { type: "array", items: { type: "string" } },
          runtime: { type: "array", items: { type: "string" } },
          packageManager: { type: "array", items: { type: "string" } },
          buildTool: { type: "array", items: { type: "string" } },
          deployment: { type: "array", items: { type: "string" } },
          ciCd: { type: "array", items: { type: "string" } },
          containerization: { type: "array", items: { type: "string" } }
        },
        required: [
          "frontend", "backend", "database", "frameworks", "libraries", 
          "runtime", "packageManager", "buildTool", "deployment", "ciCd", "containerization"
        ]
      },
      recommendedAnalyses: {
        type: "array",
        items: {
          type: "object",
          properties: {
            agentId: {
              type: "string",
              enum: ["codeReview", "security", "performance", "architecture", "documentation", "improvementRoadmap"]
            },
            agentName: { type: "string" },
            priority: { type: "string", enum: ["Critical", "High", "Medium", "Low"] },
            selectedByDefault: { type: "boolean" },
            estimatedDuration: { type: "string" },
            estimatedTokens: { type: "number" },
            description: { type: "string" }
          },
          required: [
            "agentId", "agentName", "priority", "selectedByDefault", 
            "estimatedDuration", "estimatedTokens", "description"
          ]
        }
      }
    },
    required: [
      "repositoryName", "repositoryOwner", "repositoryType", 
      "repositorySummary", "architectureSummary", "complexity", 
      "repositoryHealth", "technologyStack", "recommendedAnalyses"
    ],
    additionalProperties: false,
  };

  return {
    systemPrompt,
    userPrompt,
    expectedSchema,
  };
};
