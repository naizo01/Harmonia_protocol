require("dotenv").config();
const signService = require('../lib/sign');

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'attest': {
            const [type, address, communityId, discordId, roleId] = args.slice(1);

            if (!type || !address || !discordId) {
                console.log('Usage: node test-bot.js attest <type> <address> <communityId> <discordId> <roleId>');
                console.log('Example:');
                console.log('  node test-bot.js attest participation 0x123... test-community discord123');
                console.log('  node test-bot.js attest active 0x123... test-community discord123 moderator');
                return;
            }

            if (!['participation', 'active'].includes(type)) {
                console.log('Type must be either "participation" or "active"');
                return;
            }

            try {
                const userData = signService.prepareUserData(type, {
                    discordId,
                    communityId,
                    address,
                    roleId
                });

                console.log('Creating attestation...');
                const attestation = await signService.createAttestation(type, userData);
                console.log('\n✅ Attestation created successfully!');
                console.log('Type:', type);
                console.log('Community ID:', communityId);
                console.log('Discord ID:', discordId);
                console.log('Address:', address);
                console.log('Attestation ID:', attestation.attestationId);
            } catch (error) {
                console.error('\n❌ Error creating attestation:', error.message);
            }
            break;
        }

        case 'verify': {
            const discordId = args[1];

            if (!discordId) {
                console.log('Usage: node test-bot.js verify <discordId>');
                console.log('Example:');
                console.log('  node test-bot.js verify discord123');
                return;
            }

            try {
                const attestations = await signService.verifyAttestations(discordId);

                const lines = [
                    `## 🔍 Discord User Status: ${discordId}`,
                    ''
                ];

                const participation = attestations.find(att =>
                    att.schemaId === signService.schemaIds.participationSchemaId
                );

                if (participation) {
                    lines.push(
                        `### 👥 Community Member`,
                        `Linked Wallet: \`${participation.data.address}\``,
                        `Joined: ${new Date(participation.timestamp * 1000).toLocaleDateString()}`,
                        ''
                    );
                } else {
                    lines.push(
                        `### ❌ Not a Community Member`,
                        `This Discord user has not connected with Web3Auth.`,
                        ''
                    );
                    console.log(lines.join('\n'));
                    return;
                }

                const activeAttestations = attestations
                    .filter(att => att.schemaId === signService.schemaIds.activeUserSchemaId)
                    .sort((a, b) => b.timestamp - a.timestamp);

                if (activeAttestations.length > 0) {
                    lines.push(
                        `### ⭐ Active Roles`,
                        ...activeAttestations.map(att =>
                            `• Role \`${att.data.roleId}\` (Granted: ${new Date(att.timestamp * 1000).toLocaleDateString()})`
                        ),
                        ''
                    );
                } else {
                    lines.push(
                        `### ⚪ No Active Roles`,
                        `No active roles have been granted yet.`,
                        ''
                    );
                }

                lines.push(
                    `### 📊 Fee Discount Status`,
                    `• Base Discount: ✅ (Community Member)`,
                    `• Extra Discount: ${activeAttestations.length > 0 ? '✅ (Active User)' : '❌ (Not Active)'}`
                );

                console.log(lines.join('\n'));

            } catch (error) {
                console.error('\n❌ Error verifying attestations:', error.message);
            }
            break;
        }
        default:
            console.log('Available commands:');
            console.log('Commands:');
            console.log('  attest <type> <address> <communityId> <discordId> [roleId] - Create attestation');
            console.log('  verify <discordId> - Check Discord user status');
            console.log('\nExamples:');
            console.log('  node test-bot.js attest participation 0x123... test-community discord123');
            console.log('  node test-bot.js attest active 0x123... test-community discord123 moderator');
            console.log('  node test-bot.js verify discord123');
    }
}

main().catch(console.error);
