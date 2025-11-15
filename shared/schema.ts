import { z } from "zod";

// Hex string types
export type Hex32 = `0x${string}`;  // 32-byte hex (64 chars + 0x)
export type Address = `0x${string}`;  // 20-byte address (40 chars + 0x)
export type TxHash = `0x${string}`;  // 32-byte transaction hash (64 chars + 0x)

// Payment Data - core structure for S402 payments (matches deployed contract struct)
export interface PaymentData {
  owner: Address;     // payer EOA
  value: string;      // decimal string in token units (e.g., "1000000000000000000" for 1 token)
  deadline: number;   // unix seconds
  recipient: Address; // payee the API expects
  nonce: Hex32;       // 32-byte unique id
}

// EIP-712 Signature
export interface Signature {
  v: number;
  r: Hex32;
  s: Hex32;
}

// S402 Proof submitted by client
export interface S402Proof {
  payment: PaymentData;
  permitSig?: Signature;   // EIP-2612 permit signature (optional)
  authSig: Signature;      // EIP-712 PaymentAuthorization signature
  txHash?: TxHash;         // optional: settlement tx hash (32-byte)
}

// Zod schemas for validation
export const hexSchema = z.string().regex(/^0x[0-9a-fA-F]+$/);
export const addressSchema = z.string().regex(/^0x[0-9a-fA-F]{40}$/i) as z.ZodType<Address>;
export const hex32Schema = z.string().regex(/^0x[0-9a-fA-F]{64}$/i) as z.ZodType<Hex32>;
export const txHashSchema = z.string().regex(/^0x[0-9a-fA-F]{64}$/i) as z.ZodType<TxHash>;

export const signatureSchema = z.object({
  v: z.number().int().min(27).max(28),
  r: hex32Schema,
  s: hex32Schema,
}) satisfies z.ZodType<Signature>;

export const paymentDataSchema = z.object({
  owner: addressSchema,
  value: z.string().regex(/^\d+$/), // decimal string
  deadline: z.number().int().positive(),
  recipient: addressSchema,
  nonce: hex32Schema,
}) satisfies z.ZodType<PaymentData>;

export const s402ProofSchema = z.object({
  payment: paymentDataSchema,
  permitSig: signatureSchema.optional(),
  authSig: signatureSchema,
  txHash: txHashSchema.optional(),
}) satisfies z.ZodType<S402Proof>;

// EIP-712 Domain
export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: Address;
}

// EIP-712 Types for PaymentAuthorization (matches deployed contract signature)
export const PAYMENT_AUTHORIZATION_TYPES = {
  PaymentAuthorization: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "recipient", type: "address" },
    { name: "nonce", type: "bytes32" },
  ],
};

// 402 Response payload
export interface PaymentRequired402 {
  error: "PAYMENT_REQUIRED";
  message: string;
  facilitator: Address;
  token: Address;
  chainId: number;
  routeKey: string;
  payment: PaymentData;
  typedData: {
    domain: EIP712Domain;
    types: typeof PAYMENT_AUTHORIZATION_TYPES;
  };
}

// S402 Context attached to Express request after verification
export interface S402Context {
  owner: Address;
  value: bigint;
  payment: PaymentData;
  txHash?: TxHash;
}

// Express Request augmentation
declare global {
  namespace Express {
    interface Request {
      s402?: S402Context;
    }
  }
}

export type InsertUser = { username: string; password: string };
export type User = { id: string; username: string; password: string };
