export interface ContractAddresses {
  poolSwapTest: `0x${string}`;
  currency0: `0x${string}`;
  currency1: `0x${string}`;
}

export interface Contracts {
  [chainId: number]: ContractAddresses;
}

export const contractsAddress: Contracts = {
  31337: {
    poolSwapTest: "0x",
    currency0: "0x",
    currency1: "0x",
  },
  11155111: {
    poolSwapTest: "0x",
    currency0: "0x",
    currency1: "0x",
  },
};
