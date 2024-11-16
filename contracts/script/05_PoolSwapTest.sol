// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "./base/DeployBase.sol";
import {WhitelistHook} from "../src/WhitelistHook.sol";

/// @notice Adds an address to the WhitelistHook contract's whitelist
contract AddToWhitelistScript is DeployBase {

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        address whitelistHookAddress = readDeployedAddress("WHITELIST");
        address userToWhitelist1 = readDeployedAddress("ATTESTER1");
        address userToWhitelist2 = readDeployedAddress("ATTESTER2");
        WhitelistHook whitelistHook = WhitelistHook(whitelistHookAddress);

        whitelistHook.addToWhitelist(userToWhitelist1);
        whitelistHook.addToWhitelist(userToWhitelist2);

        vm.stopBroadcast();
    }
}
