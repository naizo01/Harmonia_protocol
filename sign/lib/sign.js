require("dotenv").config();
const {
    SignProtocolClient,
    SpMode,
    EvmChains,
    IndexService,
    decodeOnChainData,
    DataLocationOnChain
} = require("@ethsign/sp-sdk");
const {privateKeyToAccount} = require("viem/accounts");
const path = require("path");
const fs = require("fs");
const { encrypt } = require("./crypto-utils");

class SignService {
    constructor() {
        this.signClient = new SignProtocolClient(SpMode.OnChain, {
            chain: EvmChains.baseSepolia,
            account: privateKeyToAccount(process.env.PRIVATE_KEY),
        });
        this.indexService = new IndexService("testnet");
        this.schemaIds = this.loadSchemaIds();
    }

    loadSchemaIds() {
        const schemaPath = path.join(__dirname, `../json/${process.env.CHAIN_ID}/schemaIds.json`);
        return JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
    }

    prepareUserData(type, {discordId, communityId, address, roleId}) {
        return {
            discordId,
            communityId,
            address,
            timestamp: Math.floor(Date.now() / 1000),
            ...(type === 'active' && roleId && {roleId}),
        };
    }

    convertBigIntToString(obj) {
        return JSON.parse(JSON.stringify(obj, (_, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));
    }

    async createAttestation(type, userData) {
        try {
            const schemaId = type === 'participation'
                ? this.schemaIds.participationSchemaId
                : this.schemaIds.activeUserSchemaId;

            const encryptedDiscordId = encrypt(userData.discordId);
            userData.discordId = encryptedDiscordId;

            console.log('Creating attestation with data:', userData);

            const attestation = await this.signClient.createAttestation({
                schemaId: schemaId,
                data: userData,
                indexingValue: encryptedDiscordId.toLowerCase()
            });

            console.log('Attestation created:', attestation);
            return this.convertBigIntToString(attestation);
        } catch (error) {
            console.error('Create attestation error:', error);
            throw error;
        }
    }

    async verifyAttestations(discordId) {
        try {
            const encryptedDiscordId = encrypt(discordId);
            const attestations = await this.indexService.queryAttestationList({
                indexingValue: encryptedDiscordId.toLowerCase(),
                mode: "onchain"
            });
            if (!attestations.rows || attestations.rows.length === 0) {
                return [];
            }

            return attestations.rows.map(att => {
                const schemaData = att.schema.data;
                const decodedData = decodeOnChainData(
                    att.data,
                    DataLocationOnChain.ONCHAIN,
                    schemaData
                );
                return {
                    ...att,
                    data: decodedData,
                    timestamp: Math.floor(Number(att.attestTimestamp) / 1000)
                };
            }).sort((a, b) => b.timestamp - a.timestamp);

        } catch (error) {
            console.error('Verify attestations error:', error);
            throw error;
        }
    }
}

module.exports = new SignService();
