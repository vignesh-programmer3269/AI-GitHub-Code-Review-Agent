/**
 * Internal configuration mapping agents to specific LLM models.
 * This is not exposed to the frontend or to the agents themselves.
 */
export const agentModelConfig = {
  planning: "openai/gpt-5.6-sol",
  security: "anthropic/claude-opus-4-8",
  performance: "openai/gpt-5.6-sol-pro",
  architecture: "openai/gpt-5.6-sol-pro",
  documentation: "openai/gpt-5.5",
  codeReview: "anthropic/claude-fable-5",
  improvementRoadmap: "openai/gpt-5.6-sol-pro",
  default: "openai/gpt-5.6-sol-pro",
};
