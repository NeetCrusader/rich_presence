export interface PresenceObject {
  _id: string;
  tag: string;
  pfp: string;
  status: string;
  customStatus: CustomStatus | null;
  activities: Activity[];
  platform: ClientPresenceStatusData;
  badges: string[] | null;
  _dn: string;
}

export interface CustomStatus {
  name: string | null;
  createdTimestamp: number;
  emoji: string | null;
}

export interface ActivityAssets {
  smallImage: string | null;
  smallText: string | null;
  largeImage: string | null;
  largeText: string | null;
}

export interface Activity {
  applicationId: string | null;
  assets: ActivityAssets;
  details: string | null;
  emoji: string | null;
  name: string;
  title: string | null;
  state: string | null;
  type: string;
  timestamps: { start: Date | null; end: Date | null } | null;
}

export interface ClientPresenceStatusData {
  desktop?: string;
  mobile?: string;
  web?: string;
}
