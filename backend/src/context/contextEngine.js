import { v4 as uuidv4 } from "uuid";
import {
  getRepoMetadata,
  getRepoLanguages,
  getRepoTree,
  getRepoReadme,
} from "../services/github.service.js";
import { createRepositoryContext } from "./repositoryContext.js";
import { sessionService } from "../services/session.service.js";
import { isExcludedFromTree } from "../utils/repositoryFilter.js";
import { parseRepoUrl } from "../utils/urlParser.js";
import { HttpError } from "../utils/HttpError.js";
import { config } from "../config/index.js";

class ContextEngine {
  /**
   * Creates and initializes a new RepositoryContext.
   * @param {string} repoUrl
   * @returns {Promise<string>} sessionId
   */
  async initializeRepository(repoUrl) {
    const { owner, repo } = parseRepoUrl(repoUrl);

    const metadata = await getRepoMetadata(owner, repo);

    // Size limit check
    if (metadata.size > config.maxRepoSizeKb) {
      throw new HttpError(
        422,
        "REPO_TOO_LARGE",
        `Repository exceeds the size limit of ${config.maxRepoSizeKb} KB.`,
      );
    }

    const defaultBranch = metadata.default_branch;

    const [languages, rawTree, readme] = await Promise.all([
      getRepoLanguages(owner, repo),
      getRepoTree(owner, repo, defaultBranch),
      getRepoReadme(owner, repo),
    ]);

    // Filter tree and build file hashes
    const filteredTree = [];
    const fileHashes = {};

    if (rawTree && rawTree.length) {
      for (const item of rawTree) {
        if (!isExcludedFromTree(item.path)) {
          filteredTree.push({
            path: item.path,
            type: item.type === "tree" ? "dir" : "file",
            sizeBytes: item.size !== undefined ? item.size : null,
          });

          if (item.type !== "tree") {
            fileHashes[item.path] = item.sha;
          }
        }
      }
    }

    const sessionId = uuidv4();

    const context = createRepositoryContext({
      sessionId,
      repoUrl,
      owner,
      repo,
      defaultBranch,
      metadata: {
        description: metadata.description,
        stars: metadata.stargazers_count,
        forks: metadata.forks_count,
        license: metadata.license?.name,
        topics: metadata.topics,
        sizeKb: metadata.size,
        languages: languages,
        createdAt: metadata.created_at,
        lastPushAt: metadata.pushed_at,
      },
      fileTree: filteredTree,
      fileHashes,
      readme,
    });

    const now = new Date().toISOString();
    const analysisSession = {
      sessionId,
      repositoryContext: context,
      agentResults: {
        planning: null,
        security: null,
        performance: null,
        architecture: null,
        documentation: null,
        improvementRoadmap: null,
        codeReview: null,
      },
      createdAt: now,
      lastAccessedAt: now,
    };

    sessionService.create(sessionId, analysisSession);
    return sessionId;
  }

  getContext(sessionId) {
    const context = sessionService.read(sessionId);
    if (context) {
      this.touchContext(sessionId);
    }
    return context;
  }

  updateContext(sessionId, partialUpdate) {
    const updated = sessionService.update(sessionId, partialUpdate);
    if (updated) {
      this.touchContext(sessionId);
    }
    return updated;
  }

  updateAgentResult(sessionId, agentName, result) {
    const session = this.getContext(sessionId);
    if (session) {
      session.agentResults[agentName] = result;
      this.updateContext(sessionId, { agentResults: session.agentResults });
    }
  }

  deleteContext(sessionId) {
    return sessionService.delete(sessionId);
  }

  touchContext(sessionId) {
    sessionService.touch(sessionId);
  }
}

export const contextEngine = new ContextEngine();
