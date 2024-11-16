import { useLitContext } from "../context/LitContext";
import { abis } from "../lib/constants/abi";
import { useAccount, useReadContract } from "wagmi";

export function useBalanceOf(
  tokenAddress?: `0x${string}`,
): ReturnType<typeof useReadContract<readonly unknown[], "balanceOf", readonly unknown[]>> {
  const { address: accentAddress } = useAccount();
  const { currentAccount } = useLitContext();
  const config = {
    address: tokenAddress as `0x${string}`,
    abi: abis.mockERC20,
  };
  const readFn = useReadContract<readonly unknown[], "balanceOf", readonly unknown[]>({
    ...config,
    functionName: "balanceOf",
    args: [accentAddress || currentAccount?.ethAddress || ""],
    query: {
      enabled: !!(accentAddress || currentAccount?.ethAddress),
    },
  });
  return readFn;
}
