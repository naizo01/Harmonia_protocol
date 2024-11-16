// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ISP} from "sign-protocol-evm/interfaces/ISP.sol";
import {ISPHook} from "sign-protocol-evm/interfaces/ISPHook.sol";
import {Attestation} from "sign-protocol-evm/models/Attestation.sol";

contract WhitelistHook is ISPHook, Ownable {
    uint256 public threshold;
    mapping(address => bool) public whitelist;

    error NotWhitelisted();
    error UnsupportedOperation();

    constructor() Ownable(_msgSender()) {}

    // ホワイトリストにユーザーを追加する関数
    function addToWhitelist(address user) external onlyOwner {
        whitelist[user] = true;
    }

    // ホワイトリストからユーザーを削除する関数
    function removeFromWhitelist(address user) external onlyOwner {
        whitelist[user] = false;
    }

    // アテステーション受信時の処理（ホワイトリストのチェックを含む）
    function didReceiveAttestation(
        address attester,
        uint64, // schemaId
        uint64,
        bytes calldata // extraData
    ) external payable {
        // ホワイトリストに含まれていない場合はエラー
        if (!whitelist[attester]) {
            revert NotWhitelisted();
        }
    }

    function didReceiveAttestation(
        address, // attester
        uint64, // schemaId
        uint64, // attestationId
        IERC20, // resolverFeeERC20Token
        uint256, // resolverFeeERC20Amount
        bytes calldata // extraData
    ) external pure {
        revert UnsupportedOperation();
    }

    function didReceiveRevocation(
        address, // attester
        uint64, // schemaId
        uint64, // attestationId
        bytes calldata // extraData
    ) external payable {
        revert UnsupportedOperation();
    }

    function didReceiveRevocation(
        address, // attester
        uint64, // schemaId
        uint64, // attestationId
        IERC20, // resolverFeeERC20Token
        uint256, // resolverFeeERC20Amount
        bytes calldata // extraData
    ) external pure {
        revert UnsupportedOperation();
    }
}
