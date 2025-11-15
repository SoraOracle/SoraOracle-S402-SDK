import { Request, Response } from "express";
import { runExampleTool, getAnalytics } from "../services/toolService";
import { asyncHandler } from "../middleware/errorHandler";

/**
 * Example pay-gated endpoint handler
 * 
 * NOTE: This handler is wrapped by requireS402("tool.example") middleware
 * which ensures payment is verified BEFORE this function runs.
 * If no valid payment proof is provided, the middleware returns 402 Payment Required.
 * Only successfully paid requests reach this handler.
 */
export const runExample = asyncHandler(async (req: Request, res: Response) => {
  // S402 context is guaranteed to exist because requireS402 middleware verified payment
  const { owner } = req.s402!;
  const payload = req.body?.payload;
  
  const result = await runExampleTool({ caller: owner, payload });
  
  res.json({
    ok: true,
    result,
  });
});

/**
 * Analytics endpoint
 * 
 * NOTE: This handler is wrapped by requireS402("tool.analytics") middleware
 * which ensures payment is verified BEFORE this function runs.
 */
export const analytics = asyncHandler(async (req: Request, res: Response) => {
  const { owner } = req.s402!;
  const timeRange = req.query.timeRange as string | undefined;
  
  const result = await getAnalytics({ caller: owner, timeRange });
  
  res.json({
    ok: true,
    data: result,
  });
});

/**
 * Health check endpoint (no payment required)
 */
export const healthCheck = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    ok: true,
    service: "S402 Payment-Gated API",
    timestamp: Date.now(),
  });
});
