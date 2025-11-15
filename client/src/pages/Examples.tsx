import { Link } from "wouter";
import { Terminal, Play, Code2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function Examples() {
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState('{"message": "Hello SORA S402!"}');

  const testApi = async () => {
    setIsLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      const response = await fetch("/api/v1/tool/example", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: JSON.parse(payload) }),
      });

      const data = await response.json();
      setApiResponse({ status: response.status, data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const healthCheck = async () => {
    setIsLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setApiResponse({ status: response.status, data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-docs">Docs</a>
              </Link>
              <Link href="/examples">
                <a className="text-sm text-foreground font-medium" data-testid="link-examples">Examples</a>
              </Link>
              <Link href="/demo">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-demo">Demo</a>
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" data-testid="link-github">
                <Button size="sm" variant="outline">
                  GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4" data-testid="text-examples-title">Interactive Examples</h1>
          <p className="text-lg text-muted-foreground" data-testid="text-examples-description">
            Try out the SORA S402 API with live examples. Test the payment flow and explore the SDK functionality.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* API Playground */}
          <div>
            <Card className="p-6" data-testid="card-playground">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" data-testid="text-playground-title">
                <Code2 className="w-6 h-6 text-primary" />
                API Playground
              </h2>

              <Tabs defaultValue="example" className="mb-6">
                <TabsList className="grid w-full grid-cols-2" data-testid="tabs-endpoint">
                  <TabsTrigger value="example" data-testid="tab-example">Example Tool</TabsTrigger>
                  <TabsTrigger value="health" data-testid="tab-health">Health Check</TabsTrigger>
                </TabsList>

                <TabsContent value="example" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block" data-testid="label-payload">Request Payload</label>
                    <Textarea
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                      className="font-mono text-sm"
                      rows={6}
                      placeholder='{"message": "Hello S402!"}'
                      data-testid="input-payload"
                    />
                    <p className="text-xs text-muted-foreground mt-2" data-testid="text-payload-help">
                      Note: This endpoint requires payment. You'll receive a 402 response with payment details.
                    </p>
                  </div>
                  <Button
                    onClick={testApi}
                    disabled={isLoading}
                    className="w-full"
                    data-testid="button-test-api"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isLoading ? "Sending..." : "Send Request"}
                  </Button>
                </TabsContent>

                <TabsContent value="health" className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-4" data-testid="text-health-help">
                      Test the public health check endpoint (no payment required).
                    </p>
                    <div className="bg-muted p-3 rounded font-mono text-sm" data-testid="code-health-endpoint">
                      GET /api/health
                    </div>
                  </div>
                  <Button
                    onClick={healthCheck}
                    disabled={isLoading}
                    variant="secondary"
                    className="w-full"
                    data-testid="button-health-check"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isLoading ? "Checking..." : "Check Health"}
                  </Button>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Response Viewer */}
          <div>
            <Card className="p-6" data-testid="card-response">
              <h2 className="text-2xl font-bold mb-6" data-testid="text-response-title">Response</h2>

              {!apiResponse && !error && (
                <div className="text-center py-12 text-muted-foreground" data-testid="text-response-empty">
                  <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Send a request to see the response</p>
                </div>
              )}

              {error && (
                <div className="border border-destructive bg-destructive/10 rounded p-4 mb-4" data-testid="alert-error">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-destructive mb-1">Error</h3>
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {apiResponse && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={apiResponse.status === 200 ? "default" : apiResponse.status === 402 ? "secondary" : "destructive"}
                      data-testid="badge-status"
                    >
                      {apiResponse.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground" data-testid="text-status-label">
                      {apiResponse.status === 200
                        ? "OK"
                        : apiResponse.status === 402
                        ? "Payment Required"
                        : "Error"}
                    </span>
                  </div>

                  {apiResponse.status === 402 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-4 mb-4" data-testid="alert-402">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-1">Payment Required</h3>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            This endpoint requires payment. The response includes payment parameters for blockchain settlement.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium mb-2" data-testid="text-response-body">Response Body</h3>
                    <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                      <code className="font-mono" data-testid="code-response-body">
                        {JSON.stringify(apiResponse.data, null, 2)}
                      </code>
                    </pre>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Code Examples */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6" data-testid="text-code-examples-title">Code Examples</h2>
          
          <Tabs defaultValue="typescript" className="mb-6">
            <TabsList data-testid="tabs-language">
              <TabsTrigger value="typescript" data-testid="tab-typescript">TypeScript</TabsTrigger>
              <TabsTrigger value="curl" data-testid="tab-curl">cURL</TabsTrigger>
            </TabsList>

            <TabsContent value="typescript">
              <Card className="p-6" data-testid="card-typescript-example">
                <h3 className="font-semibold mb-4" data-testid="text-ts-title">Using the TypeScript SDK</h3>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code className="font-mono" data-testid="code-typescript">{`import { S402Client } from "./sdk";
import { ethers } from "ethers";

// Initialize provider and signer
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Create S402 client
const client = new S402Client({
  baseUrl: "http://localhost:5000",
  facilitator: "0x605c5c8d83152bd98ecAc9B77a845349DA3c48a3", // SORA S402 Facilitator
  token: "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d", // USD1 Token
  chainId: 56,
  provider,
  signer,
});

// Make API call - automatically handles 402 payment flow
try {
  const result = await client.request("/api/v1/tool/example", {
    method: "POST",
    body: JSON.stringify({
      payload: { message: "Hello SORA S402!" }
    }),
  });
  
  console.log("Success:", result);
} catch (error) {
  console.error("Error:", error);
}`}</code>
                </pre>
              </Card>
            </TabsContent>

            <TabsContent value="curl">
              <Card className="p-6" data-testid="card-curl-example">
                <h3 className="font-semibold mb-4" data-testid="text-curl-title">Manual Testing with cURL</h3>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  <code className="font-mono" data-testid="code-curl">{`# Health check (no payment required)
curl http://localhost:5000/api/health

# Pay-gated endpoint (returns 402)
curl -X POST http://localhost:5000/api/v1/tool/example \\
  -H "Content-Type: application/json" \\
  -d '{"payload": {"message": "test"}}'

# Expected 402 response with payment details:
{
  "error": "PAYMENT_REQUIRED",
  "message": "Payment required via SORA S402.",
  "facilitator": "0x605c5c8d83152bd98ecAc9B77a845349DA3c48a3", // SORA S402 Facilitator
  "token": "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d", // USD1 Token
  "chainId": 56,
  "routeKey": "tool.example",
  "payment": {
    "owner": "0xYourWalletAddress", // Connected wallet
    "value": "1000000000000000", // 0.001 USD1
    "deadline": 1730678400,
    "recipient": "0x...", // API provider
    "nonce": "0x..." // Unique nonce
  },
  "typedData": { ... }
}`}</code>
                </pre>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
