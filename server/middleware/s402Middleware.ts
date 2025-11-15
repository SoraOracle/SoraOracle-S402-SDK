import { Request, Response, NextFunction } from "express";
import { s402ProofSchema } from "@shared/schema";
import { buildPaymentRequest, validateSubmittedProof } from "../services/s402Service";
import { getPriceForRoute, getRecipientForRoute } from "../services/pricingService";
import { buildPaymentRequired } from "../utils/http";
import { getChainId, S402_FACILITATOR, USD1_TOKEN } from "../config/env";
import { logger } from "../config/logger";
import type { Address } from "@shared/schema";

/**
 * S402 payment gating middleware factory
 */
export function requireS402(routeKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chainId = getChainId();
      
      // Get pricing and recipient for this route
      const price = getPriceForRoute(routeKey);
      const recipient = getRecipientForRoute(routeKey);
      
      logger.debug({ routeKey, price: price.toString(), recipient }, "S402 middleware invoked");
      
      // Check if proof is provided
      const proof = req.body?.s402Proof;
      
      if (!proof) {
        // No proof - return 402 Payment Required
        const owner = req.body?.owner || null;
        const { payment, domain, types } = buildPaymentRequest({
          routeKey,
          price,
          recipient,
          owner: owner as Address | null,
        });
        
        const response = buildPaymentRequired({
          facilitator: S402_FACILITATOR as Address,
          token: USD1_TOKEN as Address,
          chainId,
          routeKey,
          payment,
          domain,
        });
        
        logger.info({ routeKey, owner }, "Returning 402 Payment Required");
        return res.status(402).json(response);
      }
      
      // Validate proof schema
      const validatedProof = s402ProofSchema.parse(proof);
      
      logger.info({
        routeKey,
        owner: validatedProof.payment.owner,
        nonce: validatedProof.payment.nonce,
      }, "S402 proof submitted - beginning validation");
      
      // CRITICAL: Multi-layer validation
      // 1. Parameter validation (amount, recipient, deadline)
      // 2. EIP-712 signature verification (proves owner signed the payment data)
      // 3. Blockchain verification (proves payment was actually settled on-chain)
      const context = await validateSubmittedProof({
        proof: validatedProof,
        expectedPrice: price,
        expectedRecipient: recipient,
      });
      
      // Attach context to request
      req.s402 = context;
      
      logger.info({
        routeKey,
        owner: context.owner,
        value: context.value.toString(),
        nonce: context.payment.nonce,
      }, "✅ Payment VERIFIED (signature + on-chain) - granting API access");
      
      next();
    } catch (error: any) {
      logger.error({ 
        error: error.message, 
        routeKey,
        stack: error.stack 
      }, "❌ S402 verification failed");
      
      // Return appropriate error
      if (
        error.message.includes("validation failed") || 
        error.message.includes("not settled") ||
        error.message.includes("Invalid signature")
      ) {
        return res.status(403).json({
          error: "PAYMENT_VERIFICATION_FAILED",
          message: error.message,
          details: "Either the signature is invalid, payment parameters are incorrect, or the payment was not settled on-chain.",
        });
      }
      
      // Schema validation errors
      if (error.name === "ZodError") {
        return res.status(400).json({
          error: "INVALID_PROOF_FORMAT",
          message: "S402 proof has invalid format",
          details: error.errors,
        });
      }
      
      next(error);
    }
  };
}

/**
 * Optional middleware to attach S402 context if proof is provided, but don't require it
 */
export function optionalS402(routeKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const proof = req.body?.s402Proof;
      
      if (proof) {
        const validatedProof = s402ProofSchema.parse(proof);
        const price = getPriceForRoute(routeKey);
        const recipient = getRecipientForRoute(routeKey);
        
        const context = await validateSubmittedProof({
          proof: validatedProof,
          expectedPrice: price,
          expectedRecipient: recipient,
        });
        
        req.s402 = context;
      }
      
      next();
    } catch (error) {
      // Don't fail request, just proceed without S402 context
      logger.warn({ error }, "Optional S402 validation failed, proceeding anyway");
      next();
    }
  };
}
