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
    handleGithubError(err);
  }
};
/**
 * Retrieves repository languages.
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<Array>} languages
 */
export const getRepoLanguages = async (owner, repo) => {
  try {
    const { data } = await githubApi.get(`/repos/${owner}/${repo}/languages`);
    // Format: { "JavaScript": 1234, "HTML": 567 }
    const totalBytes = Object.values(data).reduce((acc, bytes) => acc + bytes, 0);
    return Object.entries(data).map(([language, bytes]) => ({
      language,
      bytes,
      percentage: totalBytes > 0 ? (bytes / totalBytes) * 100 : 0
    }));
  } catch (err) {
    handleGithubError(err);
  }
};

/**
 * Retrieves recursive file tree.
 * @param {string} owner
 * @param {string} repo
 * @param {string} branch
 * @returns {Promise<Array>} file tree
 */
export const getRepoTree = async (owner, repo, branch) => {
  try {
    const { data } = await githubApi.get(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
    return data.tree; // array of tree objects
  } catch (err) {
    handleGithubError(err);
  }
};

/**
 * Retrieves the raw README.
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<string|null>} readme content
 */
export const getRepoReadme = async (owner, repo) => {
  try {
    const { data } = await githubApi.get(`/repos/${owner}/${repo}/readme`, {
      headers: {
        Accept: "application/vnd.github.v3.raw"
      }
    });
    return data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null; // README not found is acceptable
    }
    handleGithubError(err);
  }
};

function handleGithubError(err) {
  if (err.response) {
    const { status, data } = err.response;
    if (status === 404) {
      throw new HttpError(404, "REPO_NOT_FOUND", "Repository not found or is private.");
    }
    if (status === 403 && data?.message?.includes("rate limit")) {
      throw new HttpError(429, "RATE_LIMIT_EXCEEDED", "GitHub API rate limit exceeded.");
    }
    throw new HttpError(status, `GITHUB_${status}`, data?.message || "GitHub request failed.");
  }
  throw new HttpError(503, "GITHUB_UNAVAILABLE", "Unable to connect to GitHub.");
}
