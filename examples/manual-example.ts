/**
 * Manual S402 Payment Flow Example
 * 
 * This example demonstrates the step-by-step payment process without
 * relying on SDK auto-retry. Useful for understanding the full flow
 * or implementing custom payment logic.
 * 
 * Usage: npx tsx examples/manual-example.ts
 */

import { ethers } from 'ethers';
import { signPaymentAuth } from '../server/sdk/payments';
import * as dotenv from 'dotenv';

dotenv.config();

const FACILITATOR_ABI = [
  "function settlePayment((address owner, uint256 value, uint256 deadline, address recipient, bytes32 nonce) payment, (uint8 v, bytes32 r, bytes32 s) authSig) external returns (bool)",
  "function settlePaymentWithPermit((address owner, uint256 value, uint256 deadline, address recipient, bytes32 nonce) payment, (uint8 v, bytes32 r, bytes32 s) permitSig, (uint8 v, bytes32 r, bytes32 s) authSig) external returns (bool)",
  "function isPaymentUsed(address owner, address recipient, uint256 value, uint256 deadline, bytes32 nonce) view returns (bool)",
  "event PaymentSettled(address indexed token, address indexed from, address indexed to, uint256 value, uint256 platformFee, bytes32 nonce)"
];

async function main() {
  console.log('🔧 S402 Manual Payment Flow Example\n');

  const rpcUrl = process.env.RPC_URL || 'https://bsc-dataseed.binance.org';
  const privateKey = process.env.PRIVATE_KEY;
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
  
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is required');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  const facilitatorAddress = process.env.FACILITATOR_ADDRESS || '0x605c5c8d83152bd98ecAc9B77a845349DA3c48a3';
  const facilitator = new ethers.Contract(facilitatorAddress, FACILITATOR_ABI, signer);

  console.log(`💳 Wallet: ${await signer.getAddress()}`);
  console.log(`📍 Facilitator: ${facilitatorAddress}\n`);

  // Step 1: Make initial request without payment proof
  console.log('📤 Step 1: Initial request to payment-gated endpoint...');
  
  const initialResponse = await fetch(`${apiBaseUrl}/api/v1/tool/example`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload: { test: 'data' } }),
  });

  if (initialResponse.status !== 402) {
    throw new Error(`Expected 402, got ${initialResponse.status}`);
  }

  const paymentRequest = await initialResponse.json();
  console.log('💳 Received 402 Payment Required:');
  console.log(JSON.stringify(paymentRequest, null, 2));

  // Step 2: Sign payment authorization using EIP-712
  console.log('\n✍️  Step 2: Signing payment authorization (EIP-712)...');
  
  const paymentData = {
    owner: await signer.getAddress(),
    value: paymentRequest.amount,
    deadline: paymentRequest.deadline,
    recipient: paymentRequest.recipient,
    nonce: paymentRequest.nonce,
  };

  const domain = {
    name: 'S402Facilitator',
    version: '1',
    chainId: Number(process.env.CHAIN_ID || 56),
    verifyingContract: facilitatorAddress,
  };

  const authSig = await signPaymentAuth(signer, domain, paymentData);

  console.log('✅ Payment authorization signed');
  console.log(`   Signature: ${authSig.r.slice(0, 10)}...`);

  // Step 3: Submit settlement transaction on-chain
  console.log('\n⛓️  Step 3: Submitting settlement transaction...');
  
  const tx = await facilitator.settlePayment(paymentData, authSig);
  console.log(`📝 Transaction hash: ${tx.hash}`);
  
  console.log('⏳ Waiting for confirmation...');
  const receipt = await tx.wait();
  console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

  // Parse PaymentSettled event
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = facilitator.interface.parseLog(log);
      return parsed?.name === 'PaymentSettled';
    } catch {
      return false;
    }
  });

  if (event) {
    const parsed = facilitator.interface.parseLog(event);
    console.log(`💰 Payment settled:`);
    console.log(`   From: ${parsed?.args.from}`);
    console.log(`   To: ${parsed?.args.to}`);
    console.log(`   Value: ${ethers.formatUnits(parsed?.args.value, 18)}`);
    console.log(`   Fee: ${ethers.formatUnits(parsed?.args.platformFee, 18)}`);
  }

  // Step 4: Retry request with payment proof
  console.log('\n🔄 Step 4: Retrying request with payment proof...');
  
  const finalResponse = await fetch(`${apiBaseUrl}/api/v1/tool/example`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      payload: { test: 'data' },
      s402Proof: {
        paymentData,
        signature: authSig,
        txHash: tx.hash,
      },
    }),
  });

  if (!finalResponse.ok) {
    throw new Error(`Request failed: ${finalResponse.status}`);
  }

  const result = await finalResponse.json();
  console.log('\n✅ Success! API Response:');
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
