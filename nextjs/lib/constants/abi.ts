import mockERC20 from "../abi/MockERC20.json";
import poolSwapTest from "../abi/PoolSwapTest.json";

export interface Abis {
  poolSwapTest: any[];
  mockERC20: any[];
}

export const abis: Abis = {
  poolSwapTest: poolSwapTest,
  mockERC20: mockERC20,
};
