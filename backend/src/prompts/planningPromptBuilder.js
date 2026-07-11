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
4. Recommend which specialized agents should be executed (e.g., codeReview, security, performance, architecture, documentation, improvementRoadmap) based on the project's nature.
5. Determine the priority of these analyses.
6. Provide a rough estimate of token usage and analysis time (for informational purposes).

You must respond EXCLUSIVELY in valid JSON that strictly matches the expected schema. Do not include markdown formatting or extra text outside of the JSON block.`;

  const userPrompt = `Please analyze the following repository context and provide your architectural plan as a JSON object:

${JSON.stringify(planningContext, null, 2)}`;

  const expectedSchema = {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "A brief 2-3 sentence summary of the project's purpose.",
      },
      projectType: {
        type: "string",
        description:
          "The type of project (e.g., 'Web Application', 'Library', 'CLI Tool', 'API').",
      },
      techStack: {
        type: "array",
        items: { type: "string" },
        description:
          "List of primary programming languages and core technologies.",
      },
      frameworks: {
        type: "array",
        items: { type: "string" },
        description:
          "List of detected frameworks (e.g., 'React', 'Express', 'Django', 'Spring Boot').",
      },
      architectureStyle: {
        type: "string",
        description:
          "The detected architectural style (e.g., 'Monolith', 'Microservices', 'Serverless').",
      },
      complexity: {
        type: "string",
        enum: ["low", "medium", "high"],
        description:
          "Estimated complexity of the repository based on folder structure and tech stack.",
      },
      recommendedAgents: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "codeReview",
            "security",
            "performance",
            "architecture",
            "documentation",
            "improvementRoadmap",
          ],
        },
        description:
          "Which specialized agents are highly recommended for this repository.",
      },
      analysisPriority: {
        type: "string",
        description:
          "A short sentence explaining which area should be prioritized during code review.",
      },
      estimatedTokenUsage: {
        type: "number",
        description:
          "A rough integer estimate of how many tokens a full review might consume (e.g., 50000).",
      },
      estimatedAnalysisTime: {
        type: "number",
        description:
          "A rough integer estimate in seconds for the full analysis pipeline.",
      },
    },
    required: [
      "summary",
      "projectType",
      "techStack",
      "frameworks",
      "architectureStyle",
      "complexity",
      "recommendedAgents",
      "analysisPriority",
      "estimatedTokenUsage",
      "estimatedAnalysisTime",
    ],
    additionalProperties: false,
  };

  return {
    systemPrompt,
    userPrompt,
    expectedSchema,
  };
};
