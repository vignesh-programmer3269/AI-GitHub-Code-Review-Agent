import { contextEngine } from "../context/contextEngine.js";

export const getContext = (req, res) => {
  const context = contextEngine.getContext(req.params.sessionId);

  if (!context) {
    return res.status(404).json({
      success: false,
      message: "Session not found",
    });
  }

  return res.json({
    success: true,
    context,
  });
};
