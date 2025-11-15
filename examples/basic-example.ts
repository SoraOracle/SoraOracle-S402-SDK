/**
 * Basic S402 SDK Example
 * 
 * This example shows the simplest usage of the S402 SDK with automatic
 * payment handling. The SDK detects 402 responses, signs payment authorization,
 * settles on-chain, and retries the request automatically.
 * 
 * Usage: npx tsx examples/basic-example.ts
 */

import { S402Client } from '../server/sdk/client';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🚀 S402 Basic Example - Auto Payment Handling\n');

  // Setup provider and signer from environment
  const rpcUrl = process.env.RPC_URL || 'https://bsc-dataseed.binance.org';
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is required');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  console.log(`📍 Connected to: ${rpcUrl}`);
  console.log(`💳 Wallet: ${await signer.getAddress()}\n`);

  // Initialize S402 client
  // Facilitator and token addresses default to BNB Chain values if not specified
  const client = new S402Client({
    baseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
    provider,
    signer,
    facilitator: process.env.FACILITATOR_ADDRESS,
    token: process.env.TOKEN_ADDRESS,
    chainId: Number(process.env.CHAIN_ID || 56),
  });

  console.log('📋 Client Configuration:');
  console.log(`   API: ${client['baseUrl']}`);
  console.log(`   Facilitator: ${client['facilitator']}`);
  console.log(`   Token: ${client['token']}`);
  console.log(`   Chain ID: ${client['chainId']}\n`);

  try {
    // Make a request to a payment-gated endpoint
    // The SDK will automatically:
    // 1. Detect the 402 response
    // 2. Sign the payment authorization (EIP-712)
    // 3. Submit settlement transaction to S402Facilitator
    // 4. Wait for confirmations
    // 5. Retry the original request with payment proof
    
    console.log('🔄 Making request to payment-gated endpoint...');
    
    const response = await client.request('/api/v1/tool/example', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payload: {
          message: 'Hello from S402 SDK!',
          timestamp: new Date().toISOString(),
        },
      }),
    });

    console.log('\n✅ Success! API Response:');
    console.log(JSON.stringify(response, null, 2));
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', await error.response.text());
    }
  }
}

main().catch(console.error);
