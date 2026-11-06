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
  "Logistics and Supply Chain",
  "Manufacturing",
  "Retail and E-commerce",
  "Construction",
  "Fintech",
  "Healthcare",
  "Cybersecurity",
  "Education",
];

export const COUNTRIES: Record<string, string[]> = {
  "Saudi Arabia": ["Riyadh", "Jeddah", "Dammam", "Khobar", "Mecca"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
  Qatar: ["Doha"],
  Egypt: ["Cairo", "Alexandria"],
  "United Kingdom": ["London", "Manchester"],
  Germany: ["Berlin", "Hamburg"],
  "United States": ["Austin", "Chicago"],
};

export const SIZE_PRESETS: { label: string; min: number; max: number }[] = [
  { label: "Small (1–50)", min: 1, max: 50 },
  { label: "Mid-market (50–500)", min: 50, max: 500 },
  { label: "Upper mid-market (500–2,000)", min: 500, max: 2000 },
  { label: "Enterprise (2,000+)", min: 2000, max: 20000 },
];

export const POSITION_SUGGESTIONS = [
  "Chief Operating Officer",
  "Operations Director",
  "Supply Chain Director",
  "Fleet Manager",
  "Logistics Manager",
  "Chief Executive Officer",
  "Chief Financial Officer",
  "Procurement Manager",
  "IT Director",
  "Sales Director",
];

export const OBJECTIVES = [
  "Book discovery meetings",
  "Generate qualified pipeline",
  "Drive product demo requests",
  "Find channel partners",
];

export const SIGNAL_TYPES: SignalType[] = ["Hiring", "Funding", "Expansion", "New executive", "Tech change"];

const TITLE_META: Record<string, { seniority: Seniority; department: string }> = {
  "Chief Executive Officer": { seniority: "C-Level", department: "Executive" },
  "Chief Operating Officer": { seniority: "C-Level", department: "Operations" },
  "Chief Financial Officer": { seniority: "C-Level", department: "Finance" },
  "Operations Director": { seniority: "Director", department: "Operations" },
  "Supply Chain Director": { seniority: "Director", department: "Operations" },
  "Fleet Manager": { seniority: "Manager", department: "Operations" },
  "Logistics Manager": { seniority: "Manager", department: "Operations" },
  "Procurement Manager": { seniority: "Manager", department: "Finance" },
  "IT Director": { seniority: "Director", department: "Technology" },
  "Sales Director": { seniority: "Director", department: "Sales" },
  "HR Manager": { seniority: "Manager", department: "People" },
  "Marketing Manager": { seniority: "Manager", department: "Marketing" },
  "Business Analyst": { seniority: "Individual", department: "Operations" },
};
const LOGISTICS_TITLES = ["Chief Operating Officer", "Operations Director", "Supply Chain Director", "Fleet Manager", "Logistics Manager", "Chief Financial Officer", "Procurement Manager", "IT Director", "HR Manager", "Chief Executive Officer"];
const GENERAL_TITLES = Object.keys(TITLE_META);

const SA_PREFIX = ["Najd", "Tihama", "Qafilah", "Marsa", "Wadi", "Fanar", "Hijaz", "Durrah", "Sarab", "Nakheel", "Raha", "Sahm", "Bayan", "Masar", "Thuraya", "Afaq", "Jazl", "Nawaf", "Sadeem", "Rimal"];
const SA_SUFFIX = ["Logistics", "Freight", "Transport", "Fleet Services", "Cargo", "Supply Chain Co."];
const GEN_PREFIX = ["Nova", "Helix", "Brightline", "Cobalt", "Lumen", "Quarry", "Atlas", "Verity", "Kestrel", "Orbit", "Tidal", "Summit", "Ember", "Granite", "Harbor", "Prism", "Sable", "Vantage", "Willow", "Zenith"];
const GEN_SUFFIX: Record<string, string[]> = {
  "Logistics and Supply Chain": ["Freight", "Logistics", "Cargo"],
  Manufacturing: ["Industries", "Works", "Fabrication"],
  "Retail and E-commerce": ["Commerce", "Retail", "Market"],
  Construction: ["Builders", "Contracting", "Construct"],
  Fintech: ["Pay", "Capital", "Ledger"],
  Healthcare: ["Health", "Care", "Medical"],
  Cybersecurity: ["Shield", "Secure", "Guard"],
  Education: ["Learning", "Academy", "Edu"],
};
const AR_FIRST = ["Faisal", "Noura", "Abdullah", "Reem", "Khalid", "Sara", "Turki", "Lama", "Majed", "Hessa", "Omar", "Dana", "Yazeed", "Maha", "Saad", "Alanoud", "Fahad", "Jawaher", "Nasser", "Rawan"];
const AR_LAST = ["Al-Harbi", "Al-Qahtani", "Al-Mutairi", "Al-Dossary", "Al-Shehri", "Al-Ghamdi", "Al-Zahrani", "Al-Otaibi", "Al-Subaie", "Al-Anazi", "Al-Shammari", "Al-Malki"];
const EN_FIRST = ["Daniel", "Sofia", "Elena", "James", "Marcus", "Priya", "Lucas", "Hannah", "Kenji", "Oliver", "Mateo", "Grace", "Clara", "Amira", "Leila", "Noah"];
const EN_LAST = ["Fischer", "Okafor", "Lindqvist", "Moreau", "Tanaka", "Costa", "Novak", "Brennan", "Kowalski", "Reyes", "Iyer", "Walsh", "Berg", "Haddad"];
const TECH = ["SAP", "Oracle", "Salesforce", "Microsoft Dynamics", "Odoo", "AWS", "Azure", "HubSpot", "Power BI", "Excel-based planning"];
const FUNDING = ["Bootstrapped", "Family-owned", "Series A", "Series B", "Private equity", "Public"];
const SIGNAL_DETAIL: Record<SignalType, string[]> = {
  Hiring: ["is hiring 8 fleet coordinators", "opened 5 operations roles", "is expanding its dispatch team"],
  Funding: ["raised new growth financing", "closed a SAR 60M funding round", "secured investment for fleet expansion"],
  Expansion: ["opened a new distribution centre", "launched a new regional hub", "added 120 vehicles to its fleet"],
  "New executive": ["appointed a new COO", "hired a new Supply Chain Director", "named a new CEO"],
  "Tech change": ["is replacing manual route planning", "announced an ERP migration", "started a digital transformation programme"],
};

const pick = <T,>(r: () => number, arr: T[]): T => arr[Math.floor(r() * arr.length)]!;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

let cached: Dataset | null = null;

/** Deterministic synthetic dataset. Built lazily (never at module scope). */
export function getDataset(): Dataset {
  if (cached) return cached;
  const r = mulberry32(20261107);
  const companies: Company[] = [];
  const contacts: Contact[] = [];
  const usedNames = new Set<string>();
  const usedPeople = new Set<string>();

  const addCompany = (opts: { saudiLogistics: boolean }) => {
    let name = "";
    for (let k = 0; k < 50 && (!name || usedNames.has(name)); k++) {
      if (opts.saudiLogistics) name = `${pick(r, SA_PREFIX)} ${pick(r, SA_SUFFIX)}`;
      else name = "";
    }
    let industry: string;
    let country: string;
    let city: string;
    if (opts.saudiLogistics) {
      industry = "Logistics and Supply Chain";
      country = "Saudi Arabia";
      const roll = r();
      city = roll < 0.4 ? "Riyadh" : roll < 0.7 ? "Jeddah" : roll < 0.9 ? "Dammam" : "Khobar";
    } else {
      industry = pick(r, INDUSTRIES);
      country = pick(r, Object.keys(COUNTRIES));
      city = pick(r, COUNTRIES[country]!);
      for (let k = 0; k < 50 && (!name || usedNames.has(name)); k++) name = `${pick(r, GEN_PREFIX)} ${pick(r, GEN_SUFFIX[industry]!)}`;
    }
    if (usedNames.has(name)) return;
    usedNames.add(name);
    const employees = opts.saudiLogistics ? Math.round(25 + Math.pow(r(), 1.3) * 900) : Math.round(15 + Math.pow(r(), 1.6) * 4000);
    const revenueM = Math.max(1, Math.round(employees * (0.08 + r() * 0.12)));
    const signals: Signal[] = [];
    const nSignals = Math.floor(r() * 4);
    for (let s = 0; s < nSignals; s++) {
      const type = pick(r, SIGNAL_TYPES);
      if (signals.some((x) => x.type === type)) continue;
      signals.push({ type, detail: pick(r, SIGNAL_DETAIL[type]), daysAgo: 3 + Math.floor(r() * 150) });
    }
    const id = `co-${String(companies.length + 1).padStart(3, "0")}`;
    const domain = `${slug(name)}.example`;
    companies.push({
      id,
      name,
      website: `https://www.${domain}`,
      industry,
      employees,
      revenueM,
      country,
      city,
      techStack: Array.from(new Set([pick(r, TECH), pick(r, TECH)])),
      fundingStage: pick(r, FUNDING),
      founded: 1985 + Math.floor(r() * 37),
      signals,
      description:
        industry === "Logistics and Supply Chain"
          ? `${name} is a fictional ${city}-based logistics provider operating ${Math.round(employees / 4)} vehicles across ${country}, serving retail, FMCG and industrial clients.`
          : `${name} is a fictional ${industry.toLowerCase()} company headquartered in ${city}, ${country}.`,
    });
    const arabic = country === "Saudi Arabia" || country === "United Arab Emirates" || country === "Qatar" || country === "Egypt";
    const titles = industry === "Logistics and Supply Chain" ? LOGISTICS_TITLES : GENERAL_TITLES;
    const nContacts = 2 + Math.floor(r() * 2);
    const usedTitles = new Set<string>();
    for (let c = 0; c < nContacts; c++) {
      const title = pick(r, titles);
      if (usedTitles.has(title)) continue;
      usedTitles.add(title);
      let first = "";
      let last = "";
      for (let k = 0; k < 20 && (!first || usedPeople.has(`${first} ${last}`)); k++) {
        first = pick(r, arabic ? AR_FIRST : EN_FIRST);
        last = pick(r, arabic ? AR_LAST : EN_LAST);
      }
      usedPeople.add(`${first} ${last}`);
      const meta = TITLE_META[title]!;
      const tenureMonths = 1 + Math.floor(r() * 72);
      contacts.push({
        id: `ct-${String(contacts.length + 1).padStart(3, "0")}`,
        companyId: id,
        name: `${first} ${last}`,
        title,
        seniority: meta.seniority,
        department: meta.department,
        tenureMonths,
        email: `${first.toLowerCase()}.${slug(last)}@${domain}`,
        summary: `${title} at ${name} for ${tenureMonths} months, responsible for ${meta.department.toLowerCase()} performance in ${city}.`,
      });
    }
  };

  for (let i = 0; i < 42; i++) addCompany({ saudiLogistics: true });
  for (let i = 0; i < 110; i++) addCompany({ saudiLogistics: false });
  cached = { companies, contacts };
  return cached;
}
