// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "./base/DeployBase.sol";
import {WhitelistHook} from "../src/WhitelistHook.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {SP} from "sign-protocol/core/SP.sol";

/// @notice Deploys the WhitelistHook contract
contract TestScript is DeployBase {
    function setUp() public {}

    function run() public {
        // デプロイを開始
        vm.startBroadcast();

        // WhitelistHookコントラクトをデプロイ
        SP sp = new SP();
        sp.initialize(1,1);

        writeDeployedAddress(address(sp), "SP");

        // デプロイが完了したら、アドレスを出力
        console.log("SP deployed at:", address(sp));

        // デプロイを終了
        vm.stopBroadcast();
    }
}
