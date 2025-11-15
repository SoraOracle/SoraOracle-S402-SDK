import type { PaymentRequired402, PaymentData, EIP712Domain, Address } from "@shared/schema";
import { PAYMENT_AUTHORIZATION_TYPES } from "@shared/schema";

interface PaymentRequiredParams {
  facilitator: Address;
  token: Address;
  chainId: number;
  routeKey: string;
  payment: PaymentData;
  domain: EIP712Domain;
}

/**
 * Build 402 Payment Required response
 */
export function buildPaymentRequired(params: PaymentRequiredParams): PaymentRequired402 {
  return {
    error: "PAYMENT_REQUIRED",
    message: "Payment required via S402.",
    facilitator: params.facilitator,
    token: params.token,
    chainId: params.chainId,
    routeKey: params.routeKey,
    payment: params.payment,
    typedData: {
      domain: params.domain,
      types: PAYMENT_AUTHORIZATION_TYPES,
    },
  };
}

/**
 * Create JSON error response
 */
export function errorResponse(error: string, message: string, details?: any) {
  return {
    error,
    message,
    ...(details && { details }),
  };
}
