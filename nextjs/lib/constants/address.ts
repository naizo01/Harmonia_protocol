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
    poolSwapTest: "0x96E3495b712c6589f1D2c50635FDE68CF17AC83c",
    currency0: "0x0628F353Cb1a4E1Ba115684264A94dE6B9E8Cd23",
    currency1: "0x6643ACcf10C80899dB0ED2b8555D8145c3ec824b",
    hooks: "0xD70569bE986345754f5bdbB1322479e02B5F9080",
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
