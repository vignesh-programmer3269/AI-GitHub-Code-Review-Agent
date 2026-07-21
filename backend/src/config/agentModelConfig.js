/**
 * Internal configuration mapping agents to specific LLM models.
 * This is not exposed to the frontend or to the agents themselves.
 */
export const agentModelConfig = {
  planning: "nvidia/nemotron-3-ultra-550b-a55b:free",
  security: "nvidia/nemotron-3-ultra-550b-a55b:free",
  performance: "nvidia/nemotron-3-ultra-550b-a55b:free",
  architecture: "nvidia/nemotron-3-ultra-550b-a55b:free",
  documentation: "nvidia/nemotron-3-ultra-550b-a55b:free",
  codeReview: "nvidia/nemotron-3-ultra-550b-a55b:free",
  improvementRoadmap: "nvidia/nemotron-3-ultra-550b-a55b:free",
  default: "nvidia/nemotron-3-ultra-550b-a55b:free",
};
