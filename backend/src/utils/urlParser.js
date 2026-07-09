/**
 * Parses a GitHub repository URL and extracts the owner and repo name.
 * Assumes the URL has already been validated on the frontend.
 */
export const parseRepoUrl = (repoUrl) => {
  try {
    const url = new URL(repoUrl);
    const [, owner, repo] = url.pathname.split("/");
    if (!owner || !repo) {
      throw new Error("Missing owner or repository");
    }
    const cleanRepo = repo.replace(/\/$/, "");
    return { owner, repo: cleanRepo };
  } catch (err) {
    // Throw generic error; controller will convert to HttpError
    throw err;
  }
};
