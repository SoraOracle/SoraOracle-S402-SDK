import { ethers } from "ethers";
import type {
  PaymentData,
  Signature,
  EIP712Domain,
  Address,
  Hex32,
} from "./types";
import { PAYMENT_AUTHORIZATION_TYPES } from "./types";

/**
 * Build EIP-712 typed data for PaymentAuthorization signature
 */
export function buildAuthTypedData(
  domain: EIP712Domain,
  payment: PaymentData
): {
  domain: EIP712Domain;
  types: typeof PAYMENT_AUTHORIZATION_TYPES;
  primaryType: "PaymentAuthorization";
  message: any;
} {
  return {
    domain,
    types: PAYMENT_AUTHORIZATION_TYPES,
    primaryType: "PaymentAuthorization",
    message: {
      owner: payment.owner,
      spender: domain.verifyingContract, // The facilitator contract
      value: payment.value,
      deadline: payment.deadline,
      recipient: payment.recipient,
      nonce: payment.nonce,
    },
  };
}

/**
 * Sign payment authorization using ethers Signer
 */
export async function signPaymentAuth(
  signer: ethers.Signer,
  domain: EIP712Domain,
  payment: PaymentData
): Promise<Signature> {
  const typedData = buildAuthTypedData(domain, payment);
  
  const signature = await signer.signTypedData(
    typedData.domain,
    { PaymentAuthorization: typedData.types.PaymentAuthorization },
    typedData.message
  );
  
  // Split signature into v, r, s
  const sig = ethers.Signature.from(signature);
  
  return {
    v: sig.v,
    r: sig.r as Hex32,
    s: sig.s as Hex32,
  };
}

/**
 * Build EIP-2612 permit typed data (for token approval)
 */
export function buildPermitTypedData(
  tokenAddress: Address,
  chainId: number,
  owner: Address,
  spender: Address,
  value: string,
  deadline: number,
  nonce: number = 0
) {
  return {
    domain: {
      name: "USD1", // Token name
      version: "1",
      chainId,
      verifyingContract: tokenAddress,
    },
    types: {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Permit",
    message: {
      owner,
      spender,
      value,
      nonce,
      deadline,
    },
  };
}

/**
 * Sign EIP-2612 permit
 */
export async function signPermit(
  signer: ethers.Signer,
  tokenAddress: Address,
  chainId: number,
  spender: Address,
  value: string,
  deadline: number,
  nonce: number = 0
): Promise<Signature> {
  const owner = await signer.getAddress();
  const typedData = buildPermitTypedData(
    tokenAddress,
    chainId,
    owner as Address,
    spender,
    value,
    deadline,
    nonce
  );
  
  const signature = await signer.signTypedData(
    typedData.domain,
    { Permit: typedData.types.Permit },
    typedData.message
  );
  
  const sig = ethers.Signature.from(signature);
  
  return {
    v: sig.v,
    r: sig.r as Hex32,
    s: sig.s as Hex32,
  };
}

/**
 * Check if user has sufficient token allowance
 */
export async function checkAllowance(
  provider: ethers.Provider,
  tokenAddress: Address,
  owner: Address,
  spender: Address
): Promise<bigint> {
  const tokenAbi = [
    "function allowance(address owner, address spender) view returns (uint256)",
  ];
  
  const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
  const allowance = await tokenContract.allowance(owner, spender);
  
  return allowance;
}
