import { getConfig, getPriceTable } from "../config/env";
import { logger } from "../config/logger";
import type { Address } from "@shared/schema";

/**
 * Get price for a specific route/endpoint
 */
export function getPriceForRoute(routeKey: string): bigint {
  const config = getConfig();
  const priceTable = getPriceTable();
  
  // Check route-specific pricing first
  if (priceTable[routeKey]) {
    const price = BigInt(priceTable[routeKey]);
    logger.debug({ routeKey, price: price.toString() }, "Route-specific price");
    return price;
  }
  
  // Fall back to base price
  const basePrice = BigInt(config.BASE_PRICE_USD1);
  logger.debug({ routeKey, price: basePrice.toString() }, "Using base price");
  return basePrice;
}

/**
 * Get recipient address for a specific route
 * Allows per-route recipient overrides (future enhancement)
 */
export function getRecipientForRoute(routeKey: string): Address {
  const config = getConfig();
  
  // Future: could support route-specific recipients from database or config
  // For now, use global recipient
  return config.RECIPIENT as Address;
}

/**
 * Get all configured route prices
 */
export function getAllRoutePrices(): Record<string, string> {
  const config = getConfig();
  const priceTable = getPriceTable();
  
  return {
    ...priceTable,
    _base: config.BASE_PRICE_USD1,
  };
}

/**
 * Validate price amount
 */
export function validatePrice(value: string, expectedPrice: bigint): boolean {
  try {
    const providedPrice = BigInt(value);
    return providedPrice === expectedPrice;
  } catch {
    return false;
  }
}
