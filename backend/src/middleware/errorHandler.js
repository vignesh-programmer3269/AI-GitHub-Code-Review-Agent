import { StatusCodes } from "http-status-codes";

/**
 * Global error handling middleware.
 * All errors (including HttpError) end up here.
 */
export const errorHandler = (err, _req, res, _next) => {
  const status = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const code = err.code || "INTERNAL_ERROR";

  const response = {
    success: false,
    error: {
      code,
      message: err.message || "An unexpected error occurred.",
    },
  };

  // Only expose details in development
  if (process.env.NODE_ENV === "development" && err.details) {
    response.error.details = err.details;
  }

  res.status(status).json(response);
};
