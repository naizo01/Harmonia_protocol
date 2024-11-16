import { abis } from "../lib/constants/abi";
import { useAccount, useReadContract } from "wagmi";

export default function useBalanceOf(
  tokenAddress?: `0x${string}`,
): ReturnType<typeof useReadContract<readonly unknown[], "balanceOf", readonly unknown[]>> {
  const { address: accentAddress } = useAccount();
  const config = {
    address: tokenAddress as `0x${string}`,
    abi: abis.mockERC20,
  };
  const readFn = useReadContract<readonly unknown[], "balanceOf", readonly unknown[]>({
    ...config,
    functionName: "balanceOf",
    args: [accentAddress],
    query: {
      enabled: !!accentAddress,
    },
  });

  return readFn;
}
