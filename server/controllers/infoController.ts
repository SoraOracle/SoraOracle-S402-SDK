import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { getConfig, S402_FACILITATOR, USD1_TOKEN } from "../config/env";
import { getPriceForRoute } from "../services/pricingService";
import { formatUSD1 } from "../utils/formatting";

interface EndpointInfo {
  path: string;
  method: string;
  routeKey: string;
  description: string;
  priceUSD1: string;
  priceWei: string;
  requiresPayment: boolean;
}

/**
 * Get S402 system information
 */
export const getInfo = asyncHandler(async (req: Request, res: Response) => {
  const config = getConfig();

  // Define available endpoints
  const endpoints: EndpointInfo[] = [
    {
      path: "/api/v1/tool/example",
      method: "POST",
      routeKey: "tool.example",
      description: "Example pay-gated endpoint that processes arbitrary payloads",
      priceWei: getPriceForRoute("tool.example").toString(),
      priceUSD1: formatUSD1(getPriceForRoute("tool.example")),
      requiresPayment: true,
    },
    {
      path: "/api/v1/tool/analytics",
      method: "GET",
      routeKey: "tool.analytics",
      description: "Get analytics data for your account (time-range query supported)",
      priceWei: getPriceForRoute("tool.analytics").toString(),
      priceUSD1: formatUSD1(getPriceForRoute("tool.analytics")),
      requiresPayment: true,
    },
    {
      path: "/api/health",
      method: "GET",
      routeKey: "health",
      description: "Public health check endpoint",
      priceWei: "0",
      priceUSD1: "0",
      requiresPayment: false,
    },
    {
      path: "/api/info",
      method: "GET",
      routeKey: "info",
      description: "Get S402 system information (this endpoint)",
      priceWei: "0",
      priceUSD1: "0",
      requiresPayment: false,
    },
  ];

  res.json({
    ok: true,
    system: "S402 Payment-Gated API",
    version: "1.0.0",
    chain: {
      id: config.CHAIN_ID,
      name: "BNB Smart Chain",
    },
    contracts: {
      facilitator: S402_FACILITATOR,
      token: USD1_TOKEN,
    },
    recipient: config.RECIPIENT,
    endpoints,
    pricing: {
      token: "USD1",
      decimals: 18,
      defaultPriceWei: config.BASE_PRICE_USD1,
      defaultPriceUSD1: formatUSD1(BigInt(config.BASE_PRICE_USD1)),
    },
  });
});
