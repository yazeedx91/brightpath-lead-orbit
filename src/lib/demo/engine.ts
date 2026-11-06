import type { CampaignInput, Company, Contact, Dataset, Draft, Lead, Qualification, ReviewStatus, ScoreFactor, Tone } from "./types";

export const SAMPLE_CAMPAIGN: CampaignInput = {
  name: "Saudi Logistics Prospecting",
  industry: "Logistics and Supply Chain",
  country: "Saudi Arabia",
  cities: ["Riyadh", "Jeddah", "Dammam"],
  sizeLabel: "Mid-market (50–500)",
  employeeMin: 50,
  employeeMax: 500,
  revenueMin: 5,
  revenueMax: 100,
  positions: ["Chief Operating Officer", "Operations Director", "Supply Chain Director", "Fleet Manager"],
  icp: "Mid-sized Saudi logistics and freight companies running their own fleets (50+ vehicles), still relying on manual route planning or spreadsheets, and growing into new cities.",
  offering: "FleetFlow — a fictional fleet and logistics workflow optimization software that automates route planning, dispatch and driver scheduling.",
  objective: "Book discovery meetings",
};

export function qualificationFor(score: number): Qualification {
  if (score >= 70) return "Qualified";
  if (score >= 50) return "Needs review";
  return "Not qualified";
}

const norm = (s: string) => s.trim().toLowerCase();

export function positionMatch(title: string, positions: string[]): number {
  const t = norm(title);
  if (positions.some((p) => norm(p) === t)) return 1;
  if (positions.some((p) => t.includes(norm(p)) || norm(p).includes(t))) return 0.85;
  const words = new Set(t.split(/\s+/).filter((w) => w.length > 3));
  if (positions.some((p) => norm(p).split(/\s+/).some((w) => words.has(w)))) return 0.45;
  return 0.1;
}

/** Explainable 0–100 score. Weights: industry 20, location 20, size 25, position 20, signals 10, timing 5. */
export function scoreLead(c: CampaignInput, company: Company, contact: Contact): { score: number; factors: ScoreFactor[] } {
  const industryOk = norm(c.industry) === norm(company.industry);
  const countryOk = norm(c.country) === norm(company.country);
  const cityOk = c.cities.length === 0 ? countryOk : c.cities.some((x) => norm(x) === norm(company.city));
  const sizeOk = company.employees >= c.employeeMin && company.employees <= c.employeeMax;
  const revOk = c.revenueMax <= 0 || (company.revenueM >= c.revenueMin && company.revenueM <= c.revenueMax);
  const pos = positionMatch(contact.title, c.positions);
  const freshest = company.signals.length ? Math.min(...company.signals.map((s) => s.daysAgo)) : 999;
  const newInRole = contact.tenureMonths <= 9;

  const mk = (key: ScoreFactor["key"], label: string, weight: number, value: number, reason: string): ScoreFactor => ({
    key, label, weight, value: Math.round(value * 100) / 100, points: Math.round(value * weight), reason,
  });
  const factors: ScoreFactor[] = [
    mk("industry", "Industry match", 20, industryOk ? 1 : 0, industryOk ? `${company.industry} matches the target industry` : `${company.industry} is outside the target industry`),
    mk("location", "Location match", 20, (countryOk ? 0.5 : 0) + (cityOk && countryOk ? 0.5 : 0),
      countryOk ? (cityOk ? `${company.city}, ${company.country} is a target location` : `${company.city} is in ${company.country} but not a target city`) : `${company.country} is not the target country`),
    mk("size", "Size & revenue fit", 25, (sizeOk ? 0.7 : 0) + (revOk ? 0.3 : 0),
      `${company.employees.toLocaleString("en-US")} employees ${sizeOk ? "within" : "outside"} ${c.employeeMin}–${c.employeeMax} · ~$${company.revenueM}M revenue ${revOk ? "in range" : "out of range"}`),
    mk("position", "Decision-maker match", 20, pos,
      pos >= 0.85 ? `${contact.title} is a target position` : pos >= 0.45 ? `${contact.title} is adjacent to the target positions` : `${contact.title} is not a target position`),
    mk("signals", "Buying signals", 10, Math.min(1, company.signals.length * 0.4),
      company.signals.length ? company.signals.map((s) => `${s.type}: ${s.detail}`).join(" · ") : "No recent buying signals"),
    mk("timing", "Timing", 5, Math.min(1, (freshest <= 45 ? 0.6 : freshest <= 90 ? 0.4 : 0.1) + (newInRole ? 0.4 : 0)),
      `${freshest < 999 ? `Latest signal ${freshest} days ago` : "No dated signals"}${newInRole ? ` · new in role (${contact.tenureMonths} months)` : ""}`),
  ];
  const score = Math.max(0, Math.min(100, factors.reduce((a, f) => a + f.points, 0)));
  return { score, factors };
}

