# SORA S402 Payment-Gated API System

A production-grade HTTP 402 payment-gating system that enables pay-per-API-call functionality using blockchain settlement on BNB Chain. The SORA S402 Facilitator contract is **deployed and live** on BNB Chain mainnet with USD1 token support.

## 🎯 Overview

SORA S402 implements a complete payment flow where API endpoints return HTTP 402 Payment Required responses when accessed without valid payment proof, then verify on-chain settlement before processing requests.

**Key Features:**
- ✅ **Production Deployed** - Live on BNB Chain at `0x605c5c8d83152bd98ecAc9B77a845349DA3c48a3`
- ✅ **USD1 Token Payments** - Uses World Liberty Financial's USD1 stablecoin
- ✅ **Platform Fee Collection** - Configurable fees (~1%) collected by the facilitator contract
- ✅ **TypeScript SDK** - Automatic 402 handling with payment settlement
- ✅ **Interactive Demo** - Live demo page for testing payments on BNB Chain mainnet
- ✅ **On-Chain Verification** - Server validates blockchain transactions with configurable confirmations
- ✅ **EIP-712 Signatures** - Secure payment authorization with recipient binding
- ✅ **Developer-First Design** - Beautiful docs, interactive examples, and clear error messages

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [SORA Contract Details](#-sora-contract-details)
- [Using the SDK](#-using-the-sdk)
- [Demo Page](#-demo-page)
- [API Endpoints](#-api-endpoints)
- [Payment Flow](#-payment-flow)
- [Security Features](#-security-features)
- [Examples](#-examples)
- [Troubleshooting](#-troubleshooting)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database (recommended: Neon serverless):

```bash
# Set your database URL
export DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Run database migrations (if using Drizzle)
npx drizzle-kit push:pg
```

**Note**: The current implementation uses in-memory storage by default. Database setup is optional unless you modify the storage layer to use PostgreSQL.

### 3. Configure Your System

Edit `config.txt` in the project root:

```txt
Environment=development
Port=5000
ChainId=56
Recipient=0xYourWalletAddress
Price=0.001
TrustProxy=false
AllowedOrigins=*
MinimumConfirmations=2
```

### 4. SORA Contract (Already Deployed!)

**✅ PRODUCTION CONTRACT DEPLOYED:** The SORA S402 Facilitator is live on BNB Chain!

**Contract Details:**
- **Facilitator Address:** `0x605c5c8d83152bd98ecAc9B77a845349DA3c48a3`
- **USD1 Token:** `0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d`
- **Network:** BNB Chain Mainnet (Chain ID: 56)
- **Platform Fee:** ~1% (100 basis points)

These addresses are already configured in `server/config/constants.ts`. No deployment needed!

### 5. Set Up Environment Variables (Optional)

Create a `.env` file in the project root for additional configuration:

```env
# Database (optional - uses in-memory storage by default)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Server Configuration (optional - can use config.txt instead)
NODE_ENV=development
PORT=5000
CHAIN_ID=56
RECIPIENT=0xYourWalletAddress
BASE_PRICE_USD1=1000000000000000  # 0.001 USD1 in wei
MINIMUM_CONFIRMATIONS=2

# Frontend Variables (for Demo Page)
VITE_RPC_URL=https://bsc-dataseed.binance.org
VITE_CHAIN_ID=56

# Session Secret (auto-generated if not provided)
SESSION_SECRET=your-random-secret-here
```

**Important**: Environment variables override `config.txt` settings. Use whichever is more convenient for your deployment.

### 6. Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## ⚙️ Configuration

### config.txt Options

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `Environment` | Application mode | `development` | `production` |
| `Port` | Server port | `5000` | `3000` |
| `ChainId` | Blockchain network | `56` (BNB Chain) | `97` (BSC Testnet) |
| `Recipient` | Your payment wallet address | Required | `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb` |
| `Price` | Default API call price (USD1) | `0.001` | `0.005` |
| `PriceTable` | Per-endpoint pricing | `""` | `tool.example;0.001 tool.analytics;0.005` |
| `TrustProxy` | Behind reverse proxy? | `false` | `true` |
| `AllowedOrigins` | CORS origins | `*` | `https://myapp.com,https://app2.com` |
| `MinimumConfirmations` | Block confirmations required | `2` | `20` (more secure, slower) |

### Environment Variables

All `config.txt` options can be overridden with environment variables:

```bash
export NODE_ENV=production
export PORT=3000
export CHAIN_ID=56
export RECIPIENT=0xYourAddress
export BASE_PRICE_USD1=1000000000000000  # 0.001 USD1 in wei
export MINIMUM_CONFIRMATIONS=5
export DATABASE_URL=postgresql://...
```

### Per-Endpoint Pricing

Configure different prices for different API routes using `PriceTable`:

**In config.txt:**
```txt
PriceTable=tool.example;0.001 tool.analytics;0.005 tool.premium;0.01
```

**Or as environment variable:**
```bash
export PRICE_TABLE_JSON='{"tool.example":"0.001","tool.analytics":"0.005"}'
```

Route keys are defined in your API routes. For example:
- `POST /api/v1/tool/example` → route key: `tool.example`
- `GET /api/v1/tool/analytics` → route key: `tool.analytics`

## 🔐 Smart Contract Deployment

The S402Facilitator contract must be deployed before using the system.

### Contract Features

- **Any ERC-20 Token Support** - Accepts payments in any token (token address is part of signature)
- **Platform Fees** - Configurable fee in basis points (0-1000 bps = 0-10%)
- **Fee Accrual** - Fees accumulate per-token in the contract
- **Admin Controls** - Owner-only functions for fee management and emergency pause

### Admin Functions

```solidity
function updatePlatformFeeBps(uint256 newBps) external onlyOwner;
function setFeeRecipient(address newRecipient) external onlyOwner;
function withdrawFees(address token, uint256 amount, address to) external onlyOwner;
function pause() external onlyOwner;
function unpause() external onlyOwner;
```

### After Deployment

1. Update `server/config/constants.ts`:
```typescript
export const S402_FACILITATOR = "0xYourContractAddress";
```

2. Update `server/sdk/client.ts` (SDK default):
```typescript
this.facilitator = options.facilitator || "0xYourContractAddress";
```

3. (Optional) Set environment variable for frontend admin dashboard:
```bash
export VITE_FACILITATOR_ADDRESS=0xYourContractAddress
```

## 📦 Using the SDK

### Installation

```bash
npm install ethers
```

The SDK is included in this repository at `server/sdk/`.

### Basic Usage (Auto-Settlement)

```typescript
import { S402Client } from './server/sdk';
import { ethers } from 'ethers';

// Set up provider and signer
const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org');
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Create S402 client
const client = new S402Client({
  baseUrl: 'http://localhost:5000',
  provider,
  signer,
  facilitator: '0xYourFacilitatorAddress', // Optional, uses default if not provided
  token: '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d', // Optional, defaults to USD1
  chainId: 56,
});

// Make API call - SDK automatically handles 402 → sign → settle → retry
const result = await client.request('/api/v1/tool/example', {
  method: 'POST',
  body: JSON.stringify({ payload: { data: 'test' } }),
});

console.log('Response:', result);
```

### Manual Payment Flow

For more control over the payment process:

```typescript
import { S402Client } from './server/sdk';
import { signPaymentAuth, signPermit, checkAllowance } from './server/sdk/payments';
import { ethers } from 'ethers';

const client = new S402Client({
  baseUrl: 'http://localhost:5000',
  provider,
  signer,
  autoSettle: false, // Disable automatic settlement
});

// Step 1: Make initial request (returns 402)
const response = await fetch('http://localhost:5000/api/v1/tool/example', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ payload: { data: 'test' } }),
});

const paymentReq = await response.json();
console.log('Payment required:', paymentReq.payment);

// Step 2: Sign payment authorization
const authSig = await signPaymentAuth(
  signer,
  paymentReq.typedData.domain,
  paymentReq.payment
);

// Step 3: Check allowance and sign permit if needed
const allowance = await checkAllowance(
  provider,
  paymentReq.token,
  await signer.getAddress(),
  paymentReq.facilitator
);

let permitSig;
if (allowance < BigInt(paymentReq.payment.value)) {
  permitSig = await signPermit(
    signer,
    paymentReq.token,
    paymentReq.payment,
    paymentReq.facilitator,
    paymentReq.chainId
  );
}

// Step 4: Settle payment on-chain
const proof = await client.settlePayment(paymentReq.payment, authSig, permitSig);

// Step 5: Retry request with proof
const finalResponse = await fetch('http://localhost:5000/api/v1/tool/example', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payload: { data: 'test' },
    s402Proof: proof,
  }),
});

const result = await finalResponse.json();
console.log('Success:', result);
```

### Using Custom Tokens

```typescript
const client = new S402Client({
  baseUrl: 'http://localhost:5000',
  provider,
  signer,
  token: '0xYourCustomTokenAddress', // Any ERC-20 token
  chainId: 56,
});

// Works the same way - SDK handles the custom token automatically
const result = await client.request('/api/v1/tool/example', {
  method: 'POST',
  body: JSON.stringify({ payload: { data: 'test' } }),
});
```

## 🎮 Demo Page

Access the interactive demo at `http://localhost:5000/demo`

The demo page lets you test SORA S402 payments on BNB Chain mainnet with real USD1 tokens.

### Prerequisites

Before using the demo:

1. **Install MetaMask** - Browser extension from https://metamask.io
2. **Get BNB for Gas** - You need ~$0.50 worth of BNB (~0.001 BNB) for transaction fees
3. **Get USD1 Tokens** - World Liberty Financial's USD1 stablecoin on BNB Chain
   - Token Address: `0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d`
   - You can swap BNB for USD1 on PancakeSwap or other DEXs

### How to Use the Demo

#### Step 1: Connect Wallet

1. Click **"Connect MetaMask"** on the demo page
2. MetaMask will prompt you to:
   - Connect your account
   - Switch to BNB Chain (if you're on a different network)
3. After connecting, you'll see:
   - Your wallet address
   - Your USD1 balance
   - Your BNB balance (for gas fees)

**⚠️ Important Warnings:**
- **Low USD1**: If you have less than 0.01 USD1, you'll see a warning. Get more USD1 to test.
- **Low BNB**: If you have less than 0.001 BNB, you'll see an error. Get more BNB for gas.

#### Step 2: Approve USD1 (One-Time Setup)

Before you can send payments, you must approve the SORA S402 Facilitator to spend your USD1 tokens.

1. Click **"Approve USD1"** button
2. MetaMask will ask you to confirm the approval transaction
3. Wait ~3-5 seconds for confirmation
4. Once approved, you can send unlimited payments with just 1 signature each!

**Why Approval?**
- This is a standard ERC-20 token pattern
- You approve once, then every payment only needs 1 signature
- Much better UX than approving + transferring for each payment

#### Step 3: Configure Payment

1. **Recipient Address**: Who receives the payment
   - Default is the SORA admin wallet
   - You can change it to any BNB Chain address
2. **Amount**: How much USD1 to send
   - Minimum: 0.01 USD1
   - Your amount minus ~1% platform fee goes to the recipient

#### Step 4: Send Payment

1. Click **"Send Payment (1 Signature)"**
2. MetaMask will ask you to sign the payment authorization (EIP-712 signature)
3. The payment settles on-chain automatically
4. Wait ~3-5 seconds for confirmation
5. Success! You'll see:
   - Transaction hash
   - Link to view on BscScan
   - Your updated USD1 balance

**What Happens Under the Hood:**
1. You sign an EIP-712 payment authorization (includes recipient, amount, deadline, nonce)
2. The SORA S402 Facilitator contract executes `settlePayment()`
3. USD1 tokens are transferred:
   - ~99% to the recipient (your specified address)
   - ~1% platform fee stays in the contract
4. Your balance updates

### How It Works

The demo showcases the SORA S402 payment flow:

1. **Simple Flow**: Approve once → All payments need just 1 signature
2. **One Signature Per Payment**: After initial approval, you only sign the payment authorization
3. **USD1 Stablecoin**: All payments use World Liberty Financial's USD1 token
4. **Platform Fee**: Small fee (~1%) collected by SORA S402 protocol
5. **Replay Protection**: Unique nonces prevent double-spending
6. **Gas Fees**: You pay BNB for blockchain transaction fees (~$0.003-0.007 per payment)

### Troubleshooting Demo

**"MetaMask Not Found"**
- Install MetaMask browser extension from https://metamask.io
- Refresh the page after installation

**"Network Switch Failed"**
- MetaMask should auto-switch to BNB Chain
- If it doesn't, manually switch to BNB Smart Chain (Chain ID: 56)

**"Low USD1 Balance"**
- You need at least 0.01 USD1 to test payments
- Swap BNB for USD1 on PancakeSwap: https://pancakeswap.finance/swap

**"Insufficient BNB"**
- You need BNB to pay for gas fees (~$0.003-0.007 per transaction)
- Get BNB from an exchange or bridge

**"Approval Failed"**
- Make sure you have enough BNB for gas
- Try increasing the gas price in MetaMask if the network is congested

**"Payment Failed"**
- Check that you have enough USD1 for the payment amount
- Ensure you've approved USD1 spending (Step 2)
- Verify your wallet is on BNB Chain (Chain ID: 56)

## 🔌 API Endpoints

### Public Endpoints (No Payment Required)

**GET /api/health**
```bash
curl http://localhost:5000/api/health
# Response: { "status": "ok", "timestamp": 1234567890 }
```

**GET /api/info**
```bash
curl http://localhost:5000/api/info
# Response: { "name": "S402 API", "version": "1.0.0", "endpoints": [...] }
```

### Payment-Gated Endpoints

**POST /api/v1/tool/example**

Request without payment proof → Returns 402:
```bash
curl -X POST http://localhost:5000/api/v1/tool/example \
  -H "Content-Type: application/json" \
  -d '{"payload":{"data":"test"}}'

# Response (402):
{
  "error": "PAYMENT_REQUIRED",
  "message": "Payment required for this API call",
  "facilitator": "0x...",
  "token": "0x...",
  "chainId": 56,
  "routeKey": "tool.example",
  "payment": {
    "owner": "0x0000000000000000000000000000000000000000",
    "value": "1000000000000000",
    "deadline": 1234567890,
    "recipient": "0x...",
    "nonce": "0x..."
  },
  "typedData": {
    "domain": { ... },
    "types": { ... }
  }
}
```

Request with payment proof → Returns 200:
```bash
curl -X POST http://localhost:5000/api/v1/tool/example \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {"data":"test"},
    "s402Proof": {
      "payment": { ... },
      "authSig": { ... },
      "txHash": "0x..."
    }
  }'

# Response (200):
{
  "success": true,
  "message": "Payment processed successfully",
  "data": { ... }
}
```

**GET /api/v1/tool/analytics**

Similar flow to `/api/v1/tool/example` but may have different pricing based on your `PriceTable` configuration.

## 🔄 Payment Flow

```
┌─────────┐                                  ┌─────────┐
│ Client  │                                  │   API   │
└────┬────┘                                  └────┬────┘
     │                                            │
     │ 1. POST /api/v1/tool/example              │
     │    (no payment proof)                     │
     │───────────────────────────────────────────>│
     │                                            │
     │ 2. 402 Payment Required                   │
     │    { payment, typedData }                 │
     │<───────────────────────────────────────────│
     │                                            │
     │ 3. Sign EIP-712 PaymentAuthorization      │
     │    (includes: owner, token, value,        │
     │     deadline, recipient, nonce)           │
     │                                            │
     │ 4. Submit to S402Facilitator contract     │
     │    settlePayment() or                     │
     │    settlePaymentWithPermit()              │
     │─────────────────────────────>┌──────────┐ │
     │                              │Blockchain│ │
     │ 5. Transaction confirmed     │          │ │
     │    (transfers tokens)        └──────────┘ │
     │<─────────────────────────────             │
     │                                            │
     │ 6. POST /api/v1/tool/example              │
     │    (with s402Proof + txHash)              │
     │───────────────────────────────────────────>│
     │                                            │
     │                              7. Verify on │
     │                                 blockchain │
     │                              (check tx,   │
     │                               confirmations)
     │                                            │
     │ 8. 200 OK { data }                        │
     │<───────────────────────────────────────────│
     │                                            │
```

### Payment Settlement

When `settlePayment()` is called on the S402Facilitator contract:

1. **Transfer Calculation**:
   - Total payment: `value`
   - Platform fee: `value * platformFeeBps / 10000`
   - To recipient: `value - platformFee`

2. **Transfers**:
   - `value - platformFee` → sent to `recipient` (API provider)
   - `platformFee` → stays in contract (accumulated per token)

3. **Event Emitted**:
```solidity
event PaymentSettled(
  bytes32 indexed paymentHash,
  address indexed payer,
  address indexed recipient,
  address token,
  uint256 value,
  uint256 platformFee
);
```

## 🛡️ Security Features

### Token Binding
The `token` address is part of the EIP-712 signed message, preventing attackers from substituting a different token after signature.

### Recipient Binding
The `recipient` address is in the signature, preventing front-running attacks where someone else claims the payment.

### Replay Protection
Each payment uses a unique `nonce` (32-byte random value). The contract tracks used nonces via `isPaymentUsed` mapping.

### Deadline Enforcement
Payments expire after the `deadline` timestamp (10 minutes by default), preventing old signatures from being reused.

### On-Chain Verification
The server verifies:
- Transaction exists on blockchain
- Transaction has minimum confirmations (configurable)
- Transaction called the correct contract method
- Payment parameters match (owner, token, value, deadline, recipient, nonce)

### EIP-712 Structured Data Signing
Uses typed data signing (not raw message signing) for better security and wallet UX.

## 🔐 Security Best Practices

### Production Deployment

**1. Private Key Management**
- **Never commit private keys** to version control
- Use environment variables or secure secret managers (AWS Secrets Manager, HashiCorp Vault)
- For SDK usage in production, use secure key storage:
```typescript
// ❌ BAD - hardcoded private key
const signer = new ethers.Wallet("0x123abc...");

// ✅ GOOD - use environment variable
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
```

**2. RPC Provider Security**
- **Don't use public RPC endpoints** in production (rate limits, reliability issues)
- Use dedicated RPC providers:
  - Ankr: https://ankr.com
  - QuickNode: https://quicknode.com
  - Chainstack: https://chainstack.com
  - Alchemy (if they support BNB Chain)
  
- Configure in `.env`:
```env
VITE_RPC_URL=https://your-dedicated-rpc-endpoint.com
```

**3. Rate Limiting**
- Implement rate limiting on your API endpoints to prevent abuse
- Consider using Express rate-limit middleware:
```bash
npm install express-rate-limit
```
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});

app.use('/api/', limiter);
```

**4. CORS Configuration**
- In production, **never use `AllowedOrigins=*`**
- Specify exact allowed origins:
```txt
AllowedOrigins=https://myapp.com,https://app.myapp.com
```

**5. Database Security**
- Use SSL/TLS connections for PostgreSQL
- Restrict database access to specific IP addresses
- Use strong passwords and rotate them regularly
- Example connection string with SSL:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

**6. Smart Contract Security**
- Audit your S402Facilitator contract before mainnet deployment
- Use a hardware wallet or multisig for contract owner operations
- Set reasonable platform fee limits (recommend < 5%)
- Test thoroughly on testnet (BSC Testnet Chain ID: 97)

**7. Minimum Confirmations**
- Balance security vs speed:
  - Development: `2` confirmations (~6 seconds)
  - Production (low-value): `6` confirmations (~18 seconds)
  - Production (high-value): `20+` confirmations (~60 seconds)

**8. Monitoring & Logging**
- Monitor payment settlements and failed transactions
- Set up alerts for:
  - Unusual payment volumes
  - Failed signature verifications
  - Contract pause events
- Use structured logging (pino) with proper log levels

**9. Environment Separation**
- Maintain separate environments:
  - Development: BSC Testnet (Chain ID: 97)
  - Staging: BNB Chain with test tokens
  - Production: BNB Chain with real tokens
- Never mix testnet and mainnet configurations

**10. Session Security**
- Set a strong `SESSION_SECRET` in production
- Use secure session cookies:
```typescript
app.use(session({
  secret: process.env.SESSION_SECRET!,
  cookie: { 
    secure: true, // HTTPS only
    httpOnly: true,
    sameSite: 'strict'
  }
}));
```

### Incident Response

If you detect suspicious activity:

1. **Pause the Contract** immediately via Admin Dashboard
2. **Investigate** transaction logs on BscScan
3. **Contact** your security team or auditor
4. **Fix** the vulnerability
5. **Audit** the fix
6. **Unpause** only after confirming safety

## 📚 Examples

See the `/examples` directory for working code:

### Basic Example
```bash
npx tsx examples/basic-example.ts
```
Auto-handling of 402 responses with SDK.

### Manual Example
```bash
npx tsx examples/manual-example.ts
```
Step-by-step payment flow without SDK auto-retry.

### Custom Token Example
```bash
npx tsx examples/custom-token-example.ts
```
Using a custom ERC-20 token instead of USD1.

## 🐛 Troubleshooting

### "Transaction verification failed: Not enough confirmations"

**Solution**: Wait longer or reduce `MinimumConfirmations` in `config.txt`

```txt
MinimumConfirmations=2  # Faster (6 seconds on BNB Chain)
MinimumConfirmations=20 # Slower but more secure (60 seconds)
```

### "Facilitator address is 0x000..."

**Problem**: You haven't deployed the S402Facilitator contract yet.

**Solution**: 
1. Deploy the contract to BNB Chain
2. Update `server/config/constants.ts` with your contract address
3. Restart the server

### "Invalid signature: EIP-712 signature verification failed"

**Problem**: Mismatch between signed data and expected data.

**Solution**: Ensure:
- Payment data matches exactly (including `token` field)
- Domain values are correct (chainId, verifyingContract)
- Signer address matches `payment.owner`

### "MetaMask Not Found"

**Problem**: MetaMask is not installed or not accessible.

**Solution**: 
1. Install MetaMask browser extension
2. Refresh the page
3. Click "Connect MetaMask" in admin dashboard

### "Failed to connect to contract"

**Problem**: Invalid facilitator address or network mismatch.

**Solution**:
1. Verify the contract address is correct
2. Check you're on the correct network (BNB Chain mainnet = 56)
3. Ensure the contract is deployed at that address

### CORS Errors

**Problem**: Frontend can't access API due to CORS policy.

**Solution**: Update `AllowedOrigins` in `config.txt`:

```txt
AllowedOrigins=https://myapp.com,https://localhost:3000
```

Or allow all origins during development:
```txt
AllowedOrigins=*
```

## 📖 Documentation

Visit the built-in documentation:
- **Home**: `http://localhost:5000/` - Overview and getting started
- **Docs**: `http://localhost:5000/docs` - API documentation and guides
- **Examples**: `http://localhost:5000/examples` - Interactive code examples
- **Admin**: `http://localhost:5000/admin` - Contract management dashboard

## 🤝 Contributing

This is a complete production-ready system. Key areas for customization:

1. **Add new API endpoints** in `server/routes.ts` with `requireS402()` middleware
2. **Customize pricing** via `config.txt` or per-endpoint in `PriceTable`
3. **Modify payment flow** by editing `server/services/s402Service.ts`
4. **Extend admin dashboard** in `client/src/pages/Admin.tsx`

## 📄 License

MIT License - feel free to use this in your own projects!

## 🔗 Resources

- BNB Chain Explorer: https://bscscan.com
- EIP-712 Standard: https://eips.ethereum.org/EIPS/eip-712
- EIP-2612 Permit: https://eips.ethereum.org/EIPS/eip-2612
- ethers.js Documentation: https://docs.ethers.org

---

**Built with ❤️ for the Web3 API economy**
