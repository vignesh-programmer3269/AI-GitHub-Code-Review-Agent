// backend/src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

const app = express();

// Global middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(apiLimiter);

// API routes – all prefixed with /api
app.use("/api", routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler – must be last
app.use(errorHandler);

export default app;
