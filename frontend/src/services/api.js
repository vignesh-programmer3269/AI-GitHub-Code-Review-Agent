import axios from "axios";
import { config } from "../config/constants";

const api = axios.create({
  baseURL: `${config.apiBaseUrl}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const repoService = {
  validate: async (url) => {
    const response = await api.post("/repo/validate", { repoUrl: url });
    return response.data;
  },
  analyze: async (url) => {
    const response = await api.post("/repo/analyze", { repoUrl: url });
    return response.data;
  }
};

export const llmService = {
  testProvider: async (provider, model, apiKey) => {
    // The backend uses provider, model, apiKey, and a simple prompt
    const response = await api.post("/llm/test", {
      provider,
      model,
      apiKey,
      prompt: "You are an AI assistant.\n\nSummarize the following repository metadata.\n\nRepository Name: AI GitHub Code Review Agent\n\nPrimary Language: JavaScript\n\nDescription: AI powered GitHub repository analyzer."
    });
    return response.data;
  }
};

export default api;
