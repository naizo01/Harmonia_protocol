// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {CurrencyLibrary, Currency} from "v4-core/src/types/Currency.sol";
import {LPFeeLibrary} from "v4-core/src/libraries/LPFeeLibrary.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";

import {Constants} from "./base/Constants.sol";

import "./base/DeployBase.sol";

contract CreatePoolOnly is DeployBase, Constants {
    using CurrencyLibrary for Currency;

    // NOTE: Be sure to set the addresses in Constants.sol and Config.sol

    /////////////////////////////////////
    // --- Parameters to Configure --- //
    /////////////////////////////////////
    MockERC20 token0;
    MockERC20 token1;
    Currency currency0;
    Currency currency1;

    // --- pool configuration --- //
    // fees paid by swappers that accrue to liquidity providers
    uint24 lpFee = LPFeeLibrary.DYNAMIC_FEE_FLAG; // 0.30%
    int24 tickSpacing = 60;

    // starting price of the pool, in sqrtPriceX96
    uint160 startingPrice = 250541448375047931186413801569; // floor(sqrt(1) * 2^96)

    // --- liquidity position configuration --- //
    uint256 public token0Amount = 100e18;
    uint256 public token1Amount = 100e18;

    // range of the position
    int24 tickLower = TickMath.minUsableTick(tickSpacing); // must be a multiple of tickSpacing
    int24 tickUpper = TickMath.maxUsableTick(tickSpacing);
    /////////////////////////////////////

    function run() external {
        vm.startBroadcast();
        deployTokens();
        vm.stopBroadcast();

        currency0 = Currency.wrap(address(token0));
        currency1 = Currency.wrap(address(token1));

        PoolKey memory pool = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: LPFeeLibrary.DYNAMIC_FEE_FLAG,
            tickSpacing: tickSpacing,
            hooks: IHooks(readDeployedAddress("DYNAMICFEE"))
        });

        writeDeployedBytes32(PoolId.unwrap(pool.toId()), "POOLID");

        bytes memory hookData = new bytes(0);

        vm.broadcast();
        IPoolManager(POOLMANAGER).initialize(pool, startingPrice);
    }

    function deployTokens() internal {
        MockERC20 tokenA = new MockERC20("MockA", "A", 18);
        MockERC20 tokenB = new MockERC20("MockB", "B", 18);
        if (uint160(address(tokenA)) < uint160(address(tokenB))) {
            token0 = tokenA;
            token1 = tokenB;
        } else {
            token0 = tokenB;
            token1 = tokenA;
        }
        writeDeployedAddress(address(token0), "TOKEN0");
        writeDeployedAddress(address(token1), "TOKEN1");
        token0.mint(msg.sender, 100_000 ether);
        token1.mint(msg.sender, 100_000 ether);
    }
}
