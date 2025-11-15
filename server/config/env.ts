import { z } from "zod";
import { readFileSync } from "fs";
import { join } from "path";
import { S402_FACILITATOR, USD1_TOKEN, RPC_ENDPOINTS, CHAIN_NAMES } from "./constants";

// Re-export constants for convenience
export { S402_FACILITATOR, USD1_TOKEN };

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.number(),
  CHAIN_ID: z.number(),
  BSC_RPC: z.string(),
  RECIPIENT: z.string().regex(/^0x[0-9a-fA-F]{40}$/i),
  BASE_PRICE_USD1: z.string(), // wei format
  PRICE_TABLE_JSON: z.string(),
  TRUST_PROXY: z.boolean(),
  ALLOWED_ORIGINS: z.string(),
  MINIMUM_CONFIRMATIONS: z.number().min(1).max(100),
});

type EnvConfig = z.infer<typeof configSchema>;

let config: EnvConfig;

function parseConfigFile(): Record<string, string> {
  try {
    const configPath = join(process.cwd(), "config.txt");
    const content = readFileSync(configPath, "utf-8");
    
    const parsed: Record<string, string> = {};
    
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith("#")) continue;
      
      // Parse "Key: Value" format
      const colonIndex = trimmed.indexOf(":");
      if (colonIndex === -1) continue;
      
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();
      
      if (key && value) {
        parsed[key] = value;
      }
    }
    
    return parsed;
  } catch (error) {
    console.warn("⚠️  Could not read config.txt, using defaults");
    return {};
  }
}

function usd1ToWei(usd1: string): string {
  const num = parseFloat(usd1);
  if (isNaN(num)) return "1000000000000000"; // default 0.001
  
  // USD1 has 18 decimals, convert to wei
  const wei = BigInt(Math.floor(num * 1e18));
  return wei.toString();
}

function parsePriceTable(priceTableStr: string): string {
  if (!priceTableStr || priceTableStr.trim() === "") {
    return JSON.stringify({});
  }
  
  const entries = priceTableStr.trim().split(/\s+/);
  const priceTable: Record<string, string> = {};
  
  for (const entry of entries) {
    const [routeKey, priceUSD1] = entry.split(";");
    if (routeKey && priceUSD1) {
      priceTable[routeKey] = usd1ToWei(priceUSD1);
    }
  }
  
  return JSON.stringify(priceTable);
}

export function loadConfig(): EnvConfig {
  const configFile = parseConfigFile();
  
  // Map user-friendly keys to internal format
  const environment = configFile.Environment || "development";
  const port = parseInt(configFile.Port || "5000", 10);
  const chainId = parseInt(configFile.ChainId || "56", 10);
  const recipient = configFile.Recipient || "0x0000000000000000000000000000000000000002";
  const price = configFile.Price || "0.001";
  const priceTable = configFile.PriceTable || "";
  const trustProxy = configFile.TrustProxy === "true";
  const allowedOrigins = configFile.AllowedOrigins || "*";
  const minimumConfirmations = parseInt(configFile.MinimumConfirmations || "2", 10);
  
  // Get RPC endpoint from constants
  const bscRpc = RPC_ENDPOINTS[chainId] || RPC_ENDPOINTS[56];
  const chainName = CHAIN_NAMES[chainId] || "Unknown Chain";
  
  const envConfig = {
    NODE_ENV: environment as "development" | "production" | "test",
    PORT: port,
    CHAIN_ID: chainId,
    BSC_RPC: bscRpc,
    RECIPIENT: recipient,
    BASE_PRICE_USD1: usd1ToWei(price),
    PRICE_TABLE_JSON: parsePriceTable(priceTable),
    TRUST_PROXY: trustProxy,
    ALLOWED_ORIGINS: allowedOrigins,
    MINIMUM_CONFIRMATIONS: minimumConfirmations,
  };
  
  const parsed = configSchema.safeParse(envConfig);
  
  if (!parsed.success) {
    console.error("❌ Invalid configuration:", parsed.error.format());
    throw new Error("Invalid configuration");
  }
  
  config = parsed.data;
  
  console.log("✅ Configuration loaded:");
  console.log(`   Environment: ${config.NODE_ENV}`);
  console.log(`   Port: ${config.PORT}`);
  console.log(`   Chain: ${config.CHAIN_ID} (${chainName})`);
  console.log(`   Recipient: ${config.RECIPIENT}`);
  console.log(`   Base Price: ${price} USD1 (${config.BASE_PRICE_USD1} wei)`);
  console.log(`   Minimum Confirmations: ${config.MINIMUM_CONFIRMATIONS}`);
  console.log(`   Trust Proxy: ${config.TRUST_PROXY}`);
  
  return config;
}

export function getConfig(): EnvConfig {
  if (!config) {
    return loadConfig();
  }
  return config;
}

// Parsed config accessors
export function getPriceTable(): Record<string, string> {
  const cfg = getConfig();
  try {
    return JSON.parse(cfg.PRICE_TABLE_JSON);
  } catch (e) {
    console.error("Failed to parse PRICE_TABLE_JSON, using empty object");
    return {};
  }
}

export function getChainId(): number {
  return getConfig().CHAIN_ID;
}

export function getPort(): number {
  return getConfig().PORT;
}

export function isTrustProxy(): boolean {
  return getConfig().TRUST_PROXY;
}

export function getMinimumConfirmations(): number {
  return getConfig().MINIMUM_CONFIRMATIONS;
}
