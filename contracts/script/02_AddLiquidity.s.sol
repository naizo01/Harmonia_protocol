// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {CurrencyLibrary, Currency} from "v4-core/src/types/Currency.sol";
import {IPositionManager} from "v4-periphery/src/interfaces/IPositionManager.sol";
import {LiquidityAmounts} from "v4-core/test/utils/LiquidityAmounts.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {LPFeeLibrary} from "v4-core/src/libraries/LPFeeLibrary.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";

import {EasyPosm} from "../test/utils/EasyPosm.sol";
import {Constants} from "./base/Constants.sol";
import {Config} from "./base/Config.sol";

import "./base/DeployBase.sol";

contract AddLiquidityScript is DeployBase, Constants {
    using CurrencyLibrary for Currency;
    using EasyPosm for IPositionManager;
    using StateLibrary for IPoolManager;

    /////////////////////////////////////
    // --- Parameters to Configure --- //
    /////////////////////////////////////
    MockERC20 token0;
    MockERC20 token1;
    Currency currency0;
    Currency currency1;

    // --- pool configuration --- //
    // fees paid by swappers that accrue to liquidity providers
    uint24 lpFee = 3000; // 0.30%
    int24 tickSpacing = 60;

    // --- liquidity position configuration --- //
    uint256 public token0Amount = 10e18;
    uint256 public token1Amount = 10e18;

    // range of the position
    // int24 tickLower = -600; // must be a multiple of tickSpacing
    // int24 tickUpper = 600;
    int24 tickLower;
    int24 tickUpper;
    /////////////////////////////////////

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

        (uint160 sqrtPriceX96, , , ) = POOLMANAGER.getSlot0(pool.toId());

        tickLower = TickMath.minUsableTick(pool.tickSpacing);
        tickUpper = TickMath.maxUsableTick(pool.tickSpacing);

        // Converts token amounts to liquidity units
        uint128 liquidity = LiquidityAmounts.getLiquidityForAmounts(
            sqrtPriceX96,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            token0Amount,
            token1Amount
        );

        // slippage limits
        uint256 amount0Max = token0Amount + 1 wei;
        uint256 amount1Max = token1Amount + 1 wei;

        bytes memory hookData = new bytes(0);

        vm.startBroadcast();
        tokenApprovals();
        vm.stopBroadcast();

        vm.startBroadcast();
        IPositionManager(address(posm)).mint(
            pool,
            tickLower,
            tickUpper,
            liquidity,
            amount0Max,
            amount1Max,
            msg.sender,
            block.timestamp + 60,
            hookData
        );
        vm.stopBroadcast();
    }

    function tokenApprovals() public {
        if (!currency0.isAddressZero()) {
            token0.approve(address(PERMIT2), type(uint256).max);
            PERMIT2.approve(
                address(token0),
                address(posm),
                type(uint160).max,
                type(uint48).max
            );
        }
        if (!currency1.isAddressZero()) {
            token1.approve(address(PERMIT2), type(uint256).max);
            PERMIT2.approve(
                address(token1),
                address(posm),
                type(uint160).max,
                type(uint48).max
            );
        }
    }
}
