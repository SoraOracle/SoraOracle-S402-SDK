/**
 * Custom Token Payment Example
 * 
 * This example shows how to use any ERC-20 token (not just USD1) for
 * S402 payments. The token address is part of the signed message,
 * preventing front-running attacks.
 * 
 * Usage: npx tsx examples/custom-token-example.ts
 */

import { S402Client } from '../server/sdk/client';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

async function main() {
  console.log('🪙 S402 Custom Token Payment Example\n');

  const rpcUrl = process.env.RPC_URL || 'https://bsc-dataseed.binance.org';
  const privateKey = process.env.PRIVATE_KEY;
  const customTokenAddress = process.env.CUSTOM_TOKEN_ADDRESS;
  
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is required');
  }

  if (!customTokenAddress) {
    throw new Error('CUSTOM_TOKEN_ADDRESS environment variable is required for this example');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  const facilitatorAddress = process.env.FACILITATOR_ADDRESS || '0x605c5c8d83152bd98ecAc9B77a845349DA3c48a3';

  console.log(`💳 Wallet: ${await signer.getAddress()}`);
  console.log(`📍 Facilitator: ${facilitatorAddress}`);
  console.log(`🪙 Custom Token: ${customTokenAddress}\n`);

  // Check token details
  const token = new ethers.Contract(customTokenAddress, ERC20_ABI, signer);
  const [symbol, decimals, balance] = await Promise.all([
    token.symbol(),
    token.decimals(),
    token.balanceOf(await signer.getAddress()),
  ]);

  console.log('📊 Token Information:');
  console.log(`   Symbol: ${symbol}`);
  console.log(`   Decimals: ${decimals}`);
  console.log(`   Balance: ${ethers.formatUnits(balance, decimals)} ${symbol}\n`);

  // Check allowance
  const allowance = await token.allowance(await signer.getAddress(), facilitatorAddress);
  console.log(`🔓 Current Allowance: ${ethers.formatUnits(allowance, decimals)} ${symbol}`);

  if (allowance === 0n) {
    console.log('\n⚠️  No allowance set. You need to approve the facilitator contract first.');
    console.log('   Run this command to approve:');
    console.log(`   npx tsx -e "
      import { ethers } from 'ethers';
      const p = new ethers.JsonRpcProvider('${rpcUrl}');
      const s = new ethers.Wallet('${privateKey}', p);
      const t = new ethers.Contract('${customTokenAddress}', ['function approve(address,uint256) returns (bool)'], s);
      const tx = await t.approve('${facilitatorAddress}', ethers.parseUnits('1000', ${decimals}));
      console.log('Approval tx:', tx.hash);
      await tx.wait();
      console.log('Approved!');
    "`);
    return;
  }

  // Initialize S402 client with custom token
  const client = new S402Client({
    baseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
    provider,
    signer,
    facilitator: facilitatorAddress,
    token: customTokenAddress,  // Use custom token instead of default USD1
    chainId: Number(process.env.CHAIN_ID || 56),
  });

  console.log('\n📋 Client Configuration:');
  console.log(`   Token: ${symbol} (${customTokenAddress})`);
  console.log(`   Facilitator: ${facilitatorAddress}\n`);

  try {
    console.log('🔄 Making payment with custom token...');
    
    const response = await client.request('/api/v1/tool/example', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: {
          message: `Payment with ${symbol} token`,
          tokenAddress: customTokenAddress,
        },
      }),
    });

    console.log('\n✅ Success! Payment settled with custom token');
    console.log('API Response:');
    console.log(JSON.stringify(response, null, 2));

    // Check updated balance
    const newBalance = await token.balanceOf(await signer.getAddress());
    console.log(`\n💰 Updated Balance: ${ethers.formatUnits(newBalance, decimals)} ${symbol}`);
    console.log(`   Spent: ${ethers.formatUnits(balance - newBalance, decimals)} ${symbol}`);
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', await error.response.text());
    }
  }
}

main().catch(console.error);
