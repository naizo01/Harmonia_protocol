// hooks/useSwapExecution.ts
import { useEffect, useState } from "react";
import { useLitContext } from "../context/LitContext";
import { Token } from "./useSwapState";
import { VerificationData } from "./useUserAttestation";
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers";
import { ethers } from "ethers";
import { concat, decodeEventLog, encodeFunctionData, encodePacked, encodeAbiParameters, formatEther, parseEther } from "viem";
import { useChainId, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { abis } from "~~/lib/constants/abi";
import { contractsAddress, urlAddress } from "~~/lib/constants/address";
import { litNodeClient } from "~~/utils/lit";

export type SwapResult = {
  currencyBuyAmount: string;
  currencySellAmount: string;
  zeroForOne: boolean;
  hash: string;
};

export function useSwapExecution(
  tokens: Token[],
  amounts: string[],
  address: string | undefined,
  verificationData: VerificationData,
) {
  const { currentAccount, sessionSigs, ethAddress, defaultChainId } = useLitContext();
  let chainId = useChainId();
  chainId = ethAddress ? defaultChainId : chainId;
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [swapResult, setSwapResult] = useState<SwapResult>({
    currencyBuyAmount: "",
    currencySellAmount: "",
    zeroForOne: true,
    hash: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [litTxHash, setLitTxHash] = useState<`0x${string}`>();
  const rpcAddress = urlAddress[chainId]?.rpcUrl;

  const writeFn = useWriteContract();

  const {
    data: waitReceipt,
    isSuccess,
    isError,
  } = useWaitForTransactionReceipt({
    hash: writeFn?.data ? writeFn?.data : litTxHash,
    chainId,
  });

  const encodeAttestationData = async (): Promise<string> => {
    const communityAttestId = verificationData.communityAttestId;
    const activeAttestId = verificationData.activeAttestId;
    console.log(communityAttestId);
    console.log(activeAttestId);

    const encodedData = encodeAbiParameters(
      [
        { name: 'x', type: 'uint64' },
        { name: 'y', type: 'uint64' },
        { name: 'z', type: 'address' }
      ],
      [communityAttestId, activeAttestId, ethAddress ? ethAddress : address]
    )

    console.log("attestationData: ", encodedData);

    return encodedData;
  };

  const executeSwap = async () => {
    if ((!address && !currentAccount) || !amounts[0]) return;
    try {
      setIsLoading(true);
      const isToken0First = tokens[0].address.toLowerCase() < tokens[1].address.toLowerCase();
      console.log(isToken0First ? tokens[0].address : tokens[1].address);
      console.log(isToken0First ? tokens[1].address : tokens[0].address);

      const poolKey = {
        currency0: isToken0First ? tokens[0].address : tokens[1].address,
        currency1: isToken0First ? tokens[1].address : tokens[0].address,
        fee: 8388608,
        tickSpacing: 60,
        hooks: contractsAddress[chainId]?.hooks,
      };

      const swapParams = {
        zeroForOne: isToken0First,
        amountSpecified: parseEther(amounts[0]),
        sqrtPriceLimitX96: isToken0First ? "4295128740" : "1461446703485210103287273052203988822378723970341",
      };

      const testSettings = {
        takeClaims: false,
        settleUsingBurn: false,
      };

      const attestationData = await encodeAttestationData();

      const swapConfig = {
        address: contractsAddress[chainId]?.poolSwapTest,
        abi: abis.poolSwapTest,
        functionName: "swap",
        args: [poolKey, swapParams, testSettings, attestationData],
        chainId,
      };

      // lit
      if (currentAccount && sessionSigs) {
        try {
          await litNodeClient.connect();

          const pkpWallet = new PKPEthersWallet({
            controllerSessionSigs: sessionSigs,
            pkpPubKey: currentAccount.publicKey,
            litNodeClient: litNodeClient,
            rpc: rpcAddress,
          });
          await pkpWallet.init();

          const provider = new ethers.JsonRpcProvider(rpcAddress);
          const feeData = await provider.getFeeData();

          const encodedData = encodeFunctionData(swapConfig);
          let txData = {
            to: swapConfig.address,
            data: encodedData,
            chainId: swapConfig.chainId,
            gasPrice: feeData.gasPrice,
            gasLimit: 300000,
          };

          const tx = await pkpWallet.sendTransaction(txData);
          setLitTxHash(tx.hash);
          const receipt = await tx.wait();
          console.log(receipt);
        } catch (err) {
          console.error(err);
        }
      } else {
        // other
        writeFn.writeContract(swapConfig);
      }

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
      const isToken0First = tokens[0].address.toLowerCase() < tokens[1].address.toLowerCase();
      // decodeEventLogの結果を処理する関数を定義
      const decodeAmount = (logIndex: number) => {
        const event: any = decodeEventLog({
          abi: abis.mockERC20,
          data: waitReceipt?.logs[logIndex].data,
          topics: waitReceipt?.logs[logIndex].topics,
        });
        console.log(event);
        console.log(event?.args?.amount);
        return event?.args?.amount;
      };

      const currencyBuyAmount = formatEther(decodeAmount(2) || BigInt(0));
      const currencySellAmount = formatEther(decodeAmount(3) || BigInt(0));

      setSwapResult({
        currencyBuyAmount,
        currencySellAmount,
        zeroForOne: isToken0First,
        hash: waitReceipt.transactionHash,
      });
      setIsModalOpen(true);
    }

    if (writeFn.isError || isError) {
      console.error("Transaction failed.");
      console.log(writeFn);
      setIsConfirming(false);
      setIsLoading(false);
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
