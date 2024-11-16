// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "./base/DeployBase.sol";

import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";

import {Constants} from "./base/Constants.sol";
import {HarmoniaDynamicFee} from "../src/HarmoniaDynamicFee.sol";
import {HookMiner} from "../test/utils/HookMiner.sol";

/// @notice Mines the address and deploys the HarmoniaDynamicFee.sol Hook contract
contract HarmoniaDynamicFeeScript is DeployBase, Constants {
    function setUp() public {}

    function run() public {
        address sp = readDeployedAddress("SP");
        address pyth = readDeployedAddress("PYTH");
        bytes32 pyth_price_feed_id = bytes32(
            uint256(
                0x78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501
            )
        );

        // hook contracts must have specific flags encoded in the address
        uint160 flags = uint160(
            Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_INITIALIZE_FLAG
        );

        // Mine a salt that will produce a hook address with the correct flags
        bytes memory constructorArgs = abi.encode(
            POOLMANAGER,
            sp,
            pyth,
            pyth_price_feed_id,
            false
        );
        (address hookAddress, bytes32 salt) = HookMiner.find(
            CREATE2_DEPLOYER,
            flags,
            type(HarmoniaDynamicFee).creationCode,
            constructorArgs
        );

        // Deploy the hook using CREATE2
        vm.broadcast();
        HarmoniaDynamicFee dynamicFee = new HarmoniaDynamicFee{salt: salt}(
            IPoolManager(POOLMANAGER),
            sp,
            pyth,
            pyth_price_feed_id,
            false
        );

        writeDeployedAddress(address(dynamicFee), "DYNAMICFEE");

        require(
            address(dynamicFee) == hookAddress,
            "HarmoniaDynamicFeeScript: hook address mismatch"
        );
    }
}
