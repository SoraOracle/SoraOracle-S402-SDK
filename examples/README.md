# S402 SDK Examples

This directory contains working examples demonstrating how to use the S402 SDK for pay-per-API-call functionality with blockchain settlement.

## Prerequisites

```bash
npm install ethers @s402/sdk
```

## Quick Start

The S402 system now supports **any ERC-20 token** for payments, with configurable platform fees collected by the facilitator contract.

### 1. Basic Payment Flow (`basic-example.ts`)

Shows the simplest usage: auto-handling 402 responses, signing, settling on-chain, and retrying.

```bash
npx tsx examples/basic-example.ts
```

### 2. Manual Payment Flow (`manual-example.ts`)

Demonstrates step-by-step control over the payment process without SDK auto-retry.

```bash
npx tsx examples/manual-example.ts
```

### 3. Custom Token Example (`custom-token-example.ts`)

Shows how to use any ERC-20 token (not just USD1) for payments.

```bash
npx tsx examples/custom-token-example.ts
```

## Contract Features

### Any ERC-20 Token Support
The S402Facilitator contract now accepts any ERC-20 token. The `token` address is part of the signed payment authorization, preventing front-running attacks.

### Platform Fees
- Configurable fee in basis points (bps): e.g., 50 bps = 0.5%
- Max fee: 1000 bps (10%)
- Fees accumulate per-token in the contract
- Admin can withdraw fees using `withdrawFees(token, amount, recipient)`

### Admin Functions
- `updatePlatformFeeBps(newBps)` - Update platform fee percentage
- `setFeeRecipient(address)` - Update fee recipient address
- `withdrawFees(token, amount, to)` - Withdraw accumulated fees for a specific token
- `pause()` / `unpause()` - Emergency controls

## Environment Variables

Create a `.env` file:

```env
# Required
PRIVATE_KEY=your_private_key_here
API_BASE_URL=https://your-api.example.com

# Optional (defaults to BNB Chain mainnet)
RPC_URL=https://bsc-dataseed.binance.org
FACILITATOR_ADDRESS=0x... # Your deployed S402Facilitator
CHAIN_ID=56

# For custom tokens
TOKEN_ADDRESS=0x... # ERC-20 token address (defaults to USD1 on BNB Chain)
```

## Payment Flow Diagram

```
1. Client → API (no payment proof)
   ← 402 Payment Required {amount, recipient, deadline, nonce, token}

2. Client signs EIP-712 payment authorization
   - Includes: owner, token, value, deadline, recipient, nonce
   
3. Client submits on-chain settlement
   - Calls S402Facilitator.settlePayment() or settlePaymentWithPermit()
   - Contract transfers tokens: (value - fee) to recipient, fee to contract
   
4. Client → API (with payment proof: txHash)
   ← 200 OK {response data}
```

## Security Features

✅ **Token Binding**: Token address is part of the signed message (prevents token substitution)  
✅ **Recipient Binding**: Recipient address in signature (prevents front-running)  
✅ **Replay Protection**: Unique nonce per payment  
✅ **Deadline Enforcement**: Time-limited payment authorization  
✅ **On-Chain Verification**: Server verifies transaction with configurable confirmations  
✅ **Fee Transparency**: Platform fee emitted in PaymentSettled event

## Example: Custom Token Payment

```typescript
import { S402Client } from '@s402/sdk';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const client = new S402Client({
  baseUrl: process.env.API_BASE_URL!,
  provider,
  signer,
  facilitator: process.env.FACILITATOR_ADDRESS!,
  token: '0xYourCustomTokenAddress', // Any ERC-20 token
  chainId: 56,
});

// SDK automatically handles 402 → sign → settle → retry
const result = await client.request('/api/v1/tool/example', {
  method: 'POST',
  body: JSON.stringify({ payload: { data: 'test' } }),
});

console.log('API response:', result);
```

## Admin Dashboard

For contract management (updating fees, withdrawing fees, pause/unpause), use the web-based admin dashboard at `/admin` or run local transactions using the facilitator ABI.

## Support

- Documentation: `/docs`
- Contract ABI: `server/libs/abi/S402Facilitator.json`
- BNB Chain Explorer: https://bscscan.com
