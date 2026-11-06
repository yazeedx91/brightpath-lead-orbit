import type { Company, Contact, Dataset, Seniority, Signal, SignalType } from "./types";

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const INDUSTRIES = [
  "Fintech",
  "Healthcare SaaS",
  "Logistics",
  "E-commerce",
  "Cybersecurity",
  "EdTech",
  "Manufacturing",
  "PropTech",
];
export const REGIONS = ["North America", "Europe", "MENA", "APAC"];
export const SENIORITIES: Seniority[] = ["C-Level", "VP", "Director", "Manager", "Individual"];
export const DEPARTMENTS = ["Revenue", "Marketing", "Operations", "Data", "Engineering", "Finance"];
export const SIGNAL_TYPES: SignalType[] = [
  "Hiring",
  "Funding",
  "Expansion",
  "New executive",
  "Tech change",
];

const CITIES: Record<string, string[]> = {
  "North America": ["Austin, US", "Toronto, CA", "Denver, US", "Boston, US"],
  Europe: ["Berlin, DE", "Amsterdam, NL", "Lisbon, PT", "Dublin, IE"],
  MENA: ["Riyadh, SA", "Dubai, AE", "Doha, QA", "Cairo, EG"],
  APAC: ["Singapore, SG", "Sydney, AU", "Bengaluru, IN", "Tokyo, JP"],
};
const PREFIX = ["Nova", "Helix", "Brightline", "Cobalt", "Lumen", "Quarry", "Atlas", "Verity", "Kestrel", "Orbit", "Tidal", "Summit", "Ember", "Granite", "Harbor", "Prism", "Sable", "Vantage", "Willow", "Zenith"];
const SUFFIX = ["Labs", "Systems", "Works", "Cloud", "Analytics", "Group", "Logic", "Health", "Pay", "Freight"];
const FIRST = ["Amira", "Daniel", "Sofia", "Omar", "Elena", "James", "Lina", "Marcus", "Priya", "Lucas", "Noor", "Hannah", "Kenji", "Fatima", "Oliver", "Leila", "Mateo", "Grace", "Yusuf", "Clara"];
const LAST = ["Haddad", "Fischer", "Okafor", "Lindqvist", "Moreau", "Tanaka", "Rahman", "Costa", "Novak", "Brennan", "Al-Sayed", "Kowalski", "Reyes", "Iyer", "Walsh", "Berg"];
const TECH = ["Salesforce", "HubSpot", "Snowflake", "AWS", "Segment", "Looker", "Stripe", "Zendesk", "dbt", "Azure"];
const FUNDING = ["Seed", "Series A", "Series B", "Series C", "Growth", "Public"];
const TITLES: Record<Seniority, string[]> = {
  "C-Level": ["Chief Revenue Officer", "Chief Operating Officer", "Chief Data Officer"],
  VP: ["VP of Sales", "VP of Marketing", "VP of Operations"],
  Director: ["Director of Revenue Operations", "Director of Growth", "Director of Analytics"],
  Manager: ["Sales Operations Manager", "Marketing Manager", "Data Manager"],
  Individual: ["Business Analyst", "Account Executive", "Data Engineer"],
};
const SIGNAL_DETAIL: Record<SignalType, string[]> = {
  Hiring: ["is hiring 6 sales roles", "opened 4 data analyst positions", "is scaling its RevOps team"],
  Funding: ["raised a $24M round", "closed a $40M Series B", "secured growth financing"],
  Expansion: ["opened a new regional office", "launched in two new markets", "announced a new product line"],
  "New executive": ["appointed a new CRO", "hired a new VP of Marketing", "named a new COO"],
  "Tech change": ["migrated to a new CRM", "adopted a cloud data warehouse", "is replacing legacy BI tools"],
};

const pick = <T,>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)]!;

let cached: Dataset | null = null;

/** Deterministic synthetic dataset. Built lazily (never at module scope). */
export function getDataset(): Dataset {
  if (cached) return cached;
  const r = mulberry32(20261107);
  const companies: Company[] = [];
  const contacts: Contact[] = [];
  const used = new Set<string>();
  const people = new Set<string>();
  for (let i = 0; companies.length < 120; i++) {
    let name = `${pick(r, PREFIX)} ${pick(r, SUFFIX)}`;
    if (used.has(name)) name = `${name} ${["Co", "Group", "Global"][i % 3]}`;
    if (used.has(name)) continue;
    used.add(name);
    const region = pick(r, REGIONS);
    const industry = INDUSTRIES[i % INDUSTRIES.length]!;
    const employees = Math.round(20 + Math.pow(r(), 1.6) * 4000);
    const nSignals = Math.floor(r() * 4);
    const signals: Signal[] = [];
    for (let s = 0; s < nSignals; s++) {
      const type = pick(r, SIGNAL_TYPES);
      if (signals.some((x) => x.type === type)) continue;
      signals.push({ type, detail: pick(r, SIGNAL_DETAIL[type]), daysAgo: 2 + Math.floor(r() * 120) });
    }
    const id = `co-${String(companies.length + 1).padStart(3, "0")}`;
    const slug = name.toLowerCase().replace(/[^a-z]+/g, "");
    companies.push({
      id,
      name,
      domain: `${slug}.example`,
      industry,
      employees,
      revenueBand: employees < 100 ? "$1–10M" : employees < 500 ? "$10–50M" : employees < 1500 ? "$50–200M" : "$200M+",
      hq: pick(r, CITIES[region]!),
      region,
      techStack: Array.from(new Set([pick(r, TECH), pick(r, TECH), pick(r, TECH)])),
      fundingStage: pick(r, FUNDING),
      signals,
      description: `${name} is a ${industry.toLowerCase()} company serving mid-market customers across ${region}.`,
    });
    const nContacts = 1 + Math.floor(r() * 3);
    for (let c = 0; c < nContacts; c++) {
      const seniority = pick(r, SENIORITIES);
      const first = pick(r, FIRST);
      let last = pick(r, LAST);
      for (let k = 0; people.has(`${first} ${last}`) && k < LAST.length; k++) last = LAST[(LAST.indexOf(last) + 1) % LAST.length]!;
      people.add(`${first} ${last}`);
      const title = pick(r, TITLES[seniority]);
      const department = title.includes("Sales") || title.includes("Revenue") || title.includes("Account") ? "Revenue" : title.includes("Marketing") || title.includes("Growth") ? "Marketing" : title.includes("Data") || title.includes("Analy") ? "Data" : "Operations";
      const tenureMonths = 1 + Math.floor(r() * 60);
      contacts.push({
        id: `ct-${String(contacts.length + 1).padStart(3, "0")}`,
        companyId: id,
        name: `${first} ${last}`,
        title,
        seniority,
        department,
        tenureMonths,
        email: `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, "")}@${slug}.example`,
        summary: `${title} at ${name} for ${tenureMonths} months. Focused on ${department.toLowerCase()} efficiency and predictable growth.`,
      });
    }
  }
  cached = { companies, contacts };
  return cached;
}
