import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import 'dotenv/config';
import { formatAssets, formatBadges, formatEmoji, formatTitle } from './utils/FormatUtils.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences],
});

client.on('ready', (client) => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
});

client.on('presenceUpdate', async (_oldPresence, newPresence) => {
  if (!newPresence) return;
  
  const guild = client.guilds.cache.get(process.env.GUILD_ID!);
  if (!guild) return;

  const guildMember = guild.members.cache.get(newPresence.userId);
  if (!guildMember) return;

  const displayName = guildMember?.displayName ?? newPresence?.user?.globalName ?? newPresence?.user?.username;

  const presenceObject: any = {
    _id: newPresence.userId,
    tag: newPresence.user.tag.split('#')[1] === '0' ? newPresence.user.tag.split('#')[0] : newPresence.user.tag,
    pfp: newPresence.user.displayAvatarURL({ forceStatic: false }),
    status: newPresence.status,
    customStatus: null,
    activities: [],
    platform: newPresence.clientStatus,
    badges: await formatBadges(newPresence.user.flags, newPresence.user),
    _dn: displayName,
  };

  // Process custom status
  if (newPresence.activities.length > 0 && newPresence.activities[0].type === ActivityType.Custom) {
    presenceObject.customStatus = {
      name: newPresence.activities[0].state,
      createdTimestamp: newPresence.activities[0].createdTimestamp ?? Date.now(),
      emoji: formatEmoji(newPresence.activities[0].emoji),
    };
  }

  // Process activities
  for (const activity of newPresence.activities) {
    if (activity.name !== 'Custom Status') {
      presenceObject.activities.push({
        applicationId: activity.applicationId,
        assets: await formatAssets(activity),
        details: activity.details,
        emoji: formatEmoji(activity.emoji),
        name: activity.name,
        title: formatTitle(activity),
        state: activity.state,
        type: ActivityType[activity.type],
        timestamps: activity.timestamps
          ? { start: activity.timestamps.start, end: activity.timestamps.end }
          : null,
      });
    }
  }

  // Send to Cloudflare Worker webhook
  try {
    await fetch(`${process.env.WEBHOOK_URL}/webhook/presence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WEBHOOK_SECRET}`,
      },
      body: JSON.stringify({
        userId: newPresence.userId,
        presence: presenceObject,
      }),
    });
    console.log(`📡 Updated presence for ${displayName}`);
  } catch (error) {
    console.error('❌ Failed to send presence update:', error);
  }
});

client.login(process.env.BOT_TOKEN);
