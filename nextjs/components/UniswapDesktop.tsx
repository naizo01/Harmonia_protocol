// components/UniswapDesktop.tsx
import { useEffect, useState } from "react";
import { useLitContext } from "../context/LitContext";
import { useVerificationContext } from "../context/VerificationContext";
import { useApprove } from "../hooks/useApprove";
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
import { Settings } from "lucide-react";
import { formatEther } from "viem";
import { useAccount, useChainId } from "wagmi";
import { contractsAddress } from "~~/lib/constants/address";

export function UniswapDesktop() {
  let chainId = useChainId();
  const { address } = useAccount();
  const [initialTokens, setInitialTokens] = useState<Token[]>([]);
  const { currentAccount, sessionSigs, ethAddress, defaultChainId } = useLitContext();
  const { verificationData } = useVerificationContext();
  chainId = ethAddress ? defaultChainId : chainId;
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
  const ethBalance = useBalanceOf(initialTokens[0]?.address as `0x${string}`);
  const usdtBalance = useBalanceOf(initialTokens[1]?.address as `0x${string}`);

  useEffect(() => {
    // バランスが取得できたらトークンのバランスを更新
    if (ethBalance.data) {
      setInitialTokens(prevTokens => [
        { ...prevTokens[0], balance: Number(formatEther(ethBalance.data as bigint)) },
        prevTokens[1],
      ]);
    }
    if (usdtBalance.data) {
      setInitialTokens(prevTokens => [
        prevTokens[0],
        { ...prevTokens[1], balance: Number(formatEther(usdtBalance.data as bigint)) },
      ]);
    }
  }, [ethBalance.data, usdtBalance.data]);

  const [volatility, setVolatility] = useState<"low" | "medium" | "high">("medium");

  const { userInfo } = useUserAttestation();
  const [isCommunityMember, setIsCommunityMember] = useState(false);
  const [isActiveUser, setIsActiveUser] = useState(false);

  useEffect(() => {
    setIsCommunityMember(verificationData.communityIsMember);
    setIsActiveUser(verificationData.activeIsActive);
    setVolatility("low");
  }, [verificationData]);

  const {
    isLoading,
    setIsLoading,
    isConfirming,
    setIsConfirming,
    swapResult,
    isModalOpen,
    setIsModalOpen,
    executeSwap,
  } = useSwapExecution(tokens, amounts, address, verificationData);

  const handleSwapClick = async () => {
    await executeSwap();
  };

  const handleApproveClick = async () => {
    await writeContractApprove();
  };

  const { writeContract: writeContractApprove } = useApprove();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-xl mx-auto p-4 pb-16">
        <div className="bg-background border rounded-3xl shadow-sm">
          <SwapForm
            tokensList={initialTokens}
            tokens={tokens}
            setToken={setToken}
            amounts={amounts}
            setAmount={setAmount}
            onSwapTokens={handleSwapTokens}
            onMaxClick={handleMax}
          />
          <FeeInfo isCommunityMember={isCommunityMember} isActiveUser={isActiveUser} volatility={volatility} />

          <div className="p-4 space-y-4">
            <Button
              className="w-full bg-pink-500 text-white hover:bg-pink-600"
              onClick={handleApproveClick}
              disabled={!address && !currentAccount}
            >
              Approve
            </Button>
            <Button
              className="w-full bg-pink-500 text-white hover:bg-pink-600"
              onClick={handleSwapClick}
              disabled={(!address && !currentAccount) || !amounts[0] || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Swap...
                </div>
              ) : (
                "Swap"
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
        isOpen={isLoading}
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
