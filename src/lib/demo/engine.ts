import type { CampaignInput, CampaignStats, Company, Contact, Dataset, Draft, Lead, Qualification, ReviewStatus, ScoreFactor, Tone } from "./types";

export const SAMPLE_CAMPAIGN: CampaignInput = {
  name: "Saudi Logistics Prospecting",
  industry: "Logistics and Supply Chain",
  country: "Saudi Arabia",
  cities: ["Riyadh", "Jeddah", "Dammam"],
  sizeLabel: "Mid-market (50–500)",
  employeeMin: 50,
  employeeMax: 500,
  revenueMin: 0,
  revenueMax: 0,
  positions: ["Chief Operating Officer", "Operations Director", "Supply Chain Director", "Fleet Manager"],
  icp: "Mid-sized Saudi logistics, transportation, warehousing and distribution companies that run their own fleets and still plan routes manually or in spreadsheets.",
  offering: "FleetFlow — a fictional fleet and logistics workflow optimization software that automates route planning, dispatch and driver scheduling.",
  objective: "Book discovery meetings",
};

export const WEIGHTS = { industry: 30, geography: 20, size: 20, decisionMaker: 30 } as const;

export function qualificationFor(score: number): Qualification {
  if (score >= 75) return "Qualified";
  if (score >= 60) return "Review";
  return "Low Fit";
}

const norm = (s: string) => s.trim().toLowerCase();
const sameList = (a: string[], b: string[]) => a.length === b.length && [...a].map(norm).sort().join("|") === [...b].map(norm).sort().join("|");

/** True when the criteria match the preset sample scenario, so preset component scores apply. */
export function usesPresetScores(c: CampaignInput): boolean {
  const s = SAMPLE_CAMPAIGN;
  return norm(c.industry) === norm(s.industry) && norm(c.country) === norm(s.country) && sameList(c.cities, s.cities)
    && c.employeeMin === s.employeeMin && c.employeeMax === s.employeeMax && sameList(c.positions, s.positions);
}

export function positionMatch(title: string, positions: string[]): number {
  const t = norm(title);
  if (positions.some((p) => norm(p) === t)) return 1;
  const words = new Set(t.split(/\s+/).filter((w) => w.length > 3 && w !== "manager" && w !== "director" && w !== "officer"));
  const related = positions.some((p) => norm(p).split(/\s+/).some((w) => words.has(w)));
  const opsish = /operat|supply|fleet|logist|warehouse/.test(t);
  return related || opsish ? 0.66 : 0.33;
}

const SECTOR_RELEVANCE: Record<string, number> = { Logistics: 30, Freight: 27, Transportation: 27, Distribution: 26, Warehousing: 24, "Cold Chain": 24 };

/** Rule-based component scores for custom campaigns. Whole numbers, so parts always sum to the total. */
function ruleScores(c: CampaignInput, co: Company, ct: Contact) {
  const industry = norm(c.industry) === norm(co.industry) ? SECTOR_RELEVANCE[co.sector] ?? 20 : 6;
  const countryOk = norm(c.country) === norm(co.country);
  const cityOk = c.cities.length === 0 || c.cities.some((x) => norm(x) === norm(co.city));
  const geography = countryOk ? (cityOk ? 20 : 10) : 0;
  let size = 20;
  if (co.employees < c.employeeMin) size = Math.max(4, Math.round((20 * co.employees) / Math.max(1, c.employeeMin)));
  else if (co.employees > c.employeeMax) size = Math.max(4, Math.round((20 * c.employeeMax) / co.employees));
  const pm = positionMatch(ct.title, c.positions);
  const decisionMaker = pm === 1 ? 30 : pm > 0.5 ? 20 : 10;
  return { industry, geography, size, decisionMaker };
}

export function scoreLead(c: CampaignInput, co: Company, ct: Contact): { score: number; factors: ScoreFactor[]; explanation: string; recommendation: { title: string; detail: string } } {
  const preset = usesPresetScores(c);
  const p = preset ? co.preset : ruleScores(c, co, ct);
  const inCity = c.cities.length === 0 || c.cities.some((x) => norm(x) === norm(co.city));
  const inSize = co.employees >= c.employeeMin && co.employees <= c.employeeMax;
  const factors: ScoreFactor[] = [
    { key: "industry", label: "Industry relevance", weight: WEIGHTS.industry, points: p.industry, reason: `${co.sector} company in ${co.industry.toLowerCase()} — ${norm(c.industry) === norm(co.industry) ? "matches the target industry" : "outside the target industry"}` },
    { key: "geography", label: "Geographic relevance", weight: WEIGHTS.geography, points: p.geography, reason: `${co.city}, ${co.country} — ${inCity ? "a target city" : "outside the target cities"}` },
    { key: "size", label: "Company size suitability", weight: WEIGHTS.size, points: p.size, reason: `${co.employees} employees — ${inSize ? `within ${c.employeeMin}–${c.employeeMax}` : `outside ${c.employeeMin}–${c.employeeMax}`}` },
    { key: "decisionMaker", label: "Decision-maker relevance", weight: WEIGHTS.decisionMaker, points: p.decisionMaker, reason: `${ct.title} — ${positionMatch(ct.title, c.positions) === 1 ? "a target position" : "not one of the target positions"}` },
  ];
  const score = factors.reduce((a, f) => a + f.points, 0);
  const q = qualificationFor(score);
  if (preset) return { score, factors, explanation: co.preset.explanation, recommendation: co.preset.nextAction };
  const top = [...factors].sort((a, b) => b.points / b.weight - a.points / a.weight)[0]!;
  const weak = [...factors].sort((a, b) => a.points / a.weight - b.points / b.weight)[0]!;
  return {
    score, factors,
    explanation: `Scored ${score}/100. Strongest: ${top.label.toLowerCase()}. Weakest: ${weak.label.toLowerCase()}.`,
    recommendation: q === "Qualified" ? { title: `Book discovery call with ${ct.title}`, detail: "Approve and send the personalised intro." }
      : q === "Review" ? { title: "Confirm fit before outreach", detail: "Review manually, then approve or save for later." }
      : { title: "Do not contact now; revisit in 90 days", detail: "Low fit for this campaign today." },
  };
}

