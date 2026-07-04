// backend/src/middleware/notFound.js
import { HttpError } from "../utils/HttpError.js";
import { StatusCodes } from "http-status-codes";

export const notFoundHandler = (req, _res, next) => {
  next(
    new HttpError(
      StatusCodes.NOT_FOUND,
      "NOT_FOUND",
      `Cannot ${req.method} ${req.originalUrl}`
    )
  );
};