export function selectionReasons(lead: Lead): { positives: string[]; concerns: string[] } {
  return {
    positives: lead.factors.filter((f) => f.value >= 0.7).map((f) => f.reason),
    concerns: lead.factors.filter((f) => f.value < 0.45).map((f) => f.reason),
  };
}

export function qualificationExplanation(lead: Lead): string {
  const top = [...lead.factors].sort((a, b) => b.points - a.points).slice(0, 2).map((f) => f.label.toLowerCase());
  if (lead.qualification === "Qualified") return `Scored ${lead.score}/100 (70+ qualifies). Strongest drivers: ${top.join(" and ")}.`;
  if (lead.qualification === "Needs review") return `Scored ${lead.score}/100, between 50 and 69. Partial fit — a human should confirm before outreach.`;
  return `Scored ${lead.score}/100, below the 50-point threshold. The prospect does not match enough of the campaign criteria.`;
}

export function nextAction(lead: Pick<Lead, "qualification" | "review" | "factors">): { title: string; detail: string } {
  if (lead.review === "Rejected") return { title: "No further action", detail: "This prospect was rejected and is excluded from outreach." };
  if (lead.qualification === "Qualified") {
    if (lead.review === "Approved") return { title: "Send personalised intro", detail: "Open Outreach, review the generated draft and copy it to your email client." };
    return { title: "Approve and send a personalised intro", detail: "Strong fit. Approve the lead, then use the generated draft in Outreach." };
  }
  if (lead.qualification === "Needs review") {
    const weakSignals = (lead.factors.find((f) => f.key === "signals")?.value ?? 0) < 0.4;
    return weakSignals
      ? { title: "Save for nurture", detail: "Partial fit with weak signals. Save it and re-check in 30 days." }
      : { title: "Review fit manually", detail: "Confirm role and company fit, then approve or reject." };
  }
  return { title: "Hold for 30 days", detail: "Low fit today. Re-check later for new buying signals or a role change." };
}

export interface RunResult {
  leads: Lead[];
  stats: { companies: number; discovered: number; qualified: number; review: number; drafts: number };
}

/** Discover → identify → enrich → score. Deterministic for a given campaign definition. */
export function runPipeline(campaignId: string, c: CampaignInput, data: Dataset): RunResult {
  const candidates = data.companies.filter((co) => norm(co.industry) === norm(c.industry) || norm(co.country) === norm(c.country));
  const ids = new Set(candidates.map((x) => x.id));
  const byId = new Map(data.companies.map((x) => [x.id, x]));
  const contacts = data.contacts.filter((ct) => ids.has(ct.companyId));
  const leads: Lead[] = contacts
    .map((ct) => {
      const { score, factors } = scoreLead(c, byId.get(ct.companyId)!, ct);
      return {
        id: `${campaignId}__${ct.id}`,
        campaignId,
        contactId: ct.id,
        companyId: ct.companyId,
        score,
        qualification: qualificationFor(score),
        review: "Pending" as ReviewStatus,
        factors,
      };
    })
    .sort((a, b) => b.score - a.score || a.contactId.localeCompare(b.contactId));
  const qualified = leads.filter((l) => l.qualification === "Qualified").length;
  return {
    leads,
    stats: {
      companies: candidates.length,
      discovered: leads.length,
      qualified,
      review: leads.filter((l) => l.qualification === "Needs review").length,
      drafts: qualified,
    },
  };
}

const OPENERS: Record<Tone, string[]> = {
  formal: ["I hope this message finds you well.", "I am writing regarding {company}'s operations in {city}."],
  concise: ["Quick note, {first}.", "One idea for {company}."],
  friendly: ["Hope your week is going well!", "I've been following {company}'s growth in {city} with interest."],
};

export function generateDraft(lead: Lead, company: Company, contact: Contact, campaign: CampaignInput, tone: Tone, variant = 0): Omit<Draft, "savedAt"> {
  const first = contact.name.split(" ")[0] ?? contact.name;
  const signal = company.signals[0];
  const product = campaign.offering.split(/ — | - /)[0]?.trim() || "our solution";
  const opener = (OPENERS[tone][variant % 2] ?? "").replace("{company}", company.name).replace("{city}", company.city).replace("{first}", first);
  const hook = signal ? `I noticed ${company.name} ${signal.detail}.` : `Teams like yours at ${company.name} are under pressure to move more freight with the same resources.`;
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
    `${opener} ${hook}`,
    "",
    `As ${contact.title}, you are likely focused on keeping operations efficient as ${company.name} grows across ${company.country}. ${campaign.offering}`,
    "",
    `Companies of a similar size (${company.employees.toLocaleString("en-US")} employees) typically use it to cut planning time and improve on-time delivery.`,
    "",
    ask,
    "",
    tone === "formal" ? "Kind regards," : "Best regards,",
    "Maya Chen",
    "Head of Growth (demo persona)",
  ].join("\n");
  return { leadId: lead.id, tone, variant, subject: subjects[tone][variant % 2] ?? `Idea for ${company.name}`, body };
}
