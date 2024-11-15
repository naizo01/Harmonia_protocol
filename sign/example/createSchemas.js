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

async function createSchemas() {
  // Discordコミュニティ参加証明のスキーマ
  const participationSchema = await client.createSchema({
    name: "DiscordParticipationProof",
    data: [
      { name: "discordId", type: "string" },
      { name: "communityId", type: "string" },
      { name: "address", type: "address" },
      { name: "timestamp", type: "uint64" },
    ],
  });

  // Discordアクティブユーザー証明のスキーマ
  const activeUserSchema = await client.createSchema({
    name: "DiscordActiveUserProof",
    data: [
      { name: "discordId", type: "string" },
      { name: "communityId", type: "string" },
      { name: "roleId", type: "string" },
      { name: "address", type: "address" },
      { name: "timestamp", type: "uint64" },
    ],
  });

  // スキーマIDをJSON形式でファイルに書き込む
  const schemaIds = {
    participationSchemaId: participationSchema.schemaId,
    activeUserSchemaId: activeUserSchema.schemaId,
  };
  const outputDir = path.join(__dirname, `../json/${chainId}`);
  const outputPath = path.join(outputDir, "schemaIds.json");

  fs.writeFileSync(outputPath, JSON.stringify(schemaIds, null, 2));
  console.log("Participation Schema ID:", participationSchema.schemaId);
  console.log("Active User Schema ID:", activeUserSchema.schemaId);
  console.log("Schema IDs have been written to schemaIds.json");
}

createSchemas();
