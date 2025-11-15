import { randomBytes } from "crypto";
import type { Hex32 } from "@shared/schema";

/**
 * Generate a cryptographically random 32-byte nonce
 */
export function generateNonce(): Hex32 {
  return `0x${randomBytes(32).toString("hex")}` as Hex32;
}

/**
 * Ensure hex string has 0x prefix
 */
export function ensureHexPrefix(hex: string): string {
  return hex.startsWith("0x") ? hex : `0x${hex}`;
}

/**
 * Validate hex string format
 */
export function isValidHex(hex: string, bytes?: number): boolean {
  if (!hex.startsWith("0x")) return false;
  const hexDigits = hex.slice(2);
  if (bytes && hexDigits.length !== bytes * 2) return false;
  return /^[0-9a-fA-F]+$/.test(hexDigits);
}
