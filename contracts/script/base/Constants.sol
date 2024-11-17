// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PositionManager} from "v4-periphery/src/PositionManager.sol";
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";

/// @notice Shared constants used in scripts
contract Constants {
    // chiliz
    address constant CREATE2_DEPLOYER = address(0x333AA54C25A171dc2d425eBF17b4C4458738202D);
    // old
    // address constant CREATE2_DEPLOYER = address(0x4e59b44847b379578588920cA78FbF26c0B4956C);

    /// @dev populated with default anvil addresses
    IPoolManager constant POOLMANAGER = IPoolManager(address(0x2cB17bC0414233b3998459F460D18E3774e9F40B));
    PositionManager constant posm = PositionManager(address(0x6643ACcf10C80899dB0ED2b8555D8145c3ec824b));
    IAllowanceTransfer constant PERMIT2 = IAllowanceTransfer(address(0x000000000022D473030F116dDEE9F6B43aC78BA3));
}
