require("dotenv").config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const signService = require('../lib/sign');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.id !== process.env.DISCORD_OWNER_ID) return;

  if (message.content.startsWith('!attest')) {
    const args = message.content.split(' ');
    const type = args[1];
    const user = message.mentions.users.first();
    const roleId = message.content.split('>')[1]?.trim().split(' ')[0];

    if (!['participation', 'active'].includes(type) || !user) {
      await message.reply(
          'Usage: !attest <type> @user <roleId>\n' +
          'Example:\n' +
          '  !attest participation @user\n' +
          '  !attest active @user active-role'
      );
      return;
    }

    try {
      const attestations = await signService.verifyAttestations(user.id);
      const participationAttestation = attestations.find(att =>
          att.schemaId === signService.schemaIds.participationSchemaId
      );

      if (!participationAttestation) {
        await message.reply('❌ Error: User has not connected their wallet yet. They need a participation attestation first.');
        return;
      }

      console.log('say kai')
      console.log(participationAttestation)
      const address = participationAttestation.data.address;
      const userData = signService.prepareUserData(type, {
        discordId: user.id,
        communityId: message.guild.id,
        address,
        roleId: roleId || undefined
      });

      await message.reply('Creating attestation...');
      const attestation = await signService.createAttestation(type, userData);

      await message.reply({
        content: `✅ Attestation created!\n` +
            `Type: ${type}\n` +
            `User: ${user.tag}\n` +
            `Community: ${message.guild.id}\n` +
            `Address: ${address}\n` +
            `${roleId ? `Role: ${roleId}\n` : ''}` +
            `ID: ${attestation.attestationId}`,
        allowedMentions: { users: [] }
      });
    } catch (error) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }

  if (message.content.startsWith('!verify')) {
    const user = message.mentions.users.first();

    if (!user) {
      await message.reply('Usage: !verify @user');
      return;
    }

    try {
      const attestations = await signService.verifyAttestations(user.id);
      console.log(attestations)

      const lines = [
        `## 🔍 Discord User Status: ${user.tag}`,
        ''
      ];

      const participation = attestations.find(att =>
          att.schemaId === signService.schemaIds.participationSchemaId
      );

      if (participation) {
        lines.push(
            `### 👥 Community Member`,
            `Joined: ${new Date(participation.timestamp * 1000).toLocaleDateString()}`,
            ''
        );
      } else {
        lines.push(
            `### ❌ Not a Community Member`,
            `This user has not connected`,
            ''
        );
        await message.reply({
          content: lines.join('\n'),
          allowedMentions: { users: [] }
        });
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

      await message.reply({
        content: lines.join('\n'),
        allowedMentions: { users: [] }
      });

    } catch (error) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }

  if (message.content === '!help') {
    await message.reply(
        'Available commands:\n' +
        '!attest <type> <address> @user <roleId></roleId> - Create attestation\n' +
        '!verify @user - Check user status\n\n' +
        'Examples:\n' +
        '!attest participation @user\n' +
        '!attest active @user active-role\n' +
        '!verify @user'
    );
  }
});

client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

client.once(Events.ClientReady, () => {
  console.log('Bot is ready!');
});

client.login(process.env.DISCORD_TOKEN).catch(console.error);
