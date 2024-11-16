// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console2.sol";
import {WhitelistHook} from "../src/WhitelistHook.sol";
import {SP} from "sign-protocol/core/SP.sol";
import {ISP} from "sign-protocol/interfaces/ISP.sol";
import {Schema} from "sign-protocol/models/Schema.sol";
import {DataLocation} from "sign-protocol/models/DataLocation.sol";
import {Attestation} from "sign-protocol/models/Attestation.sol";

contract SignTest is Test {
    ISP public sp;
    address public prankSender = 0x55D22d83752a9bE59B8959f97FCf3b2CAbca5094;
    WhitelistHook public whitelistHook;

    function setUp() public {
        sp = new SP();
        SP(address(sp)).initialize(1, 1);
        whitelistHook = new WhitelistHook();
        whitelistHook.addToWhitelist(prankSender);
    }

    function test_registerAndAttest() public {
        Schema[] memory schemas = _createMockSchemas(); // Mock schemas

        // Warping to Mock Timestamp
        uint64 mockTimestamp = 12_345;
        vm.warp(mockTimestamp);

        // Registering Schemas
        uint64 schemaId0 = sp.register(schemas[0], "");
        uint64 schemaId1 = sp.register(schemas[1], "");

        bytes memory data1 = encodeDataParticipation(
            "testDiscordId1",
            "testCommunityId",
            address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266),
            uint64(123)
        );

        bytes memory data2 = encodeDataActiveUser(
            "testDiscordId2",
            "testCommunityId",
            "testRoleId",
            address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266),
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
            attester: prankSender,
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
            attester: prankSender,
            validUntil: uint64(block.timestamp),
            dataLocation: DataLocation.ONCHAIN,
            revoked: false,
            recipients: new bytes[](0)
        });

        string[] memory indexingKeys = new string[](2);
        indexingKeys[0] = "test indexing key 0";
        indexingKeys[1] = "test indexing key 1";

        // Attesting

        vm.prank(prankSender);
        uint64 attestationId1 = sp.attest(
            attestations[0],
            indexingKeys[0],
            "",
            ""
        );

        Attestation memory attestation1 = sp.getAttestation(attestationId1);
        (
            string memory discordId1,
            string memory communityId1,
            address addr1,
            uint64 timestamp1
        ) = decodeDataParticipation(attestation1.data);

        assertEq(discordId1, "testDiscordId1");
        assertEq(communityId1, "testCommunityId");
        assertEq(addr1, address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266));
        assertEq(timestamp1, uint64(123));

        vm.prank(prankSender);
        uint64 attestationId2 = sp.attest(
            attestations[1],
            indexingKeys[1],
            "",
            ""
        );

        Attestation memory attestation2 = sp.getAttestation(attestationId2);
        (
            string memory discordId2,
            string memory communityId2,
            string memory roleId2,
            address addr2,
            uint64 timestamp2
        ) = decodeDataActiveUser(attestation2.data);

        assertEq(discordId2, "testDiscordId2");
        assertEq(communityId2, "testCommunityId");
        assertEq(roleId2, "testRoleId");
        assertEq(addr2, address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266));
        assertEq(timestamp2, uint64(123));
    }

    // DiscordParticipationProof
    function encodeDataParticipation(
        string memory discordId,
        string memory communityId,
        address addr,
        uint64 timestamp
    ) public pure returns (bytes memory) {
        return abi.encode(discordId, communityId, addr, timestamp);
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
    function encodeDataActiveUser(
        string memory discordId,
        string memory communityId,
        string memory roleId,
        address addr,
        uint64 timestamp
    ) public pure returns (bytes memory) {
        return abi.encode(discordId, communityId, roleId, addr, timestamp);
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

    function _createMockSchemas() internal view returns (Schema[] memory) {
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
        Schema[] memory schemas = new Schema[](2);
        schemas[0] = schema0;
        schemas[1] = schema1;
        return schemas;
    }
}
