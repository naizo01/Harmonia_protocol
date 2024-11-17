// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolSwapTest} from "v4-core/src/test/PoolSwapTest.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {CurrencyLibrary, Currency} from "v4-core/src/types/Currency.sol";
import {LPFeeLibrary} from "v4-core/src/libraries/LPFeeLibrary.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";

import {Constants} from "./base/Constants.sol";
import {Config} from "./base/Config.sol";

import "./base/DeployBase.sol";

contract SwapScript is DeployBase, Constants {
    // slippage tolerance to allow for unlimited price impact
    uint160 public constant MIN_PRICE_LIMIT = TickMath.MIN_SQRT_PRICE + 1;
    uint160 public constant MAX_PRICE_LIMIT = TickMath.MAX_SQRT_PRICE - 1;

    /////////////////////////////////////
    // --- Parameters to Configure --- //
    /////////////////////////////////////
    MockERC20 token0;
    MockERC20 token1;
    Currency currency0;
    Currency currency1;

    // PoolSwapTest Contract address, default to the anvil address
    PoolSwapTest swapRouter =
        PoolSwapTest(0x1dDb64EE653069b86493E3214a7e7EFbC950bb73);

    // --- pool configuration --- //
    // fees paid by swappers that accrue to liquidity providers
    uint24 lpFee = 3000; // 0.30%
    int24 tickSpacing = 60;

    function run() external {
        token0 = MockERC20(readDeployedAddress("TOKEN0"));
        token1 = MockERC20(readDeployedAddress("TOKEN1"));
        currency0 = Currency.wrap(address(token0));
        currency1 = Currency.wrap(address(token1));
        PoolKey memory pool = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: LPFeeLibrary.DYNAMIC_FEE_FLAG,
            tickSpacing: tickSpacing,
            hooks: IHooks(readDeployedAddress("DYNAMICFEE"))
        });

        // approve tokens to the swap router
        vm.broadcast();
        token0.approve(address(swapRouter), type(uint256).max);
        vm.broadcast();
        token1.approve(address(swapRouter), type(uint256).max);

        // ------------------------------ //
        // Swap 100e18 token0 into token1 //
        // ------------------------------ //
        bool zeroForOne = true;
        IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
            zeroForOne: zeroForOne,
            amountSpecified: 1e15,
            sqrtPriceLimitX96: zeroForOne ? MIN_PRICE_LIMIT : MAX_PRICE_LIMIT // unlimited impact
        });

        // in v4, users have the option to receieve native ERC20s or wrapped ERC1155 tokens
        // here, we'll take the ERC20s
        PoolSwapTest.TestSettings memory testSettings = PoolSwapTest
            .TestSettings({takeClaims: false, settleUsingBurn: false});

        bytes memory hookData = abi.encode(uint64(0), uint64(0), address(0));
        vm.broadcast();
        swapRouter.swap(pool, params, testSettings, hookData);
    }
}
