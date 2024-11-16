// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {CurrencyLibrary, Currency} from "v4-core/src/types/Currency.sol";
import {PoolSwapTest} from "v4-core/src/test/PoolSwapTest.sol";
import {DynamicFee} from "../src/DynamicFee.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {LPFeeLibrary} from "v4-core/src/libraries/LPFeeLibrary.sol";

import {LiquidityAmounts} from "v4-core/test/utils/LiquidityAmounts.sol";
import {IPositionManager} from "v4-periphery/src/interfaces/IPositionManager.sol";
import {EasyPosm} from "./utils/EasyPosm.sol";
import {Fixtures} from "./utils/Fixtures.sol";

import {WhitelistHook} from "../src/WhitelistHook.sol";
import {SP} from "sign-protocol/core/SP.sol";
import {ISP} from "sign-protocol/interfaces/ISP.sol";
import {Schema} from "sign-protocol/models/Schema.sol";
import {DataLocation} from "sign-protocol/models/DataLocation.sol";
import {Attestation} from "sign-protocol/models/Attestation.sol";

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import {MockPyth} from "@pythnetwork/pyth-sdk-solidity/MockPyth.sol";

contract DynamicFeeTest is Test, Fixtures {
    using EasyPosm for IPositionManager;
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;
    using StateLibrary for IPoolManager;

    DynamicFee hook;
    PoolId poolId;

    uint256 tokenId;
    int24 tickLower;
    int24 tickUpper;

    ISP public sp;
    WhitelistHook public whitelistHook;

    MockPyth public pyth;
    bytes32 ETH_PRICE_FEED_ID = bytes32(uint256(0x1));
    int64 ETH_PRICE = 1;
    address user1 = address(0x01);

    function setUp() public {
        // create pyth mock
        pyth = new MockPyth(60, 1);
        pythEthUpdate(ETH_PRICE);

        // creates the pool manager, utility routers, and test tokens
        deployFreshManagerAndRouters();
        deployMintAndApprove2Currencies();

        deployAndApprovePosm(manager);

        sp = new SP();
        SP(address(sp)).initialize(1, 1);
        whitelistHook = new WhitelistHook();
        whitelistHook.addToWhitelist(address(this));

        // Deploy the hook to an address with the correct flags
        address flags = address(
            uint160(Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_INITIALIZE_FLAG) // Namespace the hook to avoid collisions
        );
        bytes memory constructorArgs = abi.encode(
            manager,
            address(sp),
            address(pyth),
            ETH_PRICE_FEED_ID,
            false
        ); //Add all the necessary constructor arguments from the hook
        deployCodeTo("DynamicFee.sol:DynamicFee", constructorArgs, flags);
        hook = DynamicFee(flags);

        // Create the pool
        key = PoolKey(
            currency0,
            currency1,
            LPFeeLibrary.DYNAMIC_FEE_FLAG,
            60,
            IHooks(hook)
        );
        poolId = key.toId();
        manager.initialize(key, SQRT_PRICE_1_1);

        // Provide full-range liquidity to the pool
        tickLower = TickMath.minUsableTick(key.tickSpacing);
        tickUpper = TickMath.maxUsableTick(key.tickSpacing);

        uint128 liquidityAmount = 100e18;

        (uint256 amount0Expected, uint256 amount1Expected) = LiquidityAmounts
            .getAmountsForLiquidity(
                SQRT_PRICE_1_1,
                TickMath.getSqrtPriceAtTick(tickLower),
                TickMath.getSqrtPriceAtTick(tickUpper),
                liquidityAmount
            );

        (tokenId, ) = posm.mint(
            key,
            tickLower,
            tickUpper,
            liquidityAmount,
            amount0Expected + 1,
            amount1Expected + 1,
            address(this),
            block.timestamp,
            ZERO_BYTES
        );
    }

    function testPythPrice() public view {
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(
            ETH_PRICE_FEED_ID,
            60
        );
        assertEq(
            uint(uint64(price.price)) / (10 ** uint8(uint32(-1 * price.expo))),
            uint(uint64(ETH_PRICE))
        );
    }

    function testPoolPrice() public view {
        assertEq(hook.getPairPrice(key), uint64(ETH_PRICE) * 1e8);
    }

    // Sell when the oracle price is higher.
    function testDeviationFee() public {
        skip(10);
        pythEthUpdate(2);

        bool zeroForOne = true;
        int256 amountSpecified = -1e18;
        BalanceDelta swapDelta = swap(
            key,
            zeroForOne,
            amountSpecified,
            ZERO_BYTES
        );
        console.logInt(swapDelta.amount0());
        console.logInt(swapDelta.amount1());
    }

    function testAccountFee() public {
        // スワップを実行
        bool zeroForOne = true;
        int256 amountSpecified = -1e18;
        BalanceDelta swapDelta = swap(
            key,
            zeroForOne,
            amountSpecified,
            ZERO_BYTES
        );

        console.logInt(swapDelta.amount0());
        console.logInt(swapDelta.amount1());
    }

    function testSingleAttestation() public {
        // 1つのアテステーションのみを登録
        (uint64 attestationId1, ) = registerAndAttestSchemas();

        // スワップを実行
        bool zeroForOne = true;
        int256 amountSpecified = -1e18;
        BalanceDelta swapDelta = swap(
            key,
            zeroForOne,
            amountSpecified,
            abi.encode(attestationId1, uint64(0), user1) // 2つ目のIDは0
        );

        console.logInt(swapDelta.amount0());
        console.logInt(swapDelta.amount1());
    }

    function testDoubleAttestation() public {
        // 2つのアテステーションを登録
        (
            uint64 attestationId1,
            uint64 attestationId2
        ) = registerAndAttestSchemas();

        // スワップを実行
        bool zeroForOne = true;
        int256 amountSpecified = -1e18;
        BalanceDelta swapDelta = swap(
            key,
            zeroForOne,
            amountSpecified,
            abi.encode(attestationId1, attestationId2, user1)
        );

        console.logInt(swapDelta.amount0());
        console.logInt(swapDelta.amount1());
    }

    function registerAndAttestSchemas() internal returns (uint64, uint64) {
        Schema memory schema0 = Schema({
            registrant: address(this),
            revocable: true,
            dataLocation: DataLocation.ONCHAIN,
            maxValidFor: 0,
            hook: whitelistHook,
            timestamp: 0,
            data: '{"name":"DiscordParticipationProof","data":[{"name":"discordId","type":"string"},{"name":"communityId","type":"string"},{"name":"address","type":"address"},{"name":"timestamp","type":"uint64"}]}'
        });
        Schema memory schema1 = Schema({
            registrant: address(this),
            revocable: false,
            dataLocation: DataLocation.ONCHAIN,
            maxValidFor: 0,
            hook: whitelistHook,
            timestamp: 0,
            data: '{"name":"DiscordActiveUserProof","data":[{"name":"discordId","type":"string"},{"name":"communityId","type":"string"},{"name":"roleId","type":"string"},{"name":"address","type":"address"},{"name":"timestamp","type":"uint64"}]}'
        });

        uint64 schemaId0 = sp.register(schema0, "");
        uint64 schemaId1 = sp.register(schema1, "");

        bytes memory data1 = encodeDataParticipation(
            "testDiscordId1",
            "testCommunityId",
            user1,
            uint64(123)
        );

        bytes memory data2 = encodeDataActiveUser(
            "testDiscordId2",
            "testCommunityId",
            "testRoleId",
            user1,
            uint64(123)
        );

        // Creating Attestations
        Attestation[] memory attestations = new Attestation[](2);
        attestations[0] = Attestation({
            schemaId: schemaId0,
            linkedAttestationId: 0,
            attestTimestamp: 0,
            revokeTimestamp: 0,
            data: data1,
            attester: address(this),
            validUntil: uint64(block.timestamp),
            dataLocation: DataLocation.ONCHAIN,
            revoked: false,
            recipients: new bytes[](0)
        });
        attestations[1] = Attestation({
            schemaId: schemaId1,
            linkedAttestationId: 0,
            attestTimestamp: 0,
            revokeTimestamp: 0,
            data: data2,
            attester: address(this),
            validUntil: uint64(block.timestamp),
            dataLocation: DataLocation.ONCHAIN,
            revoked: false,
            recipients: new bytes[](0)
        });

        string[] memory indexingKeys = new string[](2);
        indexingKeys[0] = "test indexing key 0";
        indexingKeys[1] = "test indexing key 1";

        // Attesting
        uint64 attestationId1 = sp.attest(
            attestations[0],
            indexingKeys[0],
            "",
            ""
        );
        uint64 attestationId2 = sp.attest(
            attestations[1],
            indexingKeys[1],
            "",
            ""
        );

        return (attestationId1, attestationId2);
    }

    function encodeDataParticipation(
        string memory discordId,
        string memory communityId,
        address addr,
        uint64 timestamp
    ) public pure returns (bytes memory) {
        return abi.encode(discordId, communityId, addr, timestamp);
    }

    function encodeDataActiveUser(
        string memory discordId,
        string memory communityId,
        string memory roleId,
        address addr,
        uint64 timestamp
    ) public pure returns (bytes memory) {
        return abi.encode(discordId, communityId, roleId, addr, timestamp);
    }

    function pythEthUpdate(int64 ethPrice) private returns (bytes[] memory) {
        bytes[] memory updateData = new bytes[](1);
        updateData[0] = pyth.createPriceFeedUpdateData(
            ETH_PRICE_FEED_ID,
            ethPrice * 100000, // price
            10 * 100000, // confidence
            -5, // exponent
            ethPrice * 100000, // emaPrice
            10 * 100000, // emaConfidence
            uint64(block.timestamp), // publishTime
            uint64(block.timestamp) // prevPublishTime
        );

        uint value = pyth.getUpdateFee(updateData);
        vm.deal(address(this), value);
        pyth.updatePriceFeeds{value: value}(updateData);

        return updateData;
    }
}
