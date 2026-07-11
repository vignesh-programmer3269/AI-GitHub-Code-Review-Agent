import { Router } from "express";
import { getContext } from "../controllers/getContext.controller.js";

const router = Router();

router.get("/debug/context/:sessionId", getContext);

export default router;
