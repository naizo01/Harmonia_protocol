import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowUpDown, Check, ChevronDown, Info, Loader2, Search, Settings } from "lucide-react";
import { parseEther } from "viem";
import { useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
// import {useUniswapV4Swap} from "~~/hooks/use-uniswap";
import { contractsAddress } from "~~/lib/constants/address";
import { abis } from "~~/lib/constants/abi";
import { simulateContract } from "viem/actions/public/simulateContract";

type Token = {
  symbol: string;
  name: string;
  icon: string;
  balance: number;
  address: string;
};
export function UniswapDesktop(callbacks?: { onSuccessWrite?: (data: any) => void; onError?: (error: any) => void }) {
  const chainId = useChainId();
  const tokens: Token[] = [
    { symbol: "ETH", name: "Ethereum", icon: "🔷", balance: 0.19, address: contractsAddress[chainId]?.currency0 },
    { symbol: "USDT", name: "Tether", icon: "💵", balance: 1000, address: contractsAddress[chainId]?.currency1 },
  ];
  const token1 = tokens[0];
  const token2 = tokens[1];
  const [amount1, setAmount1] = useState("");
  const [amount2, setAmount2] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [swapResult, setSwapResult] = useState({
    swappedAmount: "",
    fee: "",
    hash: "",
  });
  const [isCommunityMember, setIsCommunityMember] = useState(false);
  const [isActiveUser, setIsActiveUser] = useState(false);
  const [volatility, setVolatility] = useState<"low" | "medium" | "high">("medium");
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const writeFn = useWriteContract();
  const {
    data: waitReceipt,
    isSuccess,
    isError,
  } = useWaitForTransactionReceipt({
    hash: writeFn?.data,
    chainId,
  });

  const isToken0First = tokens[0].address.toLowerCase() < token2.address.toLowerCase();
  const poolKey = {
    currency0: isToken0First ? token1.address : token2.address,
    currency1: isToken0First ? token2.address : token1.address,
    fee: 3000,
    tickSpacing: 60,
    hooks: "0x55B8Cbc337359Da1a257dc1AC2b40e03cc064aC0",
  };
  const swapParams = {
    zeroForOne: isToken0First,
    amountSpecified: BigInt(1000000000000000000),
    sqrtPriceLimitX96: BigInt(4295128740),
  };
  const testSettings = {
    takeClaims: false,
    settleUsingBurn: false,
  };
  const swapConfig = {
    address: contractsAddress[chainId]?.poolSwapTest,
    abi: abis.poolSwapTest,
    functionName: "swap",
    args: [poolKey, swapParams, testSettings, "0x"],
    chainId,
  };

  console.log(swapConfig);
  console.log(waitReceipt);
  useEffect(() => {
    if (isSuccess) {
      console.log("Transaction confirmed:", waitReceipt);
      setReceipt(waitReceipt);
      setIsConfirming(false);
    }

    if (isError) {
      console.error("Transaction failed.");
      setIsConfirming(false);
    }
  }, [isSuccess, isError, waitReceipt]);

  // const simulateSwap = async () => {
  //     try {
  //         console.log("Simulating swap...");
  //         const simulationResult = await simulateContract(swapConfig);
  //
  //         if (simulationResult) {
  //             console.log("Simulation successful:", simulationResult);
  //             return simulationResult;
  //         } else {
  //             throw new Error("Simulation failed with no result.");
  //         }
  //     } catch (error) {
  //         console.error("Simulation error:", error);
  //         throw error;
  //     }
  // };
  const executeSwap = async () => {
    if (!address || !amount1) return;
    try {
      writeFn.writeContract(swapConfig);
      console.log(waitReceipt);
    } catch (error) {
      console.error("Swap failed:", error);
      throw error;
    }
  };

  const handleSwapClick = async () => {
    try {
      setIsLoading(true);
      console.log("Executing swap...");
      await executeSwap();
    } catch (error) {
      console.error("Swap failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isConfirming && isLoading) {
      setIsLoading(false);
    }
  }, [isConfirming]);

  const calculateFee = () => {
    let baseFee = 0.3; // 0.3%
    if (isCommunityMember) baseFee -= 0.05;
    if (isActiveUser) baseFee -= 0.05;
    if (volatility === "high") baseFee += 0.1;
    if (volatility === "low") baseFee -= 0.05;
    return baseFee;
  };

  const fee = calculateFee();

  useEffect(() => {
    // Here we would fetch actual data and update the state
    setIsCommunityMember(Math.random() < 0.5);
    setIsActiveUser(Math.random() < 0.5);
    setVolatility(Math.random() < 0.33 ? "low" : Math.random() < 0.66 ? "medium" : "high");
  }, []);

  const handleSwap = () => {
    // setToken1(token2);
    // setToken2(token1);
    setAmount1(amount2);
    setAmount2(amount1);
  };

  const handleMax = () => {
    setAmount1(token1.balance.toString());
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="text-pink-500 text-2xl font-bold">◊</div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
          <nav className="flex items-center gap-8">
            <Button variant="ghost" className="font-semibold">
              Trade
            </Button>
            <Button variant="ghost" className="text-muted-foreground">
              Explore
            </Button>
            <Button variant="ghost" className="text-muted-foreground">
              Pool
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ConnectButton />
        </div>
      </header>

      <main className="container max-w-xl mx-auto p-8 pb-16">
        <div className="bg-background border rounded-3xl shadow-sm">
          <div className="p-4 flex justify-between items-center border-b">
            <div className="font-semibold">Swap</div>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Sell</div>
              <div className="flex items-center gap-2 p-4 rounded-xl bg-muted/50">
                <Input
                  type="number"
                  placeholder="0"
                  value={amount1}
                  onChange={e => setAmount1(e.target.value)}
                  className="border-0 bg-transparent text-4xl"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        {token1.icon}
                      </div>
                      {token1.symbol}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {tokens.map(token => (
                      <DropdownMenuItem key={token.symbol} onSelect={() => token1}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            {token.icon}
                          </div>
                          <span>{token.name}</span>
                          <span className="text-muted-foreground">({token.symbol})</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="px-4 flex justify-between text-sm text-muted-foreground">
                <div>$0</div>
                <div className="flex items-center gap-1">
                  <span>
                    {token1.balance.toFixed(3)} {token1.symbol}
                  </span>
                  <Button variant="link" className="text-pink-500 p-0 h-auto text-sm" onClick={handleMax}>
                    Max
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-center -my-2">
              <Button variant="ghost" size="icon" className="rounded-full bg-muted z-10" onClick={handleSwap}>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Buy</div>
              <div className="flex items-center gap-2 p-4 rounded-xl bg-muted/50">
                <Input
                  type="number"
                  placeholder="0"
                  value={amount2}
                  onChange={e => setAmount2(e.target.value)}
                  className="border-0 bg-transparent text-4xl"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        {token2.icon}
                      </div>
                      {token2.symbol}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {tokens.map(token => (
                      <DropdownMenuItem key={token.symbol} onSelect={() => token2}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            {token.icon}
                          </div>
                          <span>{token.name}</span>
                          <span className="text-muted-foreground">({token.symbol})</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-muted/50">
              <div className="text-sm font-medium mb-2">Swap Fee Information</div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Estimated Fee Rate:</span>
                <span className="font-bold">{fee.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Community Member:</span>
                <span className={isCommunityMember ? "text-green-500" : "text-red-500"}>
                  {isCommunityMember ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active User:</span>
                <span className={isActiveUser ? "text-green-500" : "text-red-500"}>{isActiveUser ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Volatility:</span>
                <span
                  className={
                    volatility === "low"
                      ? "text-green-500"
                      : volatility === "medium"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }
                >
                  {volatility === "low" ? "Low" : volatility === "medium" ? "Medium" : "High"}
                </span>
              </div>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="w-full bg-pink-500 text-white hover:bg-pink-600"
                    onClick={handleSwapClick} // ここを変更
                    disabled={!address || !amount1 || isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        スワップ処理中...
                      </div>
                    ) : (
                      "スワップ"
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Estimated fee: {((parseFloat(amount1 || "0") * fee) / 100).toFixed(6)} {token1.symbol}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="p-4 text-center text-sm text-muted-foreground border-t">
            Uniswap available in:{" "}
            <Button variant="link" className="text-pink-500 p-0 h-auto">
              English
            </Button>
          </div>
        </div>
      </main>

      <Dialog open={isLoading || isConfirming} onOpenChange={setIsLoading}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            <DialogTitle>Processing Transaction</DialogTitle>
            <DialogDescription>
              {isConfirming ? "Waiting for confirmation..." : "Initiating transaction..."}
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Swap Completed</DialogTitle>
            <DialogDescription>The transaction has been processed successfully.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Check className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold">Swapped Amount</p>
                <p className="text-sm text-muted-foreground">{swapResult.swappedAmount}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Check className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold">Fee</p>
                <p className="text-sm text-muted-foreground">{swapResult.fee}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Check className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold">Transaction Hash</p>
                <p className="text-sm text-muted-foreground">{swapResult.hash}</p>
              </div>
            </div>
          </div>
          <Button onClick={() => setIsModalOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
