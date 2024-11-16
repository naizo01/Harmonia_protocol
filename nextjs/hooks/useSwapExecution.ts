// hooks/useSwapExecution.ts
import { useEffect, useState } from "react";
import { Token } from "./useSwapState";
import { parseEther, toHex } from "viem";
import { useChainId, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { abis } from "~~/lib/constants/abi";
import { contractsAddress } from "~~/lib/constants/address";

type SwapResult = {
  swappedAmount: string;
  hash: string;
};

export function useSwapExecution(tokens: Token[], amounts: string[], address: string | undefined) {
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [swapResult, setSwapResult] = useState<SwapResult>({
    swappedAmount: "",
    hash: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const writeFn = useWriteContract();

  const {
    data: waitReceipt,
    isSuccess,
    isError,
  } = useWaitForTransactionReceipt({
    hash: writeFn?.data,
    chainId,
  });

  console.log("isError", isError);
  console.log("isSuccess", isSuccess);

  console.log(writeFn);
  const executeSwap = async () => {
    if (!address || !amounts[0]) return;
    try {
      setIsLoading(true);

      const poolKey = {
        currency0: tokens[0].address,
        currency1: tokens[1].address,
        fee: 3000,
        tickSpacing: 60,
        hooks: "0x55B8Cbc337359Da1a257dc1AC2b40e03cc064aC0",
      };

      const swapParams = {
        zeroForOne: true,
        amountSpecified: parseEther(amounts[0]),
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
        args: [poolKey, swapParams, testSettings, toHex(0)],
        chainId,
      };

      writeFn.writeContract(swapConfig);
      setIsConfirming(true);
    } catch (error) {
      console.error("Swap failed:", error);
      setIsLoading(false);
      setIsConfirming(false);
      throw error;
    }
  };

  useEffect(() => {
    if (isSuccess) {
      console.log("Transaction confirmed:", waitReceipt);
      setIsConfirming(false);
      setIsLoading(false);

      setSwapResult({
        swappedAmount: amounts[0],
        hash: waitReceipt.transactionHash,
      });
      setIsModalOpen(true);
    }

    if (writeFn.isError || isError) {
      console.error("Transaction failed.");
      setIsConfirming(false);
      setIsLoading(false);
      alert(writeFn.error);
    }
  }, [writeFn.isError, writeFn.isSuccess, isSuccess, isError]);

  return {
    isLoading,
    setIsLoading,
    isConfirming,
    setIsConfirming,
    swapResult,
    isModalOpen,
    setIsModalOpen,
    executeSwap,
  };
}
