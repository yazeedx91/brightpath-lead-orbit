import { DEPARTMENTS, INDUSTRIES, REGIONS, SENIORITIES, SIGNAL_TYPES, mulberry32 } from "./data";
import type { Company, Contact, Dataset, Draft, ICP, Lead, LeadStatus, ScoreFactor, Seniority, Tier, Tone } from "./types";

export function tierFor(score: number): Tier {
  if (score >= 80) return "Hot";
  if (score >= 60) return "Warm";
  return "Cold";
}

const SENIORITY_VALUE: Record<Seniority, number> = {
  "C-Level": 1,
  VP: 0.9,
  Director: 0.75,
  Manager: 0.45,
  Individual: 0.2,
};

/** Explainable 0–100 score. Weights: fit 35, intent 30, seniority 20, timing 15. */
export function scoreLead(icp: ICP, company: Company, contact: Contact): { score: number; factors: ScoreFactor[] } {
  const industryOk = icp.industries.length === 0 || icp.industries.includes(company.industry);
  const regionOk = icp.regions.length === 0 || icp.regions.includes(company.region);
  const sizeOk = company.employees >= icp.employeeMin && company.employees <= icp.employeeMax;
  const fitValue = (industryOk ? 0.45 : 0) + (sizeOk ? 0.35 : 0) + (regionOk ? 0.2 : 0);

  const wanted = icp.signals.length ? icp.signals : SIGNAL_TYPES;
  const matching = company.signals.filter((s) => wanted.includes(s.type));
  const intentValue = Math.min(1, matching.length * 0.6 + (company.signals.length - matching.length) * 0.25);

  const senMatch = icp.seniority.length === 0 || icp.seniority.includes(contact.seniority);
  const deptMatch = icp.departments.length === 0 || icp.departments.includes(contact.department);
  const seniorityValue = SENIORITY_VALUE[contact.seniority] * (senMatch ? 1 : 0.6) * (deptMatch ? 1 : 0.75);

  const freshest = company.signals.length ? Math.min(...company.signals.map((s) => s.daysAgo)) : 365;
  const newInRole = contact.tenureMonths <= 9;
  const timingValue = Math.min(1, (freshest <= 45 ? 0.7 : freshest <= 90 ? 0.5 : 0.2) + (newInRole ? 0.4 : 0.15));

  const mk = (key: ScoreFactor["key"], label: string, weight: number, value: number, reason: string): ScoreFactor => ({
    key, label, weight, value: Math.round(value * 100) / 100, points: Math.round(value * weight), reason,
  });

  const factors: ScoreFactor[] = [
    mk("fit", "ICP fit", 35, fitValue, [
      industryOk ? `${company.industry} is a target industry` : `${company.industry} is outside target industries`,
      sizeOk ? `${company.employees.toLocaleString()} employees is within range` : `${company.employees.toLocaleString()} employees is outside range`,
      regionOk ? `${company.region} is a target region` : `${company.region} is not targeted`,
    ].join(" · ")),
    mk("intent", "Buying signals", 30, intentValue, matching.length
      ? matching.map((s) => `${s.type}: ${s.detail}`).join(" · ")
      : company.signals.length ? "Only weak or non-targeted signals detected" : "No recent buying signals detected"),
    mk("seniority", "Decision authority", 20, seniorityValue, `${contact.seniority} in ${contact.department}${senMatch ? "" : " (below target seniority)"}${deptMatch ? "" : " (non-target department)"}`),
    mk("timing", "Timing", 15, timingValue, `${freshest < 365 ? `Latest signal ${freshest} days ago` : "No dated signals"}${newInRole ? ` · in role ${contact.tenureMonths} months (new leaders buy)` : ""}`),
  ];
  const score = Math.max(0, Math.min(100, factors.reduce((a, f) => a + f.points, 0)));
  return { score, factors };
}

export function improvementTips(factors: ScoreFactor[]): string[] {
  return factors
    .filter((f) => f.value < 0.7)
    .map((f) =>
      f.key === "fit" ? "Broaden the ICP size range or regions to strengthen fit"
      : f.key === "intent" ? "A new funding, hiring or expansion signal would raise intent"
      : f.key === "seniority" ? "Engage a more senior stakeholder at this account"
      : "Re-check in 30 days for fresher signals"
    );
}

export function filterCompanies(icp: ICP, companies: Company[]): Company[] {
  const ex = icp.exclusions.map((e) => e.trim().toLowerCase()).filter(Boolean);
  return companies.filter((c) => {
    if (ex.some((e) => c.name.toLowerCase().includes(e) || c.industry.toLowerCase() === e)) return false;
    const industryOk = icp.industries.length === 0 || icp.industries.includes(c.industry);
    const regionOk = icp.regions.length === 0 || icp.regions.includes(c.region);
    return industryOk || regionOk;
  });
}

export interface RunResult {
  leads: Lead[];
  stats: { scanned: number; matched: number; contacts: number; qualified: number };
}

/** Run the full pipeline: discover → identify → enrich → score. Deterministic. */
export function runPipeline(campaignId: string, icp: ICP, data: Dataset, seed = 7): RunResult {
  const r = mulberry32(seed + campaignId.length * 31 + campaignId.charCodeAt(campaignId.length - 1));
  const matched = filterCompanies(icp, data.companies);
  const ids = new Set(matched.map((c) => c.id));
  const contacts = data.contacts.filter((c) => ids.has(c.companyId));
  const byId = new Map(data.companies.map((c) => [c.id, c]));
  const leads: Lead[] = contacts
    .map((ct) => {
      const co = byId.get(ct.companyId)!;
      const { score, factors } = scoreLead(icp, co, ct);
      return { ct, co, score, factors };
    })
    .filter((x) => x.score >= 45)
    .sort((a, b) => b.score - a.score)
    .map(({ ct, co, score, factors }) => ({
      id: `${campaignId}__${ct.id}`,
      campaignId,
      contactId: ct.id,
      companyId: co.id,
      score,
      tier: tierFor(score),
      factors,
      status: "qualified" as LeadStatus,
      discoveredDay: Math.floor(r() * 14),
    }));
  return {
    leads,
    stats: { scanned: data.companies.length * 12 + 37, matched: matched.length, contacts: contacts.length, qualified: leads.length },
  };
}

