export interface Config {
  [chainId: number]: {
    scan: string;
  };
}

export const config: Config = {
  84532: {
    scan: "https://sepolia.basescan.org/",
  },
  31337: {
    scan: "https://localhost:8545/address/",
  },
  11155111: {
    scan: "https://testnet.example.com/address/",
  },
};

export const communityId = "1293876618045030400";
export const roleId = "1305420329601990718";
// 使用例
// const chainId = 84532;
// const scanUrl = config[chainId].scan;
