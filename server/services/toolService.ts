import { logger } from "../config/logger";
import type { Address } from "@shared/schema";

interface RunExampleParams {
  caller: Address;
  payload?: any;
}

interface ExampleResult {
  echo: any;
  caller: Address;
  processedAt: number;
  message: string;
}

/**
 * Example business logic for a pay-gated endpoint
 * This is where you'd implement your actual API functionality
 */
export async function runExampleTool(params: RunExampleParams): Promise<ExampleResult> {
  const { caller, payload } = params;
  
  logger.info({ caller, payload }, "Running example tool");
  
  // Simulate some processing
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    echo: payload ?? null,
    caller,
    processedAt: Date.now(),
    message: "Example tool executed successfully! Payment verified on-chain.",
  };
}

/**
 * Another example endpoint - analytics query
 */
export async function getAnalytics(params: { caller: Address; timeRange?: string }) {
  logger.info({ caller: params.caller }, "Fetching analytics");
  
  return {
    caller: params.caller,
    stats: {
      apiCalls: 42,
      totalSpent: "15000000000000000", // 0.015 USD1
      averageResponseTime: 250,
    },
    timeRange: params.timeRange || "7d",
  };
}
