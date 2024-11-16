// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "./base/DeployBase.sol";
import {WhitelistHook} from "../src/WhitelistHook.sol";

/// @notice Deploys the WhitelistHook contract
contract WhitelistHookScript is DeployBase {
    function setUp() public {}

    function run() public {
        // デプロイを開始
        vm.startBroadcast();

        // WhitelistHookコントラクトをデプロイ
        WhitelistHook whitelistHook = new WhitelistHook();

        writeDeployedAddress(address(whitelistHook), "WHITELIST");

        // デプロイが完了したら、アドレスを出力
        console.log("WhitelistHook deployed at:", address(whitelistHook));

        // デプロイを終了
        vm.stopBroadcast();
    }
}