export function selectionReasons(lead: Lead): { positives: string[]; concerns: string[] } {
  return {
    positives: lead.factors.filter((f) => f.points / f.weight >= 0.75).map((f) => f.reason),
    concerns: lead.factors.filter((f) => f.points / f.weight < 0.6).map((f) => f.reason),
  };
}

export function nextAction(lead: Pick<Lead, "qualification" | "review" | "recommendation">): { title: string; detail: string } {
  if (lead.review === "Rejected") return { title: "No further action", detail: "This prospect was rejected and is excluded from outreach." };
  if (lead.qualification === "Qualified" && lead.review === "Approved") return { title: "Send personalised intro", detail: "Open Outreach, review the draft and copy it into your email client." };
  return lead.recommendation;
}

export interface RunResult { leads: Lead[]; stats: CampaignStats }

export function runPipeline(campaignId: string, c: CampaignInput, data: Dataset): RunResult {
  const byId = new Map(data.companies.map((x) => [x.id, x]));
  const leads: Lead[] = data.contacts
    .map((ct) => {
      const co = byId.get(ct.companyId)!;
      const r = scoreLead(c, co, ct);
      return { id: `${campaignId}__${ct.id}`, campaignId, contactId: ct.id, companyId: co.id, score: r.score, qualification: qualificationFor(r.score), review: "Pending" as ReviewStatus, factors: r.factors, explanation: r.explanation, recommendation: r.recommendation };
    })
    .sort((a, b) => b.score - a.score || a.contactId.localeCompare(b.contactId));
  const qualified = leads.filter((l) => l.qualification === "Qualified").length;
  const review = leads.filter((l) => l.qualification === "Review").length;
  return { leads, stats: { discovered: leads.length, enriched: leads.length, qualified, review, lowFit: leads.length - qualified - review, drafts: qualified } };
}

const OPENERS: Record<Tone, string[]> = {
  formal: ["I hope this message finds you well.", "I am writing regarding {company}'s operations in {city}."],
  concise: ["Quick note, {first}.", "One idea for {company}."],
  friendly: ["Hope your week is going well!", "I've been following {company}'s growth in {city} with interest."],
};

export function generateDraft(lead: Lead, company: Company, contact: Contact, campaign: CampaignInput, tone: Tone, variant = 0): Omit<Draft, "savedAt"> {
  const first = contact.name.split(" ")[0] ?? contact.name;
  const product = campaign.offering.split(/ — | - /)[0]?.trim() || "our solution";
  const opener = (OPENERS[tone][variant % 2] ?? "").replace("{company}", company.name).replace("{city}", company.city).replace("{first}", first);
  const ask =
    campaign.objective === "Drive product demo requests" ? "Would a 20-minute product demo be useful?"
    : campaign.objective === "Find channel partners" ? "Would you be open to exploring a partnership?"
    : tone === "concise" ? "Open to a 15-minute call next week?"
    : "Would you be open to a short discovery call next week?";
  const subjects: Record<Tone, string[]> = {
    formal: [`${company.name} × ${product}`, `Supporting ${company.name}'s operations in ${company.city}`],
    concise: [`Idea for ${company.name}`, `${first}, quick question`],
    friendly: [`${first}, an idea for your team in ${company.city}`, `Helping ${company.name} scale`],
  };
  const body = [
    tone === "formal" ? `Dear ${first},` : `Hi ${first},`,
    "",
    `${opener} I understand ${company.name} ${company.contextNote}.`,
    "",
    `As ${contact.title}, you are likely focused on keeping operations efficient as the business grows. ${campaign.offering}`,
    "",
    `Teams of a similar size (${company.employees} employees) typically use it to cut planning time and improve on-time delivery.`,
    "",
    ask,
    "",
    tone === "formal" ? "Kind regards," : "Best regards,",
    "Maya Chen",
    "Head of Growth (demo persona)",
  ].join("\n");
  return { leadId: lead.id, tone, variant, subject: subjects[tone][variant % 2] ?? `Idea for ${company.name}`, body };
}
