import { ethers } from "ethers";
import type {
  PaymentData,
  Signature,
  S402Proof,
  PaymentRequired402,
  Address,
  TxHash,
} from "./types";
import {
  signPaymentAuth,
  signPermit,
  checkAllowance,
} from "./payments";

// BNB Chain mainnet contract addresses
export const S402_FACILITATOR: Address = "0x605c5c8d83152bd98ecAc9B77a845349DA3c48a3";
export const USD1_TOKEN: Address = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d";
export const BNB_CHAIN_ID = 56;

export interface S402ClientOptions {
  baseUrl: string;
  facilitator?: Address; // Optional - defaults to S402_FACILITATOR
  token?: Address; // Optional - defaults to USD1_TOKEN
  chainId?: number; // Optional - defaults to BNB_CHAIN_ID
  provider: ethers.Provider;
  signer: ethers.Signer;
  maxRetries?: number;
  autoSettle?: boolean; // Automatically settle payment on 402
}

/**
 * S402 API Client with automatic payment handling
 */
export class S402Client {
  private baseUrl: string;
  private facilitator: Address;
  private token: Address;
  private chainId: number;
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private maxRetries: number;
  private autoSettle: boolean;
  private facilitatorContract: ethers.Contract;
  
  constructor(options: S402ClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.facilitator = options.facilitator || S402_FACILITATOR;
    this.token = options.token || USD1_TOKEN;
    this.chainId = options.chainId || BNB_CHAIN_ID;
    this.provider = options.provider;
    this.signer = options.signer;
    this.maxRetries = options.maxRetries || 3;
    this.autoSettle = options.autoSettle ?? true;
    
    // Initialize facilitator contract
    const facilitatorAbi = [
      "function settlePayment((address owner, uint256 value, uint256 deadline, address recipient, bytes32 nonce) payment, (uint8 v, bytes32 r, bytes32 s) authSig) external",
      "function settlePaymentWithPermit((address owner, uint256 value, uint256 deadline, address recipient, bytes32 nonce) payment, (uint8 v, bytes32 r, bytes32 s) permitSig, (uint8 v, bytes32 r, bytes32 s) authSig) external",
      "function isPaymentUsed(address owner, address recipient, uint256 value, uint256 deadline, bytes32 nonce) view returns (bool)",
    ];
    
    this.facilitatorContract = new ethers.Contract(
      this.facilitator,
      facilitatorAbi,
      this.signer
    );
  }
  
  /**
   * Make an API request with automatic 402 payment handling
   */
  async request<T = any>(
    path: string,
    init?: RequestInit & { s402Proof?: S402Proof }
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    
    // Build request with proof if provided
    const requestInit: RequestInit = {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    };
    
    // If proof is provided, include it in body
    if (init?.s402Proof) {
      const body = init.body ? JSON.parse(init.body as string) : {};
      requestInit.body = JSON.stringify({
        ...body,
        s402Proof: init.s402Proof,
      });
    }
    
    // Make initial request
    const response = await fetch(url, requestInit);
    
    // If not 402, return response
    if (response.status !== 402) {
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }
      return response.json();
    }
    
    // Handle 402 Payment Required
    if (!this.autoSettle) {
      throw new Error("Payment required (autoSettle disabled)");
    }
    
    const paymentReq: PaymentRequired402 = await response.json();
    
    // Inject owner address into payment
    const owner = await this.signer.getAddress();
    const payment: PaymentData = {
      ...paymentReq.payment,
      owner: owner as Address,
    };
    
    // Sign payment authorization
    const authSig = await signPaymentAuth(
      this.signer,
      paymentReq.typedData.domain,
      payment
    );
    
    // Check if we need permit
    const allowance = await checkAllowance(
      this.provider,
      this.token,
      owner as Address,
      this.facilitator
    );
    
    const value = BigInt(payment.value);
    let txHash: TxHash | undefined;
    
    if (allowance >= value) {
      // Sufficient allowance - use settlePayment
      console.log("Settling payment (allowance exists)...");
      const tx = await this.facilitatorContract.settlePayment(
        payment,
        authSig
      );
      const receipt = await tx.wait(1); // Wait for 1 confirmation
      txHash = receipt.hash as TxHash;
      console.log("Payment settled:", txHash);
    } else {
      // Need permit - use settlePaymentWithPermit
      console.log("Settling payment with permit (no allowance)...");
      const permitSig = await signPermit(
        this.signer,
        this.token,
        this.chainId,
        this.facilitator,
        payment.value,
        payment.deadline
      );
      
      const tx = await this.facilitatorContract.settlePaymentWithPermit(
        payment,
        permitSig,
        authSig
      );
      const receipt = await tx.wait(1);
      txHash = receipt.hash as TxHash;
      console.log("Payment settled with permit:", txHash);
    }
    
    // Build proof
    const proof: S402Proof = {
      payment,
      authSig,
      txHash,
    };
    
    // Retry request with proof
    return this.request<T>(path, {
      ...init,
      s402Proof: proof,
    });
  }
  
  /**
   * Manually settle a payment (without making API request)
   */
  async settlePayment(
    payment: PaymentData,
    authSig: Signature,
    permitSig?: Signature
  ): Promise<TxHash> {
    if (permitSig) {
      const tx = await this.facilitatorContract.settlePaymentWithPermit(
        payment,
        permitSig,
        authSig
      );
      const receipt = await tx.wait(1);
      return receipt.hash as TxHash;
    } else {
      const tx = await this.facilitatorContract.settlePayment(payment, authSig);
      const receipt = await tx.wait(1);
      return receipt.hash as TxHash;
    }
  }
  
  /**
   * Check if a payment has been used
   */
  async isPaymentUsed(payment: PaymentData): Promise<boolean> {
    return this.facilitatorContract.isPaymentUsed(
      payment.owner,
      payment.recipient,
      payment.value,
      payment.deadline,
      payment.nonce
    );
  }
}
