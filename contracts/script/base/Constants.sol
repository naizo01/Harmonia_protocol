// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PositionManager} from "v4-periphery/src/PositionManager.sol";
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";

/// @notice Shared constants used in scripts
contract Constants {
    address constant CREATE2_DEPLOYER = address(0x4e59b44847b379578588920cA78FbF26c0B4956C);

    /// @dev populated with default anvil addresses
    // IPoolManager constant POOLMANAGER = IPoolManager(address(0xd51ccB81De8426637f7b6fA8405B1990a3B81648));
    // PositionManager constant posm = PositionManager(payable(address(0x5Cd9D2Ae2BBbF59599d92fF57621d257be371639)));
    IPoolManager constant POOLMANAGER = IPoolManager(address(0xcFA0A7b03Da220b5d68fFA048aaCf48daeE1915e));
    PositionManager constant posm = PositionManager(payable(address(0x2224f77C646FD4322DF82c374E935921f6AAe19E)));
    IAllowanceTransfer constant PERMIT2 = IAllowanceTransfer(address(0x000000000022D473030F116dDEE9F6B43aC78BA3));
}