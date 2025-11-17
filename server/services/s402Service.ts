import { ethers } from "ethers";
import { generateNonce } from "../utils/crypto";
import { getChainId, S402_FACILITATOR } from "../config/env";
import { verifyTransactionSettlement } from "./blockchainService";
import { logger } from "../config/logger";
import type {
  PaymentData,
  EIP712Domain,
  S402Proof,
  Address,
  Hex32,
  S402Context,
} from "@shared/schema";
import { PAYMENT_AUTHORIZATION_TYPES } from "@shared/schema";

/**
 * Build EIP-712 domain (doesn't mutate payment data)
 */
function buildEIP712Domain(): EIP712Domain {
  return {
    name: "S402Facilitator",
    version: "1",
    chainId: getChainId(),
    verifyingContract: S402_FACILITATOR as Address,
  };
}

interface PaymentRequestParams {
  routeKey: string;
  price: bigint;
  recipient: Address;
  owner?: Address | null;
}

interface PaymentRequestResult {
  payment: PaymentData;
  domain: EIP712Domain;
  types: typeof PAYMENT_AUTHORIZATION_TYPES;
}

/**
 * Build a payment request with EIP-712 typed data
 */
export function buildPaymentRequest(params: PaymentRequestParams): PaymentRequestResult {
  const chainId = getChainId();
  
  // Generate payment parameters
  const deadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now
  const nonce = generateNonce();
  
  const payment: PaymentData = {
    owner: params.owner || ("0x0000000000000000000000000000000000000000" as Address),
    value: params.price.toString(),
    deadline,
    recipient: params.recipient,
    nonce,
  };
  
  const domain = buildEIP712Domain();
  
  logger.debug({ payment, domain }, "Built payment request");
  
  return {
    payment,
    domain,
    types: PAYMENT_AUTHORIZATION_TYPES,
  };
}

/**
 * Compute payment hash (for logging/debugging)
 */
export function computePaymentHash(payment: PaymentData): string {
  // This is a simplified client-side hash for reference
  // The canonical hash is computed by the smart contract
  return ethers.keccak256(
    ethers.solidityPacked(
      ["address", "uint256", "uint256", "address", "bytes32"],
      [payment.owner, payment.value, payment.deadline, payment.recipient, payment.nonce]
    )
  );
}

interface ValidateProofParams {
  proof: S402Proof;
  expectedPrice: bigint;
  expectedRecipient: Address;
}

/**
 * Validate submitted S402 proof
 */
export async function validateSubmittedProof(
  params: ValidateProofParams
): Promise<S402Context> {
  const { proof, expectedPrice, expectedRecipient } = params;
  const chainId = getChainId();
  
  // Parameter validation
  const errors: string[] = [];
  
  // CRITICAL: Require txHash for transaction verification
  if (!proof.txHash) {
    errors.push("Transaction hash is required for verification");
  }
  
  // Check value matches expected price
  if (proof.payment.value !== expectedPrice.toString()) {
    errors.push(
      `Invalid payment value: expected ${expectedPrice.toString()}, got ${proof.payment.value}`
    );
  }
  
  // Check recipient matches
  if (proof.payment.recipient.toLowerCase() !== expectedRecipient.toLowerCase()) {
    errors.push(
      `Invalid recipient: expected ${expectedRecipient}, got ${proof.payment.recipient}`
    );
  }
  
  // Check deadline not expired
  const now = Math.floor(Date.now() / 1000);
  if (proof.payment.deadline <= now) {
    errors.push(`Payment deadline expired: ${proof.payment.deadline} <= ${now}`);
  }
  
  // Validate chain ID (implicit in domain verification, but good to check)
  if (chainId !== 56) {
    errors.push(`Invalid chain ID: expected 56, configured as ${chainId}`);
  }
  
  if (errors.length > 0) {
    logger.warn({ errors, proof }, "Proof validation failed");
    throw new Error(`Proof validation failed: ${errors.join(", ")}`);
  }
  
  // CRITICAL: Verify EIP-712 signature before blockchain calls
  // Use domain that doesn't mutate payment data
  const domain = buildEIP712Domain();
  
  const signatureValid = verifyEIP712Signature(
    proof.payment,
    proof.authSig,
    domain
  );
  
  if (!signatureValid) {
    logger.error({ owner: proof.payment.owner }, "Invalid EIP-712 signature - rejecting proof");
    throw new Error("Invalid signature: EIP-712 signature verification failed");
  }
  
  logger.debug({ owner: proof.payment.owner }, "EIP-712 signature verified");
  
  // On-chain verification: Verify actual transaction with confirmations
  logger.debug({ txHash: proof.txHash, nonce: proof.payment.nonce }, "Verifying transaction on-chain...");
  const verification = await verifyTransactionSettlement(proof.txHash!, proof.payment);
  
  if (!verification.verified) {
    logger.error({
      txHash: proof.txHash,
      payment: proof.payment,
      confirmations: verification.confirmations,
      error: verification.error,
    }, "Transaction verification failed");
    throw new Error(`Transaction verification failed: ${verification.error}`);
  }
  
  logger.info({
    txHash: proof.txHash,
    owner: proof.payment.owner,
    value: proof.payment.value,
    confirmations: verification.confirmations,
  }, "Payment proof validated successfully with on-chain transaction verification");
  
  return {
    owner: proof.payment.owner,
    value: BigInt(proof.payment.value),
    payment: proof.payment,
    txHash: proof.txHash,
  };
}

/**
 * Verify EIP-712 signature for PaymentAuthorization
 * This verifies the signature matches the payment data and was signed by payment.owner
 */
export function verifyEIP712Signature(
  payment: PaymentData,
  authSig: { v: number; r: Hex32; s: Hex32 },
  domain: EIP712Domain
): boolean {
  try {
    // Use shared types from schema to avoid drift
    const types = { PaymentAuthorization: PAYMENT_AUTHORIZATION_TYPES.PaymentAuthorization };
    
    const value = {
      owner: payment.owner,
      spender: S402_FACILITATOR, // Must match the types in shared schema
      value: payment.value,
      deadline: payment.deadline,
      recipient: payment.recipient,
      nonce: payment.nonce,
    };
    
    // Reconstruct signature from v, r, s
    const signature = ethers.Signature.from({
      v: authSig.v,
      r: authSig.r,
      s: authSig.s,
    });
    
    // Recover signer address from signature
    const recoveredAddress = ethers.verifyTypedData(
      domain,
      types,
      value,
      signature
    );
    
    // Verify recovered address matches payment.owner
    const isValid = recoveredAddress.toLowerCase() === payment.owner.toLowerCase();
    
    if (!isValid) {
      logger.warn({
        expected: payment.owner,
        recovered: recoveredAddress,
      }, "EIP-712 signature verification failed: signer mismatch");
    } else {
      logger.debug({
        owner: payment.owner,
        recovered: recoveredAddress,
      }, "EIP-712 signature verified successfully");
    }
    
    return isValid;
  } catch (error) {
    logger.error({ error }, "EIP-712 signature verification error");
    return false;
  }
}
