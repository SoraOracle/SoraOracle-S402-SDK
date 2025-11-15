import { getFacilitatorContract, getProvider } from "../libs/ethers";
import { getMinimumConfirmations } from "../config/env";
import { logger } from "../config/logger";
import type { PaymentData, Address, Hex32, TxHash } from "@shared/schema";


/**
 * Verify transaction settlement on-chain
 * This function:
 * 1. Looks up the transaction by txHash
 * 2. Verifies it has sufficient confirmations
 * 3. Verifies it called settlePayment with correct parameters
 */
export async function verifyTransactionSettlement(
  txHash: TxHash,
  payment: PaymentData
): Promise<{ verified: boolean; confirmations: number; error?: string }> {
  try {
    const provider = getProvider();
    const minimumConfirmations = getMinimumConfirmations();
    
    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      logger.warn({ txHash }, "Transaction not found on-chain");
      return { verified: false, confirmations: 0, error: "Transaction not found" };
    }
    
    // Calculate confirmations
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber + 1;
    
    logger.debug({
      txHash,
      blockNumber: receipt.blockNumber,
      currentBlock,
      confirmations,
      minimumRequired: minimumConfirmations,
    }, "Checking transaction confirmations");
    
    // Verify minimum confirmations
    if (confirmations < minimumConfirmations) {
      logger.warn({
        txHash,
        confirmations,
        required: minimumConfirmations,
      }, "Insufficient confirmations");
      return {
        verified: false,
        confirmations,
        error: `Insufficient confirmations: ${confirmations}/${minimumConfirmations}`,
      };
    }
    
    // Verify transaction succeeded
    if (receipt.status !== 1) {
      logger.warn({ txHash, status: receipt.status }, "Transaction failed on-chain");
      return { verified: false, confirmations, error: "Transaction failed" };
    }
    
    // Verify transaction called S402Facilitator contract
    const contract = getFacilitatorContract();
    if (receipt.to?.toLowerCase() !== contract.target.toString().toLowerCase()) {
      logger.warn({
        txHash,
        actualTarget: receipt.to,
        expectedTarget: contract.target,
      }, "Transaction did not call S402Facilitator contract");
      return { verified: false, confirmations, error: "Wrong contract called" };
    }
    
    // Parse logs to verify PaymentSettled event with correct parameters
    const settledEvent = receipt.logs.find((log) => {
      try {
        const parsed = contract.interface.parseLog({
          topics: [...log.topics],
          data: log.data,
        });
        
        if (parsed?.name === "PaymentSettled") {
          // Verify event parameters match payment data
          const matches =
            parsed.args.from.toLowerCase() === payment.owner.toLowerCase() &&
            parsed.args.to.toLowerCase() === payment.recipient.toLowerCase() &&
            parsed.args.value.toString() === payment.value &&
            parsed.args.nonce === payment.nonce;
          
          return matches;
        }
      } catch (e) {
        // Ignore parsing errors for non-contract logs
      }
      return false;
    });
    
    if (!settledEvent) {
      logger.warn({
        txHash,
        payment,
      }, "No matching PaymentSettled event found in transaction");
      return { verified: false, confirmations, error: "Payment parameters mismatch" };
    }
    
    logger.info({
      txHash,
      confirmations,
      owner: payment.owner,
      recipient: payment.recipient,
      value: payment.value,
    }, "Transaction verified successfully");
    
    return { verified: true, confirmations };
  } catch (error) {
    logger.error({ error, txHash }, "Failed to verify transaction");
    return { verified: false, confirmations: 0, error: "Verification failed" };
  }
}

/**
 * Get network statistics (optional utility)
 */
export async function getNetworkStats() {
  try {
    const provider = getProvider();
    const [blockNumber, gasPrice] = await Promise.all([
      provider.getBlockNumber(),
      provider.getFeeData(),
    ]);
    
    return {
      blockNumber,
      gasPrice: gasPrice.gasPrice?.toString() || "0",
      maxFeePerGas: gasPrice.maxFeePerGas?.toString() || "0",
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas?.toString() || "0",
    };
  } catch (error) {
    logger.error({ error }, "Failed to get network stats");
    throw new Error("Failed to get network statistics");
  }
}
