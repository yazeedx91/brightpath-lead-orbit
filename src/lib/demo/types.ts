export type Seniority = "C-Level" | "VP" | "Director" | "Manager" | "Individual";
export type Qualification = "Qualified" | "Review" | "Low Fit";
export type ReviewStatus = "Pending" | "Approved" | "Rejected" | "Saved";
export type Tone = "formal" | "concise" | "friendly";
export type FactorKey = "industry" | "geography" | "size" | "decisionMaker";

export const DATA_SOURCE = "Synthetic Demo Dataset";

export interface PresetScore {
  industry: number; // /30
  geography: number; // /20
  size: number; // /20
  decisionMaker: number; // /30
  explanation: string;
  nextAction: { title: string; detail: string };
}

export interface Company {
  id: string;
  prospectId: string; // e.g. PX-001
  name: string;
  website: string; // fictional, .example
  sector: string; // Logistics / Transportation / Warehousing / Distribution / Cold Chain
  industry: string; // campaign-level industry
  employees: number;
  sizeCategory: string;
  revenueM: number;
  country: string;
  city: string;
  founded: number;
  description: string;
  contextNote: string;
  source: typeof DATA_SOURCE;
  preset: PresetScore;
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  title: string;
  seniority: Seniority;
  department: string;
  tenureMonths: number;
  email: string; // fictional, .example, not verified
  summary: string;
}

export interface CampaignInput {
  name: string;
  industry: string;
  country: string;
  cities: string[];
  sizeLabel: string;
  employeeMin: number;
  employeeMax: number;
  revenueMin: number;
  revenueMax: number;
  positions: string[];
  icp: string;
  offering: string;
  objective: string;
}

export interface CampaignStats {
  discovered: number;
  enriched: number;
  qualified: number;
  review: number;
  lowFit: number;
  drafts: number;
}

export type CampaignStatus = "draft" | "running" | "complete";

export interface Campaign extends CampaignInput {
  id: string;
  createdAt: string;
  status: CampaignStatus;
  isSample: boolean;
  stats: CampaignStats;
}

export interface ScoreFactor {
  key: FactorKey;
  label: string;
  weight: number;
  points: number;
  reason: string;
}

export interface Lead {
  id: string;
  campaignId: string;
  contactId: string;
  companyId: string;
  score: number;
  qualification: Qualification;
  review: ReviewStatus;
  factors: ScoreFactor[];
  explanation: string;
  recommendation: { title: string; detail: string };
}

export interface Draft {
  leadId: string;
  tone: Tone;
  variant: number;
  subject: string;
  body: string;
  savedAt: string;
}

export interface ActivityEvent {
  id: string;
  at: string;
  message: string;
  kind: "campaign" | "agent" | "review" | "draft";
}

export interface Dataset {
  companies: Company[];
  contacts: Contact[];
}
