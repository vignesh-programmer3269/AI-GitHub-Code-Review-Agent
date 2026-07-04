// backend/src/controllers/health.controller.js
import { StatusCodes } from "http-status-codes";

export const getHealth = (req, res) => {
  res.status(StatusCodes.OK).json({
    status: "ok",
    message: "Backend running",
  });
};
