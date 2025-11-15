/**
 * S402 SDK - TypeScript Client for Payment-Gated APIs
 * 
 * This SDK provides automatic 402 payment handling for S402-enabled APIs.
 * 
 * Usage:
 * ```typescript
 * import { S402Client } from "./sdk";
 * import { ethers } from "ethers";
 * 
 * const provider = new ethers.BrowserProvider(window.ethereum);
 * const signer = await provider.getSigner();
 * 
 * const client = new S402Client({
 *   baseUrl: "https://api.example.com",
 *   facilitator: "0x605c5c8d83152bd98ecAc9B77a845349DA3c48a3",
 *   token: "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d",
 *   chainId: 56,
 *   provider,
 *   signer,
 * });
 * 
 * // Automatically handles 402 → sign → settle → retry
 * const result = await client.request("/api/v1/tool/example", {
 *   method: "POST",
 *   body: JSON.stringify({ payload: { foo: "bar" } }),
 * });
 * ```
 */

export {
  S402Client,
  S402_FACILITATOR,
  USD1_TOKEN,
  BNB_CHAIN_ID,
} from "./client";
export type { S402ClientOptions } from "./client";

export {
  buildAuthTypedData,
  signPaymentAuth,
  signPermit,
  checkAllowance,
} from "./payments";

export type {
  PaymentData,
  Signature,
  S402Proof,
  EIP712Domain,
  PaymentRequired402,
  Address,
  Hex32,
  TxHash,
} from "./types";

export { PAYMENT_AUTHORIZATION_TYPES } from "./types";
