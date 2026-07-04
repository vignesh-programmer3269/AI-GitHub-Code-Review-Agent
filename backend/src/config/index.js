import dotenv from "dotenv";

dotenv.config();

export const config = {
  host: process.env.HOST || "localhost",
  port: process.env.PORT || 3001,
  env: process.env.NODE_ENV || "development",
  githubPat: process.env.GITHUB_PAT,
};