/** Turn a plain-language ICP description into structured criteria (keyword-based, deterministic). */
export function interpretICP(text: string): ICP {
  const t = text.toLowerCase();
  const industries = INDUSTRIES.filter((i) => t.includes(i.toLowerCase()) || (i === "Healthcare SaaS" && t.includes("health")) || (i === "E-commerce" && t.includes("ecommerce")) || (i === "Cybersecurity" && t.includes("security")));
  const regions = REGIONS.filter((r) => t.includes(r.toLowerCase()) || (r === "MENA" && /(middle east|gulf|saudi|uae)/.test(t)) || (r === "North America" && /(us|usa|canada)\b/.test(t)) || (r === "Europe" && /(eu|uk|european)\b/.test(t)) || (r === "APAC" && /(asia|australia|singapore)/.test(t)));
  const size = t.match(/(\d[\d,]*)\s*(?:-|–|to)\s*(\d[\d,]*)/);
  const employeeMin = size ? parseInt(size[1].replace(/,/g, ""), 10) : 50;
  const employeeMax = size ? parseInt(size[2].replace(/,/g, ""), 10) : 2000;
  const seniority = SENIORITIES.filter((s) =>
    (s === "C-Level" && /(c-level|chief|cxo|cro|coo)/.test(t)) ||
    (s === "VP" && /\bvps?\b|vice president/.test(t)) ||
    (s === "Director" && t.includes("director")) ||
    (s === "Manager" && t.includes("manager")));
  const departments = DEPARTMENTS.filter((d) => t.includes(d.toLowerCase()) || (d === "Revenue" && /(sales|revops)/.test(t)));
  const signals = SIGNAL_TYPES.filter((s) =>
    (s === "Hiring" && t.includes("hiring")) || (s === "Funding" && /(fund|raised|series)/.test(t)) ||
    (s === "Expansion" && t.includes("expan")) || (s === "New executive" && /(new exec|new leader|new cro|new vp)/.test(t)) ||
    (s === "Tech change" && /(migrat|crm change|tech change)/.test(t)));
  const exMatch = t.match(/exclud\w*\s+([^.]+)/);
  const exclusions = exMatch ? exMatch[1].split(/,|and/).map((s) => s.trim()).filter(Boolean) : [];
  return {
    description: text,
    industries,
    employeeMin,
    employeeMax,
    regions,
    seniority: seniority.length ? seniority : ["C-Level", "VP", "Director"],
    departments,
    signals,
    exclusions,
  };
}

const OPENERS: Record<Tone, string[]> = {
  formal: ["I hope this message finds you well.", "I am reaching out regarding a recent development at {company}."],
  concise: ["Quick note.", "Short one, {first}."],
  friendly: ["Hope your week is going great!", "Congrats on the recent news at {company}!"],
};

export function generateDraft(lead: Lead, company: Company, contact: Contact, tone: Tone, variant = 0): Draft {
  const first = contact.name.split(" ")[0];
  const signal = company.signals[0];
  const hook = signal ? `I noticed ${company.name} ${signal.detail}` : `I came across ${company.name}'s work in ${company.industry.toLowerCase()}`;
  const opener = OPENERS[tone][variant % 2].replace("{company}", company.name).replace("{first}", first);
  const value =
    contact.department === "Revenue" ? "teams like yours cut pipeline reporting time by 40%"
    : contact.department === "Marketing" ? "growth teams attribute pipeline to campaigns in real time"
    : contact.department === "Data" ? "data leaders unify revenue data without new engineering work"
    : "operations leaders get a single view of performance across regions";
  const cta =
    tone === "concise" ? "Worth a 15-minute call next week?"
    : tone === "formal" ? "Would you be open to a brief conversation next week to explore whether this is relevant?"
    : "Would you be up for a quick chat next week? Happy to share what's worked for similar teams.";
  const subjects: Record<Tone, string[]> = {
    formal: [`${company.name} and Northwind Analytics`, `Supporting ${company.name}'s next phase`],
    concise: [`Idea for ${company.name}`, `${first}, quick question`],
    friendly: [`Congrats, ${company.name} team`, `${first} — an idea for your team`],
  };
  const greeting = tone === "formal" ? `Dear ${first},` : `Hi ${first},`;
  const body = [
    greeting,
    "",
    opener,
    `${hook} — as ${contact.title}, scaling ${contact.department.toLowerCase()} likely sits close to your priorities.`,
    "",
    `At Northwind Analytics, we help ${value}. ${company.employees > 500 ? "Several companies of your size" : "Fast-growing teams"} in ${company.region} use us for exactly this.`,
    "",
    cta,
    "",
    tone === "formal" ? "Kind regards," : "Best,",
    "Maya Chen",
    "Head of Growth, Northwind Analytics",
  ].join("\n");
  return {
    leadId: lead.id,
    tone,
    variant,
    subject: subjects[tone][variant % 2],
    body,
    personalization: [
      `Name: ${first}`,
      `Role: ${contact.title}`,
      signal ? `Signal: ${signal.type}` : `Industry: ${company.industry}`,
      `Region: ${company.region}`,
    ],
    edited: false,
  };
}
