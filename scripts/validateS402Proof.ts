/**
 * Standalone helper to validate an S402 proof payload.
 *
 * Usage examples:
 *   npx tsx scripts/validateS402Proof.ts ./proof.json
 *   npx tsx scripts/validateS402Proof.ts '{"payment":{...},"authSig":{...}}'
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Address, EIP712Domain, S402Proof } from "@shared/schema";
import { s402ProofSchema } from "@shared/schema";
import { verifyEIP712Signature } from "../server/services/s402Service";
import { loadConfig, getChainId, S402_FACILITATOR } from "../server/config/env";

loadConfig();

function usage(): never {
  console.error("Usage: npx tsx scripts/validateS402Proof.ts <proof.json | '{\"proof\":...}'>");
  process.exit(1);
}

function readInputPayload(rawArg: string): unknown {
  if (!rawArg) {
    usage();
  }
  
  const trimmed = rawArg.trim();
  
  try {
    if (trimmed.startsWith("{")) {
      return JSON.parse(trimmed);
    }
    
    const filePath = resolve(process.cwd(), trimmed);
    const fileContents = readFileSync(filePath, "utf-8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Failed to parse provided proof payload:", error);
    process.exit(1);
  }
}

function extractProof(candidate: unknown): unknown {
  if (candidate && typeof candidate === "object" && "s402Proof" in candidate) {
    // @ts-ignore - runtime guard handles the type
    return candidate.s402Proof;
  }
  return candidate;
}

function buildDomain(): EIP712Domain {
  return {
    name: "S402Facilitator",
    version: "1",
    chainId: getChainId(),
    verifyingContract: S402_FACILITATOR as Address,
  };
}

async function main() {
  const rawArg = process.argv.slice(2).join(" ");
  const payload = readInputPayload(rawArg);
  const proofCandidate = extractProof(payload);
  
  console.log("🔍 Loaded proof payload:");
  console.log(JSON.stringify(proofCandidate, null, 2));
  
  const validation = s402ProofSchema.safeParse(proofCandidate);
  
  if (!validation.success) {
    console.error("❌ Schema validation failed:");
    for (const issue of validation.error.issues) {
      console.error(` - [${issue.path.join(".") || "root"}] ${issue.message}`);
    }
    process.exit(1);
  }
  
  const proof: S402Proof = validation.data;
  console.log("✅ s402ProofSchema validation succeeded");
  
  const domain = buildDomain();
  console.log("🧾 EIP-712 domain:", domain);
  
  const isSignatureValid = verifyEIP712Signature(proof.payment, proof.authSig, domain);
  
  if (isSignatureValid) {
    console.log("✅ EIP-712 signature matches payment owner");
  } else {
    console.error("❌ Invalid EIP-712 signature for provided payment");
    process.exit(2);
  }
}

main().catch((error) => {
  console.error("Unexpected error while validating proof:", error);
  process.exit(1);
});
