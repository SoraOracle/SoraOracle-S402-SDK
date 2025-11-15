/**
 * SORA S402 System Constants
 * Production deployment on BNB Chain mainnet
 */

// BNB Chain Smart Contract Addresses (Mainnet)
export const S402_FACILITATOR = "0x605c5c8d83152bd98ecAc9B77a845349DA3c48a3"; // SORA S402 Facilitator
export const USD1_TOKEN = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d"; // USD1 Token (World Liberty Financial)

// RPC Endpoints by Chain ID
export const RPC_ENDPOINTS: Record<number, string> = {
  56: "https://bsc-dataseed.binance.org", // BNB Chain Mainnet
  97: "https://data-seed-prebsc-1-s1.binance.org:8545", // BSC Testnet
};

// Chain Names
export const CHAIN_NAMES: Record<number, string> = {
  56: "BNB Smart Chain",
  97: "BSC Testnet",
};
