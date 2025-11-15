import { Link } from "wouter";
import { Terminal, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function Docs() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyCode = (code: string, section: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const installCode = `npm install ethers
# or
yarn add ethers`;

  const sdkSetupCode = `import { S402Client } from "./sdk";
import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const client = new S402Client({
  baseUrl: "http://localhost:5000",
  facilitator: "0x605c5c8d83152bd98ecAc9B77a845349DA3c48a3", // SORA S402 Facilitator
  token: "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d", // USD1 Token
  chainId: 56,
  provider,
  signer,
});`;

  const apiCallCode = `// Automatically handles payment flow
const result = await client.request("/api/v1/tool/example", {
  method: "POST",
  body: JSON.stringify({
    payload: { message: "Hello SORA S402!" }
  }),
});

console.log(result);
// { ok: true, result: { ... } }`;

  const curlExample = `# Initial request (no payment)
curl -X POST http://localhost:5000/api/v1/tool/example \\
  -H "Content-Type: application/json" \\
  -d '{"payload": {"test": "data"}}'

# Returns 402 with payment parameters
{
  "error": "PAYMENT_REQUIRED",
  "facilitator": "0x605c5c8d83152bd98ecAc9B77a845349DA3c48a3", // SORA S402 Facilitator
  "token": "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d", // USD1 Token
  "chainId": 56,
  "payment": {
    "owner": "0xYourWalletAddress", // Connected wallet
    "value": "1000000000000000", // 0.001 USD1
    "deadline": 1730678400,
    "recipient": "0x...", // API provider address
    "nonce": "0xabc...123" // Unique nonce
  },
  "typedData": { ... }
}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" data-testid="link-home">
              <a className="flex items-center gap-2">
                <Terminal className="w-6 h-6 text-primary" data-testid="icon-logo" />
                <span className="text-xl font-semibold font-mono" data-testid="text-brand">SORA S402</span>
              </a>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/docs">
                <a className="text-sm text-foreground font-medium" data-testid="link-docs">Docs</a>
              </Link>
              <Link href="/examples">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-examples">Examples</a>
              </Link>
              <Link href="/demo">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-demo">Demo</a>
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2" data-testid="link-github">
                <Button size="sm" variant="outline">
                  GitHub
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <h3 className="font-semibold mb-4" data-testid="text-nav-title">Documentation</h3>
              <nav className="space-y-2">
                {[
                  { href: "#introduction", label: "Introduction" },
                  { href: "#quick-start", label: "Quick Start" },
                  { href: "#sdk-reference", label: "SDK Reference" },
                  { href: "#api-endpoints", label: "API Endpoints" },
                  { href: "#smart-contract", label: "Smart Contract" },
                  { href: "#payment-flow", label: "Payment Flow" },
                ].map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                    data-testid={`link-nav-${idx}`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            {/* Introduction */}
            <section id="introduction" className="mb-16">
              <h1 className="text-4xl font-bold mb-4" data-testid="text-intro-title">S402 Documentation</h1>
              <p className="text-lg text-muted-foreground mb-6" data-testid="text-intro-description">
                S402 is a production-grade pay-per-API-call system using HTTP 402 status codes and blockchain settlement verification on BNB Chain.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" data-testid="badge-chain">BNB Chain (56)</Badge>
                <Badge variant="secondary" data-testid="badge-facilitator">Facilitator: 0x605c...48a3</Badge>
                <Badge variant="secondary" data-testid="badge-token">USD1: 0x8d0D...8B0d</Badge>
              </div>
            </section>

            {/* Quick Start */}
            <section id="quick-start" className="mb-16">
              <h2 className="text-3xl font-bold mb-6" data-testid="text-quickstart-title">Quick Start</h2>
              
              <h3 className="text-xl font-semibold mb-4" data-testid="text-install-title">Installation</h3>
              <Card className="p-4 mb-6" data-testid="card-install">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-muted-foreground font-mono">Terminal</span>
                  <button
                    onClick={() => copyCode(installCode, "install")}
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="button-copy-install"
                  >
                    {copiedSection === "install" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <pre className="text-sm">
                  <code className="font-mono" data-testid="code-install">{installCode}</code>
                </pre>
              </Card>

              <h3 className="text-xl font-semibold mb-4" data-testid="text-setup-title">SDK Setup</h3>
              <Card className="p-4 mb-6" data-testid="card-setup">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-muted-foreground font-mono">TypeScript</span>
                  <button
                    onClick={() => copyCode(sdkSetupCode, "setup")}
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="button-copy-setup"
                  >
                    {copiedSection === "setup" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <pre className="text-sm overflow-x-auto">
                  <code className="font-mono" data-testid="code-setup">{sdkSetupCode}</code>
                </pre>
              </Card>

              <h3 className="text-xl font-semibold mb-4" data-testid="text-usage-title">Making API Calls</h3>
              <Card className="p-4 mb-6" data-testid="card-usage">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-muted-foreground font-mono">TypeScript</span>
                  <button
                    onClick={() => copyCode(apiCallCode, "usage")}
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="button-copy-usage"
                  >
                    {copiedSection === "usage" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <pre className="text-sm overflow-x-auto">
                  <code className="font-mono" data-testid="code-usage">{apiCallCode}</code>
                </pre>
              </Card>
            </section>

            {/* API Endpoints */}
            <section id="api-endpoints" className="mb-16">
              <h2 className="text-3xl font-bold mb-6" data-testid="text-endpoints-title">API Endpoints</h2>
              
              <Card className="mb-4" data-testid="card-endpoint-example">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="default" data-testid="badge-method-post">POST</Badge>
                    <code className="font-mono text-sm" data-testid="code-endpoint-path">/api/v1/tool/example</code>
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid="text-endpoint-desc">Execute example tool with payment verification</p>
                </div>
                <div className="p-6">
                  <h4 className="font-semibold mb-3" data-testid="text-request-title">Request Body</h4>
                  <pre className="text-sm bg-muted p-4 rounded mb-4 overflow-x-auto">
                    <code className="font-mono" data-testid="code-request">{`{
  "payload": {
    "message": "Your data here"
  },
  "s402Proof": {
    "payment": { ... },
    "authSig": { ... }
  }
}`}</code>
                  </pre>
                  
                  <h4 className="font-semibold mb-3" data-testid="text-response-title">Response (200 OK)</h4>
                  <pre className="text-sm bg-muted p-4 rounded overflow-x-auto">
                    <code className="font-mono" data-testid="code-response">{`{
  "ok": true,
  "result": {
    "echo": { "message": "Your data here" },
    "caller": "0x...",
    "processedAt": 1730678400000
  }
}`}</code>
                  </pre>
                </div>
              </Card>

              <Card className="mb-4" data-testid="card-endpoint-health">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="secondary" data-testid="badge-method-get">GET</Badge>
                    <code className="font-mono text-sm" data-testid="code-health-path">/api/health</code>
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid="text-health-desc">Health check endpoint (no payment required)</p>
                </div>
                <div className="p-6">
                  <pre className="text-sm bg-muted p-4 rounded overflow-x-auto">
                    <code className="font-mono" data-testid="code-health-response">{`{
  "ok": true,
  "service": "S402 Payment-Gated API",
  "timestamp": 1730678400000
}`}</code>
                  </pre>
                </div>
              </Card>

              <Card className="mb-4" data-testid="card-endpoint-info">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="secondary" data-testid="badge-method-info-get">GET</Badge>
                    <code className="font-mono text-sm" data-testid="code-info-path">/api/info</code>
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid="text-info-desc">
                    Get system information including recipient wallet, available endpoints, pricing, and contract addresses (no payment required)
                  </p>
                </div>
                <div className="p-6">
                  <pre className="text-sm bg-muted p-4 rounded overflow-x-auto">
                    <code className="font-mono" data-testid="code-info-response">{`{
  "ok": true,
  "system": "S402 Payment-Gated API",
  "recipient": "0x...",
  "endpoints": [
    {
      "path": "/api/v1/tool/example",
      "method": "POST",
      "routeKey": "tool.example",
      "description": "Example pay-gated endpoint...",
      "priceUSD1": "0.001",
      "requiresPayment": true
    }
  ]
}`}</code>
                  </pre>
                </div>
              </Card>
            </section>

            {/* Smart Contract */}
            <section id="smart-contract" className="mb-16">
              <h2 className="text-3xl font-bold mb-6" data-testid="text-contract-title">Smart Contract</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2" data-testid="text-facilitator-title">S402Facilitator</h3>
                  <p className="text-sm text-muted-foreground mb-2" data-testid="text-facilitator-desc">
                    Main payment settlement contract on BNB Chain
                  </p>
                  <Card className="p-4" data-testid="card-facilitator">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono" data-testid="code-facilitator-address">0x605c5c8d83152bd98ecAc9B77a845349DA3c48a3</code>
                      <a
                        href="https://bscscan.com/address/0x605c5c8d83152bd98ecAc9B77a845349DA3c48a3"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm flex items-center gap-1"
                        data-testid="link-facilitator-scan"
                      >
                        View on BscScan
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </Card>
                </div>

                <div>
                  <h3 className="font-semibold mb-2" data-testid="text-token-title">USD1 Token</h3>
                  <p className="text-sm text-muted-foreground mb-2" data-testid="text-token-desc">
                    EIP-2612 compatible stablecoin for payments (18 decimals)
                  </p>
                  <Card className="p-4" data-testid="card-token">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono" data-testid="code-token-address">0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d</code>
                      <a
                        href="https://bscscan.com/token/0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm flex items-center gap-1"
                        data-testid="link-token-scan"
                      >
                        View on BscScan
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            {/* Payment Flow */}
            <section id="payment-flow">
              <h2 className="text-3xl font-bold mb-6" data-testid="text-flow-doc-title">Payment Flow Details</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3" data-testid="text-step1-title">1. Initial API Request</h3>
                  <p className="text-muted-foreground mb-3" data-testid="text-step1-desc">
                    Client calls API endpoint without payment proof. Server responds with 402 Payment Required status.
                  </p>
                  <Card className="p-4" data-testid="card-step1">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-muted-foreground font-mono">curl</span>
                      <button
                        onClick={() => copyCode(curlExample, "curl")}
                        className="text-muted-foreground hover:text-foreground"
                        data-testid="button-copy-curl"
                      >
                        {copiedSection === "curl" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <pre className="text-sm overflow-x-auto">
                      <code className="font-mono" data-testid="code-curl">{curlExample}</code>
                    </pre>
                  </Card>
                </div>

                <div>
                  <h3 className="font-semibold mb-3" data-testid="text-step2-title">2. Sign & Settle Payment</h3>
                  <p className="text-muted-foreground" data-testid="text-step2-desc">
                    Client signs EIP-712 PaymentAuthorization and optional EIP-2612 Permit, then calls 
                    settlePayment or settlePaymentWithPermit on the S402Facilitator contract.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3" data-testid="text-step3-title">3. Retry with Proof</h3>
                  <p className="text-muted-foreground" data-testid="text-step3-desc">
                    After on-chain settlement, client retries API request with S402Proof in request body. 
                    Server verifies settlement via isPaymentUsed call and returns API response.
                  </p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
