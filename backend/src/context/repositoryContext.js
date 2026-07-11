/**
 * Factory function to create a new RepositoryContext.
 * Conforms exactly to the shape defined in CONTEXT_ENGINE.md.
 * 
 * @param {Object} params
 * @returns {Object} RepositoryContext
 */
export const createRepositoryContext = ({
  sessionId,
  repoUrl,
  owner,
  repo,
  defaultBranch,
  metadata = {},
  fileTree = [],
  fileHashes = {},
  readme = null,
}) => {
  const now = new Date().toISOString();
  return {
    sessionId,
    repoUrl,
    owner,
    repo,
    defaultBranch,
    metadata: {
      description: metadata.description || "",
      stars: metadata.stars || 0,
      forks: metadata.forks || 0,
      license: metadata.license || null,
      topics: metadata.topics || [],
      sizeKb: metadata.sizeKb || 0,
      languages: metadata.languages || [],
      createdAt: metadata.createdAt || now,
      lastPushAt: metadata.lastPushAt || now,
    },
    fileTree,
    fileHashes,
    fileSummaries: {},
    rawFileCache: {},
    readme,
    planningResult: null,
    createdAt: now,
    lastAccessedAt: now,
  };
};
