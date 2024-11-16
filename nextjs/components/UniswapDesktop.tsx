// components/UniswapDesktop.tsx
import { useEffect, useState } from "react";
import { useBalanceOf } from "../hooks/useBalanceOf";
import { useSwapExecution } from "../hooks/useSwapExecution";
import { Token, useSwapState } from "../hooks/useSwapState";
import { useUserAttestation } from "../hooks/useUserAttestation";
import FeeInfo from "./FeeInfo";
import Header from "./Header";
import SwapCompletedDialog from "./SwapCompletedDialog";
import SwapForm from "./SwapForm";
import TransactionProcessingDialog from "./TransactionProcessingDialog";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { contractsAddress } from "~~/lib/constants/address";

export function UniswapDesktop() {
  const chainId = useChainId();
  const { address } = useAccount();
  const [initialTokens, setInitialTokens] = useState<Token[]>([]);

  useEffect(() => {
    if (chainId) {
      const tokensData = [
        { symbol: "ETH", name: "Ethereum", icon: "🔷", addressKey: "currency0" },
        { symbol: "USDT", name: "Tether", icon: "💵", addressKey: "currency1" },
      ];

      setInitialTokens(
        tokensData.map(token => ({
          symbol: token.symbol,
          name: token.name,
          icon: token.icon,
          balance: 0,
          address: contractsAddress[chainId]?.[token.addressKey as keyof (typeof contractsAddress)[typeof chainId]],
        })),
      );
    }
  }, [chainId]);
  const { tokens, amounts, setToken, setAmount, handleSwapTokens, handleMax } = useSwapState(initialTokens);
  const { userInfo } = useUserAttestation();

  const ethBalance = useBalanceOf(initialTokens[0]?.address as `0x${string}`);
  const usdtBalance = useBalanceOf(initialTokens[1]?.address as `0x${string}`);

  useEffect(() => {
    // バランスが取得できたらトークンのバランスを更新
    if (ethBalance.data) {
      setInitialTokens(prevTokens => [{ ...prevTokens[0], balance: Number(ethBalance.data) }, prevTokens[1]]);
    }
    if (usdtBalance.data) {
      setInitialTokens(prevTokens => [prevTokens[0], { ...prevTokens[1], balance: Number(usdtBalance.data) }]);
    }
  }, [ethBalance.data, usdtBalance.data]);

  const {
    isLoading,
    setIsLoading,
    isConfirming,
    setIsConfirming,
    swapResult,
    isModalOpen,
    setIsModalOpen,
    executeSwap,
  } = useSwapExecution(tokens, amounts, address);

  const handleSwapClick = async () => {
    await executeSwap();
  };

  const [isCommunityMember, setIsCommunityMember] = useState(false);
  const [isActiveUser, setIsActiveUser] = useState(false);
  const [volatility, setVolatility] = useState<"low" | "medium" | "high">("medium");
  console.log(tokens);

  useEffect(() => {
    // ここで実際のデータを取得して状態を更新します
    setIsCommunityMember(Math.random() < 0.5);
    setIsActiveUser(Math.random() < 0.5);
    setVolatility(Math.random() < 0.33 ? "low" : Math.random() < 0.66 ? "medium" : "high");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-xl mx-auto p-8 pb-16">
        <div className="bg-background border rounded-3xl shadow-sm">
          {/* SwapForm コンポーネントを使用 */}
          <SwapForm
            tokensList={initialTokens}
            tokens={tokens}
            setToken={setToken}
            amounts={amounts}
            setAmount={setAmount}
            onSwapTokens={handleSwapTokens}
            onMaxClick={handleMax}
          />

          {/* スワップ手数料情報などの残りの部分 */}
          <div className="p-4 space-y-4">
            <FeeInfo isCommunityMember={isCommunityMember} isActiveUser={isActiveUser} volatility={volatility} />

            <Button
              className="w-full bg-pink-500 text-white hover:bg-pink-600"
              onClick={handleSwapClick}
              disabled={!address || !amounts[0] || isLoading}
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
          </div>

          <div className="p-4 text-center text-sm text-muted-foreground border-t">
            Uniswap available in:{" "}
            <Button variant="link" className="text-pink-500 p-0 h-auto">
              English
            </Button>
          </div>
        </div>
      </main>

      <TransactionProcessingDialog
        isOpen={isLoading || isConfirming}
        isConfirming={isConfirming}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setIsLoading(false);
            setIsConfirming(false);
          }
        }}
      />
      <SwapCompletedDialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} swapResult={swapResult} />
    </div>
  );
}

export default UniswapDesktop;
