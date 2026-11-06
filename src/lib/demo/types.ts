export type Seniority = "C-Level" | "VP" | "Director" | "Manager" | "Individual";
export type Tier = "Hot" | "Warm" | "Cold";
export type LeadStatus =
  | "qualified"
  | "approved"
  | "rejected"
  | "contacted"
  | "replied"
  | "meeting";
export type Tone = "formal" | "concise" | "friendly";
export type SignalType = "Hiring" | "Funding" | "Expansion" | "New executive" | "Tech change";

export interface Signal {
  type: SignalType;
  detail: string;
  daysAgo: number;
}

export interface ICP {
  description: string;
  industries: string[];
  employeeMin: number;
  employeeMax: number;
  regions: string[];
  seniority: Seniority[];
  departments: string[];
  signals: SignalType[];
  exclusions: string[];
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  employees: number;
  revenueBand: string;
  hq: string;
  region: string;
  techStack: string[];
  fundingStage: string;
  signals: Signal[];
  description: string;
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  title: string;
  seniority: Seniority;
  department: string;
  tenureMonths: number;
  email: string;
  summary: string;
}

export interface ScoreFactor {
  key: "fit" | "intent" | "seniority" | "timing";
  label: string;
  weight: number;
  value: number; // 0..1
  points: number;
  reason: string;
}

export interface Lead {
  id: string;
  campaignId: string;
  contactId: string;
  companyId: string;
  score: number;
  tier: Tier;
  factors: ScoreFactor[];
  status: LeadStatus;
  discoveredDay: number; // day index within campaign
}

export interface Draft {
  leadId: string;
  tone: Tone;
  variant: number;
  subject: string;
  body: string;
  personalization: string[];
  edited: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  icp: ICP;
  createdAt: string;
  status: "running" | "complete";
  stats: { scanned: number; matched: number; contacts: number; qualified: number };
}

export interface Dataset {
  companies: Company[];
  contacts: Contact[];
}
