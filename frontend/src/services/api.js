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
  // analyze: async (url) => api.post('/repo/analyze', { url }), // uncomment for future
};

export default api;
