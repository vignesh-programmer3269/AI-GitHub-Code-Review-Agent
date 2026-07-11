import path from "path";

/**
 * List of important configuration or dependency files that should be included
 * in the planning context regardless of their depth in the repository.
 */
const IMPORTANT_FILES = new Set([
  "package.json",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "tsconfig.json",
  "docker-compose.yml",
  "docker-compose.yaml",
  "Dockerfile",
  "requirements.txt",
  "Pipfile",
  "Pipfile.lock",
  "pyproject.toml",
  "Cargo.toml",
  "Cargo.lock",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "Gemfile",
  "Gemfile.lock",
  "go.mod",
  "go.sum",
  "composer.json",
  "composer.lock",
]);

/**
 * Transforms the full RepositoryContext into a minimal, token-optimized context
 * suitable for the Planning Agent.
 *
 * @param {Object} repositoryContext The full repository context
 * @returns {Object} A minimized context object for planning
 */
export const buildPlanningContext = (repositoryContext) => {
  const { metadata, readme, defaultBranch, fileTree } = repositoryContext;

  // Filter the file tree to include only:
  // 1. All directories (to understand folder structure)
  // 2. All top-level files
  // 3. Important dependency and configuration files (regardless of depth)
  const filteredTree = fileTree.filter((item) => {
    if (item.type === "dir") return true;

    // Top-level file check
    const isTopLevel = !item.path.includes("/");
    if (isTopLevel) return true;

    // Important file check
    const fileName = item.path.split("/").pop();
    if (IMPORTANT_FILES.has(fileName)) return true;

    return false;
  });

  // Create a minimal representation of the file tree
  const simplifiedTree = filteredTree.map((item) => ({
    path: item.path,
    type: item.type,
  }));

  // Truncate README to a reasonable length to save tokens (e.g., 15,000 characters)
  const MAX_README_LENGTH = 15000;
  const truncatedReadme =
    readme && readme.length > MAX_README_LENGTH
      ? readme.substring(0, MAX_README_LENGTH) +
        "\n\n...[README truncated for length]"
      : readme;

  return {
    metadata: {
      description: metadata.description,
      stars: metadata.stars,
      forks: metadata.forks,
      topics: metadata.topics,
      languages: metadata.languages,
    },
    defaultBranch,
    readme: truncatedReadme,
    folderStructure: simplifiedTree,
  };
};
