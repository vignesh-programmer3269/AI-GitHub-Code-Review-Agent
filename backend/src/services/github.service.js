import axios from "axios";
import { HttpError } from "../utils/HttpError.js";
import { config } from "../config/index.js";

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  timeout: 8000,
  headers: {
    Accept: "application/vnd.github.v3+json",
    Authorization: config.githubPat ? `token ${config.githubPat}` : undefined,
  },
});

/**
 * Retrieves lightweight repository metadata from GitHub.
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<Object>} repository data
 */
export const getRepoMetadata = async (owner, repo) => {
  try {
    const { data } = await githubApi.get(`/repos/${owner}/${repo}`);
    return data;
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;
      if (status === 404) {
        throw new HttpError(
          404,
          "REPO_NOT_FOUND",
          "Repository not found or is private.",
        );
      }
      if (status === 403 && data?.message?.includes("rate limit")) {
        throw new HttpError(
          429,
          "RATE_LIMIT_EXCEEDED",
          "GitHub API rate limit exceeded.",
        );
      }
      throw new HttpError(
        status,
        `GITHUB_${status}`,
        data?.message || "GitHub request failed.",
      );
    }
    // network or timeout errors
    throw new HttpError(
      503,
      "GITHUB_UNAVAILABLE",
      "Unable to connect to GitHub.",
    );
  }
};
