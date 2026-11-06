export type Seniority = "C-Level" | "VP" | "Director" | "Manager" | "Individual";
export type Qualification = "Qualified" | "Needs review" | "Not qualified";
export type ReviewStatus = "Pending" | "Approved" | "Rejected" | "Saved";
export type Tone = "formal" | "concise" | "friendly";
export type SignalType = "Hiring" | "Funding" | "Expansion" | "New executive" | "Tech change";

export interface Signal {
  type: SignalType;
  detail: string;
  daysAgo: number;
}

export interface Company {
  id: string;
  name: string;
  website: string;
  industry: string;
  employees: number;
  revenueM: number; // annual revenue, USD millions
  country: string;
  city: string;
  techStack: string[];
  fundingStage: string;
  founded: number;
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
  companies: number;
  discovered: number;
  qualified: number;
  review: number;
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
  key: "industry" | "location" | "size" | "position" | "signals" | "timing";
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
  qualification: Qualification;
  review: ReviewStatus;
  factors: ScoreFactor[];
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
