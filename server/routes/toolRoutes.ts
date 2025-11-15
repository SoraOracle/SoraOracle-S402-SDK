import { Router } from "express";
import { requireS402 } from "../middleware/s402Middleware";
import * as toolController from "../controllers/toolController";
import * as infoController from "../controllers/infoController";

const router = Router();

// Public endpoints (no payment required)
router.get("/health", toolController.healthCheck);
router.get("/v1/health", toolController.healthCheck);
router.get("/info", infoController.getInfo);
router.get("/v1/info", infoController.getInfo);

// Pay-gated endpoints (requireS402 middleware verifies payment or returns 402)
router.post("/v1/tool/example", requireS402("tool.example"), toolController.runExample);
router.get("/v1/tool/analytics", requireS402("tool.analytics"), toolController.analytics);

export default router;
