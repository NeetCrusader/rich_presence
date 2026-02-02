import { ClientPresenceStatusData } from "discord.js";

export interface Presence {
    _id: string; // User ID
    _dn: string; // Display Name
    tag: string; // Username
    pfp: string; // Profile Picture URL
    platform: ClientPresenceStatusData; // Status by platform (web, mobile, desktop)
    status: string; // User status (online, idle, dnd, offline)
    activities: Activity[]; // List of activities
    badges: string[]; // User badges
    customStatus: {
        name: string; // Custom status name
        createdTimestamp: number; // Timestamp when the custom status was created
        emoji: string; // Emoji associated with the custom status
    };
}

interface Activity {
  applicationId: string; // Application ID associated with the activity
  assets: {
    largeImage: string; // URL of the large image asset
    largeText: string; // Text description for the large image
    smallImage: string; // URL of the small image asset
    smallText: string;
  };
  details: string; // Details about the activity
  emoji: string; // Emoji associated with the activity
  name: string; // Name of the activity
  state: string; // Current state of the activity
  title: string; // Title of the activity
  timestamps: {
    start: Date; // Start time of the activity
    end: Date; // End time of the activity
  };
  type: string; // Type of activity (e.g., Playing, Streaming)
}
