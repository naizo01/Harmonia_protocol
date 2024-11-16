export interface ContractAddresses {
  poolSwapTest: `0x${string}`;
  currency0: `0x${string}`;
  currency1: `0x${string}`;
  hooks: `0x${string}`;
}

export interface Contracts {
  [chainId: number]: ContractAddresses;
}

export interface urlAddress {
  rpcUrl: string;
}

export interface Urls {
  [chainId: number]: urlAddress;
}

export const contractsAddress: Contracts = {
  84532: {
    poolSwapTest: "0x",
    currency0: "0x",
    currency1: "0x",
    hooks: "0x",
  },
  31337: {
    poolSwapTest: "0x",
    currency0: "0x",
    currency1: "0x",
    hooks: "0x",
  },
  11155111: {
    poolSwapTest: "0x",
    currency0: "0x",
    currency1: "0x",
    hooks: "0x",
  },
};

export const urlAddress: Urls = {
  84532: {
    rpcUrl: "https://sepolia.base.org",
  },
  31337: {
    rpcUrl: "http://localhost:8545",
  },
  11155111: {
    rpcUrl: "https://sepolia.ethereum.org",
  },
};
