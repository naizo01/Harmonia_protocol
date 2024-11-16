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

async function createAttestations() {
  // スキーマIDを読み込み
  const schemaPath = path.join(__dirname, `../json/${chainId}/schemaIds.json`);
  const schemaIds = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));

  // テストデータ
  const participationData = {
    discordId: "testDiscordId1",
    communityId: "testCommunityId",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    timestamp: Math.floor(Date.now() / 1000), // 現在時刻のタイムスタンプ
  };

  const activeUserData = {
    discordId: "testDiscordId2",
    communityId: "testCommunityId",
    roleId: "testRoleId",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    timestamp: Math.floor(Date.now() / 1000), // 現在時刻のタイムスタンプ
  };

  // Discord参加証明のアテステーションを作成
  const participationAttestation = await client.createAttestation({
    schemaId: schemaIds.participationSchemaId,
    data: participationData,
    indexingValue: participationData.address.toLowerCase(),
  });
  console.log(
    "Participation Attestation ID:",
    participationAttestation.attestationId
  );

  // Discordアクティブユーザー証明のアテステーションを作成
  const activeUserAttestation = await client.createAttestation({
    schemaId: schemaIds.activeUserSchemaId,
    data: activeUserData,
    indexingValue: activeUserData.address.toLowerCase(),
  });
  console.log(
    "Active User Attestation ID:",
    activeUserAttestation.attestationId
  );

  // アテステーションIDをJSONに保存
  const attestationIds = {
    participationAttestationId: participationAttestation.attestationId,
    activeUserAttestationId: activeUserAttestation.attestationId,
  };

  const outputDir = path.join(__dirname, `../json/${chainId}`);
  const outputPath = path.join(outputDir, "attestationIds.json");

  fs.writeFileSync(outputPath, JSON.stringify(attestationIds, null, 2), "utf8");
  console.log(`Attestation IDs have been saved to ${outputPath}`);
}

createAttestations();
