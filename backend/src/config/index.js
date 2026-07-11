import dotenv from "dotenv";

dotenv.config();

export const config = {
  host: process.env.HOST || "localhost",
  port: process.env.PORT || 8000,
  env: process.env.NODE_ENV || "development",
  githubPat: process.env.GITHUB_PAT,
  puterApiKey: process.env.PUTER_API_KEY,
  sessionTtlMinutes: parseInt(process.env.SESSION_TTL_MINUTES, 10) || 30,
  maxFileContentBytes: parseInt(process.env.MAX_FILE_CONTENT_BYTES, 10) || 51200,
  maxRepoFilesConsidered: parseInt(process.env.MAX_REPO_FILES_CONSIDERED, 10) || 5000,
  maxRepoSizeKb: parseInt(process.env.MAX_REPO_SIZE_KB, 10) || 512000,
};
