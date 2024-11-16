require("dotenv").config();
const fs = require("fs");
const { SignProtocolClient, SpMode, EvmChains } = require("@ethsign/sp-sdk");
const { privateKeyToAccount } = require("viem/accounts");
const path = require("path");

const privateKey = process.env.PRIVATE_KEY;
const chainId = process.env.CHAIN_ID;

const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.baseSepolia,
  account: privateKeyToAccount(privateKey),
});

async function queryAttestations() {
  // アテステーションIDを読み込み
  const attestationPath = path.join(
    __dirname,
    `../json/${chainId}/attestationIds.json`
  );
  const attestationIds = JSON.parse(fs.readFileSync(attestationPath, "utf-8"));

  // Discord参加証明のアテステーションを取得
  const participationAttestation = await client.getAttestation(
    attestationIds.participationAttestationId
  );
  console.log("Participation Attestation:", participationAttestation);

  // Discordアクティブユーザー証明のアテステーションを取得
  const activeUserAttestation = await client.getAttestation(
    attestationIds.activeUserAttestationId
  );
  console.log("Active User Attestation:", activeUserAttestation);
}

queryAttestations();
