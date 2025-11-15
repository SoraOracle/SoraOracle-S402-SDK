import { ethers } from "ethers";

/**
 * Convert bigint to decimal string (for JSON serialization)
 */
export function bigintToString(value: bigint): string {
  return value.toString();
}

/**
 * Parse decimal string to bigint
 */
export function stringToBigint(value: string): bigint {
  if (!/^\d+$/.test(value)) {
    throw new Error(`Invalid decimal string: ${value}`);
  }
  return BigInt(value);
}

/**
 * Format USD1 amount (18 decimals) to human-readable
 */
export function formatUSD1(value: bigint | string): string {
  const bn = typeof value === "string" ? stringToBigint(value) : value;
  return ethers.formatUnits(bn, 18);
}

/**
 * Parse human-readable USD1 amount to wei string
 */
export function parseUSD1(value: string): string {
  return ethers.parseUnits(value, 18).toString();
}

/**
 * Normalize address to lowercase
 */
export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}
