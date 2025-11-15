import { useState } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const S402_FACILITATOR = '0x605c5c8d83152bd98ecAc9B77a845349DA3c48a3';
const USD1_TOKEN = '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d';

const S402_ABI = [
  'function settlePaymentWithPermit((address owner, uint256 value, uint256 deadline, address recipient, bytes32 nonce) payment, (uint8 v, bytes32 r, bytes32 s) permitSig, (uint8 v, bytes32 r, bytes32 s) authSig) external returns (bool)',
  'function settlePayment((address owner, uint256 value, uint256 deadline, address recipient, bytes32 nonce) payment, (uint8 v, bytes32 r, bytes32 s) authSig) external returns (bool)',
  'event PaymentSettled(address indexed from, address indexed to, uint256 value, uint256 platformFee, bytes32 nonce)'
];

const USD1_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function nonces(address owner) external view returns (uint256)',
  'function name() external view returns (string)',
  'function version() external view returns (string)'
];

const EIP712_DOMAIN = {
  name: 'S402Facilitator',
  version: '1',
  chainId: 56,
  verifyingContract: S402_FACILITATOR
};

const EIP712_TYPES = {
  PaymentAuthorization: [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
    { name: 'recipient', type: 'address' },
    { name: 'nonce', type: 'bytes32' }
  ]
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Demo() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.01');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [usd1Balance, setUsd1Balance] = useState('');
  const [bnbBalance, setBnbBalance] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const { toast } = useToast();

  const checkAndSwitchNetwork = async (): Promise<ethers.BrowserProvider> => {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask');
    }

    let provider = new ethers.BrowserProvider(window.ethereum);
    let network = await provider.getNetwork();
    const bscChainId = BigInt(56);

    if (network.chainId !== bscChainId) {
      toast({ title: "Switching Network", description: "Switching to BNB Chain..." });
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x38',
              chainName: 'BNB Smart Chain',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
              },
              rpcUrls: ['https://bsc-dataseed.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com/']
            }],
          });
        } else {
          throw new Error(`Failed to switch to BNB Chain: ${switchError.message}`);
        }
      }

      provider = new ethers.BrowserProvider(window.ethereum);
      network = await provider.getNetwork();
      
      if (network.chainId !== bscChainId) {
        throw new Error('Network switch failed - please manually switch to BNB Chain in MetaMask');
      }
    }

    return provider;
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast({ title: "MetaMask Not Found", description: "Please install MetaMask", variant: "destructive" });
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = await checkAndSwitchNetwork();
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setWalletAddress(address);
      
      const bnbBal = await provider.getBalance(address);
      setBnbBalance(ethers.formatEther(bnbBal));
      
      const usd1Contract = new ethers.Contract(USD1_TOKEN, USD1_ABI, provider);
      const bal = await usd1Contract.balanceOf(address);
      setUsd1Balance(ethers.formatUnits(bal, 18));
      
      const allowance = await usd1Contract.allowance(address, S402_FACILITATOR);
      const minAllowance = ethers.parseUnits('1', 18);
      if (allowance < minAllowance) {
        setNeedsApproval(true);
        setIsApproved(false);
        toast({ title: "Wallet Connected", description: "Please approve USD1 spending first." });
      } else {
        setNeedsApproval(false);
        setIsApproved(true);
        toast({ title: "Wallet Connected", description: "Ready to send payments!" });
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      const errorMessage = error.reason || error.message || 'Unknown error occurred';
      toast({ 
        title: "Connection Failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  };

  const approveUSD1 = async () => {
    try {
      if (!window.ethereum) {
        toast({ title: "MetaMask Not Found", description: "Please install MetaMask", variant: "destructive" });
        return;
      }

      setLoading(true);
      const provider = await checkAndSwitchNetwork();
      
      toast({ title: "Approving", description: "Sign the approval transaction..." });
      const signer = await provider.getSigner();
      const usd1Contract = new ethers.Contract(USD1_TOKEN, USD1_ABI, signer);
      
      const maxApproval = ethers.parseUnits('1000000', 18);
      const tx = await usd1Contract.approve(S402_FACILITATOR, maxApproval);
      
      toast({ title: "Confirming", description: "Waiting for confirmation..." });
      await tx.wait();
      
      setNeedsApproval(false);
      setIsApproved(true);
      toast({ title: "Approved!", description: "USD1 approved! You can now send payments with 1 signature." });
      setLoading(false);
    } catch (error: any) {
      console.error('Approval error:', error);
      const errorMessage = error.reason || error.message || 'Unknown error occurred';
      toast({ 
        title: "Approval Failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
      setLoading(false);
    }
  };

  const generateNonce = () => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return '0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const sendPayment = async () => {
    try {
      if (!window.ethereum) {
        toast({ title: "MetaMask Not Found", description: "Please install MetaMask", variant: "destructive" });
        return;
      }

      setLoading(true);
      const provider = await checkAndSwitchNetwork();
      
      const signer = await provider.getSigner();
      const from = await signer.getAddress();
      
      const amountInUnits = ethers.parseUnits(amount, 18);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const deadline = currentTimestamp + 3600;
      const paymentNonce = generateNonce();
      
      const authMessage = {
        owner: from,
        spender: S402_FACILITATOR,
        value: amountInUnits,
        deadline: deadline,
        recipient: recipient,
        nonce: paymentNonce
      };
      
      toast({ title: "Sign Payment", description: "Sign the payment in MetaMask..." });
      const authSigRaw = await signer.signTypedData(EIP712_DOMAIN, EIP712_TYPES, authMessage);
      const authSig = ethers.Signature.from(authSigRaw);
      
      const payment = {
        owner: from,
        value: amountInUnits,
        deadline: deadline,
        recipient: recipient,
        nonce: paymentNonce
      };
      
      const authSigStruct = {
        v: authSig.v,
        r: authSig.r,
        s: authSig.s
      };
      
      toast({ title: "Confirming", description: "Settlement in progress..." });
      const facilitator = new ethers.Contract(S402_FACILITATOR, S402_ABI, signer);
      const tx = await facilitator.settlePayment(payment, authSigStruct);
      await tx.wait();
      
      setTxHash(tx.hash);
      toast({ title: "Success!", description: "Payment complete!" });
      setLoading(false);
      
      const usd1Contract = new ethers.Contract(USD1_TOKEN, USD1_ABI, provider);
      const bal = await usd1Contract.balanceOf(from);
      setUsd1Balance(ethers.formatUnits(bal, 18));
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.reason || error.message || 'Unknown error occurred';
      toast({ 
        title: "Payment Failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="container mx-auto max-w-4xl py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-primary">SORA S402 Payment Demo</h1>
          <p className="text-muted-foreground">
            Try the SORA S402 payment system live on BNB Chain mainnet
          </p>
        </div>

        {/* Wallet Connection */}
        <Card className="mb-6" data-testid="card-wallet-connection">
          <CardHeader>
            <h2 className="text-xl font-bold">1. Connect Wallet</h2>
          </CardHeader>
          <CardContent>
            {!walletAddress ? (
              <Button 
                onClick={connectWallet}
                data-testid="button-connect-wallet"
              >
                Connect MetaMask
              </Button>
            ) : (
              <div>
                <p className="text-green-600 dark:text-green-400 mb-3" data-testid="text-wallet-address">
                  Connected: {walletAddress}
                </p>
                <div className="space-y-2 bg-muted p-4 rounded border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">USD1 Balance:</span>
                    <span className="font-mono font-bold" data-testid="text-usd1-balance">
                      {parseFloat(usd1Balance).toFixed(4)} USD1
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">BNB Balance (for gas):</span>
                    <span className="font-mono font-bold" data-testid="text-bnb-balance">
                      {parseFloat(bnbBalance).toFixed(6)} BNB
                    </span>
                  </div>
                </div>
                {parseFloat(usd1Balance) < 0.01 && (
                  <p className="text-orange-600 dark:text-orange-400 mt-3 text-sm">
                    Low USD1 balance! You need at least 0.01 USD1 to test payments.
                  </p>
                )}
                {parseFloat(bnbBalance) < 0.001 && (
                  <p className="text-destructive mt-3 text-sm">
                    Insufficient BNB! You need at least 0.001 BNB (~$0.50) for gas fees.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approval Section */}
        {walletAddress && needsApproval && (
          <Card className="mb-6 border-primary" data-testid="card-approval">
            <CardHeader>
              <h2 className="text-xl font-bold text-primary">2. Approve USD1</h2>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                One-time approval required. After this, all payments only need 1 signature.
              </p>
              <Button
                onClick={approveUSD1}
                disabled={loading}
                data-testid="button-approve-usd1"
              >
                {loading ? 'Approving...' : 'Approve USD1'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment Form */}
        {walletAddress && isApproved && (
          <>
            <Card className="mb-6" data-testid="card-payment-config">
              <CardHeader>
                <h2 className="text-xl font-bold">
                  {needsApproval ? '3' : '2'}. Configure Payment
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Recipient Address</label>
                    <Input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="font-mono"
                      placeholder="0x..."
                      data-testid="input-recipient"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Default: SORA Admin Wallet</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Amount (USD1)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.01"
                      data-testid="input-amount"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Minimum: 0.01 USD1</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6" data-testid="card-send-payment">
              <CardHeader>
                <h2 className="text-xl font-bold">
                  {needsApproval ? '4' : '3'}. Send Payment
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  Just 1 signature! Your wallet pays BNB gas (~$0.003-0.007).
                </p>
                <Button
                  onClick={sendPayment}
                  disabled={loading || !recipient || !amount}
                  data-testid="button-send-payment"
                >
                  {loading ? 'Processing...' : 'Send Payment (1 Signature)'}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Transaction Result */}
        {txHash && (
          <Card className="mb-6 border-green-500" data-testid="card-success">
            <CardHeader>
              <h3 className="text-lg font-bold">SUCCESS!</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">Transaction Hash:</p>
              <a
                href={`https://bscscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover-elevate font-mono text-sm break-all"
                data-testid="link-txhash"
              >
                {txHash}
              </a>
              <p className="text-muted-foreground mt-4">
                Your payment has been settled on BNB Chain!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Info Box */}
        <Card className="border-blue-500/30" data-testid="card-info">
          <CardHeader>
            <h3 className="text-lg font-bold">How SORA S402 Works</h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><strong>Simple Flow:</strong> Approve once (step 2) → All payments need just 1 signature</li>
              <li><strong>One Signature Per Payment:</strong> After approval, just sign payment authorization</li>
              <li><strong>USD1 Stablecoin:</strong> All payments use World Liberty Financial's USD1 token</li>
              <li><strong>Platform Fee:</strong> Small fee (~1%) collected by SORA S402 protocol</li>
              <li><strong>Replay Protection:</strong> Unique nonces prevent double-spending</li>
              <li><strong>Note:</strong> You need BNB in your wallet to pay for blockchain gas fees (~$0.003-0.007)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
