import { useEffect } from "react";
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers";
import { ethers } from "ethers";
import { encodeFunctionData, erc20Abi } from "viem";
import { useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useLitContext } from "~~/context/LitContext";
import { contractsAddress, urlAddress } from "~~/lib/constants/address";
import { litNodeClient } from "~~/utils/lit";

export type UseApproveReturn = {
  writeContract: () => void;
};

export function useApprove(): UseApproveReturn {
  const { chain, address: owner } = useAccount();
  const { currentAccount, sessionSigs } = useLitContext();
  let chainId = useChainId();
  const { ethAddress, defaultChainId } = useLitContext();
  chainId = ethAddress ? defaultChainId : chainId;

  const uintMax = BigInt(1157920892373161954235709850086879078532699846656405640394575840079131296);
  const spender = contractsAddress[chainId]?.poolSwapTest;
  const rpcAddress = urlAddress[chainId]?.rpcUrl;
  const approveArgs: [`0x${string}`, bigint] = [spender, uintMax];
  const isReady = owner && spender && chain;
  const writeFn = useWriteContract();

  const config1: any = {
    address: contractsAddress[chainId]?.currency0,
    abi: erc20Abi,
    functionName: "approve" as const,
    args: approveArgs,
  };
  const config2: any = {
    address: contractsAddress[chainId]?.currency1,
    abi: erc20Abi,
    functionName: "approve" as const,
    args: approveArgs,
  };
  const writeContract = async () => {
    console.log("writeContractApprove")
    if (currentAccount && sessionSigs) {
      try {
        await litNodeClient.connect();

        const provider = new ethers.JsonRpcProvider(rpcAddress);

        const pkpWallet = new PKPEthersWallet({
          controllerSessionSigs: sessionSigs,
          pkpPubKey: currentAccount.publicKey,
          litNodeClient: litNodeClient,
          rpc: rpcAddress,
        });

        await pkpWallet.init();

        let encodedData;
        let txData;
        let tx;
        let receipt;

        encodedData = encodeFunctionData(config1);

        txData = {
          to: config1.address,
          data: encodedData,
          chainId: chainId,
          gasPrice: 300,
          gasLimit: 10000000,
        };

        tx = await pkpWallet.sendTransaction(txData);
        receipt = await tx.wait();
        console.log(receipt);

        encodedData = encodeFunctionData(config2);

        txData = {
          to: config2.address,
          data: encodedData,
          chainId: chainId,
          gasPrice: 300,
          gasLimit: 10000000,
        };

        tx = await pkpWallet.sendTransaction(txData);
        receipt = await tx.wait();

        console.log(receipt);
      } catch (err) {
        console.error(err);
      }
    } else {
      writeFn.writeContract(config1);
      writeFn.writeContract(config2);
    }
  };

  const waitFn = useWaitForTransactionReceipt({
    chainId: chain?.id,
    hash: writeFn?.data,
  });
  useEffect(() => {
    if (waitFn.isSuccess) {
      console.log("Approve Transaction successful:", waitFn.data);
    }
  }, [waitFn]);

  return { writeContract };
}
