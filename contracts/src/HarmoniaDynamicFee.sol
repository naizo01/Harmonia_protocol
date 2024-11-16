// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "v4-periphery/src/base/hooks/BaseHook.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/src/types/BeforeSwapDelta.sol";
import {LPFeeLibrary} from "v4-core/src/libraries/LPFeeLibrary.sol";
import {Attestation} from "sign-protocol/models/Attestation.sol";
import {SP} from "sign-protocol/core/SP.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";

contract HarmoniaDynamicFee is BaseHook {
    using StateLibrary for IPoolManager;

    // Special fee for registered accounts
    uint128 public constant ACTIVE_USER_FEE = 100; // 0.01%
    uint128 public constant PRTICIPATION_FEE = 5000; // 0.5%
    uint128 public constant DEVIATION_FEE = 10000; // 1%
    uint128 public constant DEFAULT_FEE = 50000; // 5%
    int32 public constant uniExpo = 8;
    address public admin;
    SP public sp;

    IPyth pyth;
    bytes32 pythPriceId;

    bool isFlipped;

    // Mapping to store special accounts
    event FeeApplied(address indexed sender, uint256 overrideFee);

    constructor(
        IPoolManager _poolManager,
        address _spAddress,
        address _pyth,
        bytes32 _pythPriceId,
        bool _isFlipped
    ) BaseHook(_poolManager) {
        admin = msg.sender;
        sp = SP(_spAddress);
        pyth = IPyth(_pyth);
        pythPriceId = _pythPriceId;
        isFlipped = _isFlipped;
    }

    function changeAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        admin = newAdmin;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function beforeSwap(
        address sender,
        PoolKey calldata poolkey,
        IPoolManager.SwapParams calldata swapParams,
        bytes memory attestationData
    ) external override returns (bytes4, BeforeSwapDelta, uint24) {
        uint256 _currentFee = DEFAULT_FEE;
        // attestation block
        if (attestationData.length != 0) {
            (uint64 prticipationId, uint64 activeUserId, address addr) = abi
                .decode(attestationData, (uint64, uint64, address));

            if (prticipationId != 0) {
                Attestation memory prticipationAttest = sp.getAttestation(
                    prticipationId
                );
                (, , address prticipationAddr, ) = decodeDataParticipation(
                    prticipationAttest.data
                );
                if (prticipationAddr == addr) {
                    _currentFee = PRTICIPATION_FEE;
                }
            }

            if (activeUserId != 0) {
                Attestation memory activeUserAttest = sp.getAttestation(
                    activeUserId
                );
                (, , , address activeUserAddr, ) = decodeDataActiveUser(
                    activeUserAttest.data
                );
                if (activeUserAddr == addr) {
                    _currentFee = ACTIVE_USER_FEE;
                }
            }
        }

        // oracle deviation block
        PythStructs.Price memory pythPrice = pyth.getPriceUnsafe(
            pythPriceId
        );
        uint256 uniPrice = getPairPrice(poolkey);

        if (
            uint(uint64(pythPrice.price)) *
                10 ** uint32(uniExpo + pythPrice.expo) >
            uniPrice &&
            swapParams.zeroForOne
        ) {
            _currentFee = DEFAULT_FEE + DEVIATION_FEE;
        }

        if (
            uint(uint64(pythPrice.price)) *
                10 ** uint32(uniExpo + pythPrice.expo) <
            uniPrice &&
            !swapParams.zeroForOne
        ) {
            _currentFee = DEFAULT_FEE + DEVIATION_FEE;
        }

        uint256 overrideFee = _currentFee |
            uint256(LPFeeLibrary.OVERRIDE_FEE_FLAG);
        emit FeeApplied(sender, overrideFee);

        return (
            BaseHook.beforeSwap.selector,
            BeforeSwapDeltaLibrary.ZERO_DELTA,
            uint24(overrideFee)
        );
    }

    function afterInitialize(
        address,
        PoolKey calldata key,
        uint160,
        int24
    ) external override returns (bytes4) {
        poolManager.updateDynamicLPFee(key, uint24(DEFAULT_FEE));
        return BaseHook.afterInitialize.selector;
    }

    function getHookPermissions()
        public
        pure
        override
        returns (Hooks.Permissions memory)
    {
        return
            Hooks.Permissions({
                beforeInitialize: false,
                afterInitialize: true,
                beforeAddLiquidity: false,
                afterAddLiquidity: false,
                beforeRemoveLiquidity: false,
                afterRemoveLiquidity: false,
                beforeSwap: true,
                afterSwap: false,
                beforeDonate: false,
                afterDonate: false,
                beforeSwapReturnDelta: false,
                afterSwapReturnDelta: false,
                afterAddLiquidityReturnDelta: false,
                afterRemoveLiquidityReturnDelta: false
            });
    }

    // DiscordParticipationProof
    function decodeDataParticipation(
        bytes memory data
    ) public pure returns (string memory, string memory, address, uint64) {
        (
            string memory discordId,
            string memory communityId,
            address addr,
            uint64 timestamp
        ) = abi.decode(data, (string, string, address, uint64));
        return (discordId, communityId, addr, timestamp);
    }

    // DiscordActiveUserProof
    function decodeDataActiveUser(
        bytes memory data
    )
        public
        pure
        returns (string memory, string memory, string memory, address, uint64)
    {
        (
            string memory discordId,
            string memory communityId,
            string memory roleId,
            address addr,
            uint64 timestamp
        ) = abi.decode(data, (string, string, string, address, uint64));
        return (discordId, communityId, roleId, addr, timestamp);
    }

    function getPairPrice(PoolKey calldata key) public view returns (uint256) {
        (uint160 sqrtPriceX96, , , ) = poolManager.getSlot0(key.toId());
        uint256 price = ((uint256(sqrtPriceX96) ** 2) *
            10 ** uint32(uniExpo)) >> (96 * 2);
        if (isFlipped) {
            return (10 ** uint32(uniExpo) / price);
        }
        return price;
    }
}
