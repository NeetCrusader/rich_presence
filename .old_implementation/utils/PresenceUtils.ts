import { ActivityType, GuildMember, Presence } from "discord.js";
import { Presence as PresenceObject } from "../interfaces/Presence";
import { formatAssets, formatBadges, formatTitle, formatEmoji } from "./FormatUtils";
import { app } from "..";

export async function sendPresence(
  guildMember: GuildMember,
  newPresence: Presence,
  ws?: any,
  local?: boolean
) {
  const displayName = guildMember?.displayName ?? newPresence?.user?.globalName ?? newPresence?.user?.username;

  if (newPresence) {
    const presenceObject: PresenceObject = {
      _id: newPresence.userId,
      tag: newPresence.user.tag.split("#")[1] === "0" ? newPresence.user.tag.split("#")[0] : newPresence.user.tag,
      pfp: newPresence.user.displayAvatarURL({ forceStatic: false }),
      status: newPresence.status,
      customStatus: null,
      activities: [],
      platform: newPresence.clientStatus,
      badges: await formatBadges(newPresence.user.flags, newPresence.user),
      _dn: displayName,
    };

    if (newPresence.activities.length > 0) {
      if (newPresence.activities[0].type === 4) {
        presenceObject.customStatus = {
          name: newPresence.activities[0].state,
          createdTimestamp: newPresence.activities[0].createdTimestamp,
          emoji: formatEmoji(newPresence.activities[0].emoji),
        };
      }

      for (const activity of newPresence.activities) {
        if (activity.name !== "Custom Status") {
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
    }

    if (local && ws) {
      ws.send(JSON.stringify(presenceObject));
    } else {
      app.server?.publish(newPresence.userId, JSON.stringify(presenceObject));
    }
  } else {
    const presenceObject: PresenceObject = {
      _id: guildMember.id,
      tag: guildMember.user.tag.split("#")[1] === "0" ? guildMember.user.tag.split("#")[0] : guildMember.user.tag,
      pfp: guildMember.user.displayAvatarURL({ forceStatic: false }),
      status: "offline",
      customStatus: null,
      activities: [],
      platform: {},
      badges: await formatBadges(guildMember.user.flags, guildMember.user),
      _dn: displayName,
    };

    if (local && ws) {
      ws.send(JSON.stringify(presenceObject));
    } else {
      app.server?.publish(guildMember.id, JSON.stringify(presenceObject));
    }
  }
}
