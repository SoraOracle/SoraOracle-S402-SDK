import { Link } from "wouter";
import { Code2, Shield, Zap, ArrowRight, Check, Copy, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function Home() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const quickStartCode = `import { S402Client } from "@s402/sdk";
import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Contract addresses are hardcoded in the SDK for BNB Chain
const client = new S402Client({
  baseUrl: "https://api.example.com",
  provider,
  signer,
  // facilitator, token, and chainId use BNB Chain defaults
});

// Auto-handles 402 → sign → settle → retry
const result = await client.request("/api/v1/tool/example", {
  method: "POST",
  body: JSON.stringify({ payload: { foo: "bar" } }),
});`;

  const features = [
    {
      icon: Code2,
      title: "HTTP 402 Payment Required",
      description: "Standard HTTP status code for payment gating. APIs return structured payment parameters when accessed without proof.",
    },
    {
      icon: Shield,
      title: "On-Chain Verification",
      description: "Every payment is verified on BNB Chain via S402Facilitator contract. No trust required, cryptographically provable.",
    },
    {
      icon: Zap,
      title: "Auto-Retry SDK",
      description: "TypeScript & Python SDKs automatically handle 402 responses, sign payments, settle on-chain, and retry requests.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Terminal className="w-6 h-6 text-primary" data-testid="icon-logo" />
              <span className="text-xl font-semibold font-mono" data-testid="text-brand">SORA S402</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/docs">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-docs">Docs</a>
              </Link>
              <Link href="/examples">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-examples">Examples</a>
              </Link>
              <Link href="/demo">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-demo">Demo</a>
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-github">
                GitHub
              </a>
              <Link href="/docs">
                <a>
                  <Button size="sm" data-testid="button-get-started">
                    Get Started
                  </Button>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4" data-testid="badge-version">
                BNB Chain • Mainnet Ready
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6" data-testid="text-hero-title">
                Pay-per-API-call with
                <br />
                <span className="text-primary">Blockchain Settlement</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed" data-testid="text-hero-description">
                Production-grade HTTP 402 payment gating with on-chain verification. 
                Secure, verifiable, pay-as-you-go API access using the SORA S402 protocol on BNB Chain.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/docs">
                  <a>
                    <Button size="lg" data-testid="button-quick-start">
                      <span className="flex items-center gap-2">
                        Quick Start
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </Button>
                  </a>
                </Link>
                <Link href="/examples">
                  <a>
                    <Button size="lg" variant="outline" data-testid="button-view-demo">
                      View Demo
                    </Button>
                  </a>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" data-testid="icon-check-eip712" />
                  <span>EIP-712 Signatures</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" data-testid="icon-check-eip2612" />
                  <span>EIP-2612 Permits</span>
                </div>
              </div>
            </div>

            {/* Code Preview */}
            <Card className="p-6 bg-card" data-testid="card-code-preview">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <button
                  onClick={() => copyCode(quickStartCode, "quick-start")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-copy-code"
                >
                  {copiedCode === "quick-start" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <pre className="text-sm overflow-x-auto">
                <code className="font-mono text-foreground" data-testid="code-quick-start">
                  {quickStartCode}
                </code>
              </pre>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-features-title">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-features-description">
              S402 combines HTTP 402 status codes with blockchain settlement for trustless, pay-per-use API access.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover-elevate transition-all" data-testid={`card-feature-${index}`}>
                <feature.icon className="w-10 h-10 text-primary mb-4" data-testid={`icon-feature-${index}`} />
                <h3 className="text-xl font-semibold mb-3" data-testid={`text-feature-title-${index}`}>{feature.title}</h3>
                <p className="text-muted-foreground" data-testid={`text-feature-desc-${index}`}>{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Flow */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16" data-testid="text-flow-title">Payment Flow</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "API Call", desc: "Client requests endpoint without payment" },
              { step: "2", title: "402 Response", desc: "Server returns payment parameters" },
              { step: "3", title: "On-Chain Settlement", desc: "Client signs & settles via contract" },
              { step: "4", title: "Verified Access", desc: "Server verifies & returns data" },
            ].map((step, idx) => (
              <div key={idx} className="relative" data-testid={`card-step-${idx}`}>
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold" data-testid={`badge-step-${idx}`}>
                    {step.step}
                  </div>
                  <h3 className="font-semibold mb-2" data-testid={`text-step-title-${idx}`}>{step.title}</h3>
                  <p className="text-sm text-muted-foreground" data-testid={`text-step-desc-${idx}`}>{step.desc}</p>
                </Card>
                {idx < 3 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2 text-muted-foreground w-6 h-6" data-testid={`icon-arrow-${idx}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90" data-testid="text-cta-description">
            Integrate S402 payment gating into your API in minutes. Full TypeScript and Python SDK support.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/docs">
              <a>
                <Button size="lg" variant="secondary" data-testid="button-cta-docs">
                  Read Documentation
                </Button>
              </a>
            </Link>
            <Link href="/examples">
              <a>
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-cta-examples">
                  View Examples
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground" data-testid="text-footer">
              S402 Protocol • Built on BNB Chain • Open Source
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-github">GitHub</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-docs">Documentation</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-contract">Contract</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
