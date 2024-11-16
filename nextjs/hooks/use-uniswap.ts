import { parseEther } from "viem";
import { useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useState, useEffect } from "react";
import { WriteContractData } from "@wagmi/core/query";

type Token = {
  symbol: string;
  name: string;
  icon: string;
  balance: number;
  address: string;
};

export const useUniswapV4Swap = (token1: Token, token2: Token, amount1: string) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  const isToken0First = token1.address.toLowerCase() < token2.address.toLowerCase();

  const poolKey = {
    currency0: isToken0First ? token1.address : token2.address,
    currency1: isToken0First ? token2.address : token1.address,
    fee: 3000,
    tickSpacing: 60,
    hooks: "0x0000000000000000000000000000000000000000",
  };

  const swapParams = {
    zeroForOne: isToken0First,
    amountSpecified: amount1 ? parseEther(amount1) : BigInt(0),
    sqrtPriceLimitX96: BigInt("0xffffffffffffffffffffffffffffffff"),
  };

  const testSettings = {
    takeClaims: false,
    settleUsingBurn: false,
  };

  const swapConfig = {
    address: "0xe49d2815c231826cab58017e214bed19fe1c2dd4",
    abi: [
      "function swap(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key, tuple(bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96) params, tuple(bool takeClaims, bool settleUsingBurn) testSettings, bytes hookData) external payable returns (int256)",
    ],
    functionName: "swap",
    args: [poolKey, swapParams, testSettings, "0x"],
    chainId,
    value: token1.symbol === "ETH" ? parseEther(amount1) : undefined,
  };
  const executeSwap = async () => {
    if (!address || !amount1) return;

    try {
      const txHash = await writeContractAsync(swapConfig);
      console.log("Transaction Hash:", txHash);

      if (!txHash) {
        throw new Error("Failed to get transaction hash.");
      }

      return txHash;
    } catch (error) {
      console.error("Swap failed:", error);
      throw error;
    }
  };

  const {
    data: waitReceipt,
    isSuccess,
    isError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId,
  });

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

  return {
    executeSwap,
    isConfirming,
    receipt,
  };
};
