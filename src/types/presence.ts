export interface PresenceObject {
  _id: string;
  tag: string;
  pfp: string;
  status: string;
  customStatus: CustomStatus | null;
  activities: Activity[];
  platform: any;
  badges: any[];
  _dn: string;
}

export interface CustomStatus {
  name: string | null;
  createdTimestamp: number;
  emoji: any;
}

export interface Activity {
  applicationId: string | null;
  assets: any;
  details: string | null;
  emoji: any;
  name: string;
  title: string | null;
  state: string | null;
  type: string;
  timestamps: { start: Date | null; end: Date | null } | null;
}
