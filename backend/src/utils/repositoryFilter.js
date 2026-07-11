
const excludedDirectories = [
  ".git",
  "node_modules",
  "dist",
  "build",
  "vendor",
  "coverage",
  ".next",
  "__pycache__",
];

const binaryAndMediaExtensions = [
  // Images
  ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp", ".bmp", ".tiff",
  // Fonts
  ".ttf", ".otf", ".woff", ".woff2", ".eot",
  // Archives
  ".zip", ".tar", ".gz", ".rar", ".7z",
  // Compiled / Binary
  ".exe", ".dll", ".so", ".dylib", ".class", ".pyc", ".pdf", ".bin",
  // Audio/Video
  ".mp3", ".mp4", ".wav", ".avi", ".mov", ".mkv",
];

const lockFiles = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "Gemfile.lock",
  "poetry.lock",
];

/**
 * Returns true if a path is fully excluded from the repository file tree.
 * Applies to system directories, build outputs, and binaries.
 * @param {string} filePath
 * @returns {boolean}
 */
export const isExcludedFromTree = (filePath) => {
  if (!filePath) return true;
  
  const parts = filePath.split("/");
  // Check if any part of the path is an excluded directory
  for (const part of parts) {
    if (excludedDirectories.includes(part)) {
      return true;
    }
  }

  // Check file extension
  const lowerPath = filePath.toLowerCase();
  for (const ext of binaryAndMediaExtensions) {
    if (lowerPath.endsWith(ext)) {
      return true;
    }
  }

  return false;
};

/**
 * Returns true if a path should be excluded from raw content fetching.
 * This includes everything excluded from the tree, PLUS lock files.
 * @param {string} filePath
 * @returns {boolean}
 */
export const isExcludedFromContent = (filePath) => {
  if (isExcludedFromTree(filePath)) {
    return true;
  }

  const parts = filePath.split("/");
  const fileName = parts[parts.length - 1];

  if (lockFiles.includes(fileName)) {
    return true;
  }

  return false;
};
