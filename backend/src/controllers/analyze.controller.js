import { StatusCodes } from "http-status-codes";
import { z, ZodError } from "zod";
import { contextEngine } from "../context/contextEngine.js";
import { planningAgent } from "../agents/planning/planningAgent.js";
import { HttpError } from "../utils/HttpError.js";

const analyzeSchema = z.object({
  repoUrl: z.string().min(1, "repoUrl is required"),
});

export const analyzeRepo = async (req, res, next) => {
  try {
    const { repoUrl } = analyzeSchema.parse(req.body);
    const sessionId = await contextEngine.initializeRepository(repoUrl);
    const result = await planningAgent.run(sessionId);

    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      return next(
        new HttpError(
          StatusCodes.BAD_REQUEST,
          "VALIDATION_ERROR",
          "Invalid request payload.",
        ),
      );
    }
    return next(err);
  }
};
