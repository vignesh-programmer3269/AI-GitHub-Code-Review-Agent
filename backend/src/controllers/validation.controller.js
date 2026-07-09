// backend/src/controllers/validation.controller.js
import { StatusCodes } from "http-status-codes";
import { z, ZodError } from "zod";
import { parseRepoUrl } from "../utils/urlParser.js";
import { getRepoMetadata } from "../services/github.service.js";
import { HttpError } from "../utils/HttpError.js";

// Request payload schema – frontend already validates, but we guard against empty strings.
const validationSchema = z.object({
  repoUrl: z.string().min(1, "repoUrl is required"),
});

export const validateRepo = async (req, res, next) => {
  try {
    // Validate payload shape
    const { repoUrl } = validationSchema.parse(req.body);

    // Extract owner/repo from URL
    const { owner, repo } = parseRepoUrl(repoUrl);

    // Call GitHub for repository metadata
    const metadata = await getRepoMetadata(owner, repo);

    // Build response payload expected by the frontend
    const responsePayload = {
      success: true,
      message: "Repository validated successfully.",
      data: {
        owner,
        repository: repo,
        name: metadata.name,
        description: metadata.description,
        defaultBranch: metadata.default_branch,
        stars: metadata.stargazers_count,
        forks: metadata.forks_count,
        language: metadata.language,
        visibility: metadata.private ? "private" : "public",
      },
    };

    res.status(StatusCodes.OK).json(responsePayload);
  } catch (err) {
    if (err instanceof ZodError) {
      // Should never hit because frontend validates, but safe fallback
      return next(
        new HttpError(
          StatusCodes.BAD_REQUEST,
          "VALIDATION_ERROR",
          "Invalid request payload.",
        ),
      );
    }
    // Propagate HttpError from service or parsing utilities
    return next(err);
  }
};
