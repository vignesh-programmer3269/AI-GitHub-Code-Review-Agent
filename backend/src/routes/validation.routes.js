import { Router } from "express";
import { validateRepo } from "../controllers/validation.controller.js";

const router = Router();

router.post("/repo/validate", validateRepo);

export default router;
