require("dotenv").config();

async function fetchAllGuildMembers(guildId) {
  let members = [];
  let lastMemberId = null;
  let hasMore = true;

  while (hasMore) {
    const url = `https://discord.com/api/v10/guilds/${guildId}/members?limit=1000${
      lastMemberId ? `&after=${lastMemberId}` : ""
    }`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching members: ${response.statusText}`);
    }

    const members = await response.json();
    console.log(members);
    return members;
  }
}
// 使用例
fetchAllGuildMembers("1293876618045030400")
  .then((members) => {
    console.log("Members:", members);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
