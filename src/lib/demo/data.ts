import { DATA_SOURCE, type Company, type Contact, type Dataset, type PresetScore, type Seniority } from "./types";

export const INDUSTRIES = [
  "Logistics and Supply Chain",
  "Manufacturing",
  "Retail and E-commerce",
  "Construction",
  "Fintech",
  "Healthcare",
];

export const COUNTRIES: Record<string, string[]> = {
  "Saudi Arabia": ["Riyadh", "Jeddah", "Dammam", "Khobar", "Mecca", "Medina", "Tabuk"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
  Qatar: ["Doha"],
  Egypt: ["Cairo", "Alexandria"],
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
  "Warehouse Manager",
  "Procurement Manager",
  "Chief Executive Officer",
];

export const OBJECTIVES = [
  "Book discovery meetings",
  "Generate qualified pipeline",
  "Drive product demo requests",
  "Find channel partners",
];

export function sizeCategory(employees: number) {
  if (employees < 50) return "Small (under 50)";
  if (employees <= 500) return "Mid-market (50–500)";
  return "Upper mid-market (500+)";
}

interface Row {
  prospectId: string;
  name: string;
  slug: string;
  sector: string;
  city: string;
  employees: number;
  revenueM: number;
  founded: number;
  description: string;
  contextNote: string;
  person: string;
  title: string;
  seniority: Seniority;
  tenureMonths: number;
  preset: PresetScore;
}

const ROWS: Row[] = [
  {
    prospectId: "PX-001", name: "DuneBridge Logistics", slug: "dunebridgelogistics", sector: "Logistics", city: "Riyadh", employees: 240, revenueM: 38, founded: 2009,
    description: "Fictional third-party logistics provider running a 90-vehicle fleet for retail and FMCG clients across central Saudi Arabia.",
    contextNote: "is expanding last-mile delivery coverage across Riyadh",
    person: "Faisal Al-Harbi", title: "Chief Operating Officer", seniority: "C-Level", tenureMonths: 7,
    preset: { industry: 30, geography: 20, size: 18, decisionMaker: 28,
      explanation: "Core logistics operator in a target city, well inside the 50–500 employee range, with the COO as the primary operations decision-maker.",
      nextAction: { title: "Book discovery call with COO", detail: "Approve the lead and send the personalised intro focused on route planning efficiency." } },
  },
  {
    prospectId: "PX-002", name: "PalmRoute Distribution", slug: "palmroutedistribution", sector: "Distribution", city: "Jeddah", employees: 180, revenueM: 27, founded: 2012,
    description: "Fictional regional distributor moving food and consumer goods from Jeddah port to retailers in the western region.",
    contextNote: "is adding a second distribution shift to handle port volumes",
    person: "Noura Al-Qahtani", title: "Operations Director", seniority: "Director", tenureMonths: 22,
    preset: { industry: 28, geography: 20, size: 18, decisionMaker: 27,
      explanation: "Distribution company in Jeddah with an ideal size and an Operations Director who owns dispatch and fleet workflows.",
      nextAction: { title: "Book discovery call with Operations Director", detail: "Approve and send an intro about dispatch scheduling across shifts." } },
  },
  {
    prospectId: "PX-003", name: "CedarLine Freight", slug: "cedarlinefreight", sector: "Freight", city: "Dammam", employees: 320, revenueM: 52, founded: 2006,
    description: "Fictional freight forwarder serving industrial and petrochemical customers from the Eastern Province.",
    contextNote: "is consolidating freight planning across its Dammam and Jubail yards",
    person: "Khalid Al-Dossary", title: "Supply Chain Director", seniority: "Director", tenureMonths: 15,
    preset: { industry: 27, geography: 20, size: 16, decisionMaker: 27,
      explanation: "Freight operator in Dammam within the size range; the Supply Chain Director is a named target position.",
      nextAction: { title: "Book discovery call with Supply Chain Director", detail: "Approve and lead with multi-site planning visibility." } },
  },
  {
    prospectId: "PX-004", name: "WadiFlow Warehousing", slug: "wadiflowwarehousing", sector: "Warehousing", city: "Riyadh", employees: 140, revenueM: 19, founded: 2015,
    description: "Fictional contract warehousing company operating three bonded warehouses with outbound delivery services.",
    contextNote: "is linking warehouse dispatch with its own delivery vans",
    person: "Reem Al-Shehri", title: "Operations Director", seniority: "Director", tenureMonths: 30,
    preset: { industry: 25, geography: 20, size: 17, decisionMaker: 25,
      explanation: "Warehousing operator with in-house delivery in Riyadh; strong location and size fit, slightly lower industry relevance than pure logistics.",
      nextAction: { title: "Send personalised intro", detail: "Approve and position the warehouse-to-delivery workflow use case." } },
  },
  {
    prospectId: "PX-005", name: "AtlasGate Transport", slug: "atlasgatetransport", sector: "Transportation", city: "Jeddah", employees: 410, revenueM: 61, founded: 2004,
    description: "Fictional road transport company running long-haul trucking between Jeddah, Riyadh and Dammam.",
    contextNote: "is modernising driver scheduling for its long-haul routes",
    person: "Turki Al-Mutairi", title: "Fleet Manager", seniority: "Manager", tenureMonths: 11,
    preset: { industry: 27, geography: 20, size: 14, decisionMaker: 23,
      explanation: "Large fleet in a target city; size is near the top of the range and the Fleet Manager influences but may not sign the purchase.",
      nextAction: { title: "Send intro to Fleet Manager", detail: "Approve, then ask to involve the operations leadership in a demo." } },
  },
  {
    prospectId: "PX-006", name: "RedDune Supply Chain", slug: "reddunesupplychain", sector: "Logistics", city: "Dammam", employees: 95, revenueM: 12, founded: 2017,
    description: "Fictional supply chain services firm managing inbound logistics for manufacturers in the Eastern Province.",
    contextNote: "recently took on two new manufacturing clients",
    person: "Lama Al-Ghamdi", title: "Supply Chain Director", seniority: "Director", tenureMonths: 5,
    preset: { industry: 26, geography: 20, size: 12, decisionMaker: 24,
      explanation: "Relevant supply chain operator in Dammam with a target-role contact; smaller size lowers the size suitability score.",
      nextAction: { title: "Send personalised intro", detail: "Approve and emphasise quick setup for a growing team." } },
  },
  {
    prospectId: "PX-007", name: "GulfSpan Cold Chain", slug: "gulfspancoldchain", sector: "Cold Chain", city: "Khobar", employees: 260, revenueM: 44, founded: 2011,
    description: "Fictional temperature-controlled logistics provider serving pharmacies and food retailers.",
    contextNote: "is extending refrigerated delivery to new Eastern Province routes",
    person: "Majed Al-Zahrani", title: "Chief Operating Officer", seniority: "C-Level", tenureMonths: 19,
    preset: { industry: 24, geography: 14, size: 16, decisionMaker: 26,
      explanation: "Cold chain operator with a COO contact and good size; Khobar is near but outside the three target cities.",
      nextAction: { title: "Book discovery call with COO", detail: "Approve and tailor the message to cold chain route compliance." } },
  },
  {
    prospectId: "PX-008", name: "NexaCargo Arabia", slug: "nexacargoarabia", sector: "Freight", city: "Riyadh", employees: 480, revenueM: 73, founded: 2008,
    description: "Fictional cargo and courier company with a mixed fleet of vans and heavy trucks.",
    contextNote: "is reviewing how it plans daily courier routes",
    person: "Hessa Al-Otaibi", title: "Fleet Manager", seniority: "Manager", tenureMonths: 40,
    preset: { industry: 25, geography: 20, size: 12, decisionMaker: 21,
      explanation: "Relevant cargo operator in Riyadh at the upper edge of the size range; Fleet Manager is a target role with partial buying authority.",
      nextAction: { title: "Send intro to Fleet Manager", detail: "Approve and offer a short route-planning walkthrough." } },
  },
  {
    prospectId: "PX-009", name: "Sandstone Distribution", slug: "sandstonedistribution", sector: "Distribution", city: "Mecca", employees: 120, revenueM: 15, founded: 2014,
    description: "Fictional distributor supplying hospitality and retail businesses in the Mecca region.",
    contextNote: "handles seasonal peaks during pilgrimage periods",
    person: "Omar Al-Subaie", title: "Logistics Manager", seniority: "Manager", tenureMonths: 26,
    preset: { industry: 22, geography: 12, size: 16, decisionMaker: 22,
      explanation: "Good size and relevant sector, but Mecca is outside the target cities and Logistics Manager is adjacent to, not one of, the target roles.",
      nextAction: { title: "Confirm decision authority before outreach", detail: "Check who owns fleet decisions, then approve or save for later." } },
  },
  {
    prospectId: "PX-010", name: "RouteCraft Logistics", slug: "routecraftlogistics", sector: "Logistics", city: "Jeddah", employees: 650, revenueM: 96, founded: 2001,
    description: "Fictional integrated logistics group with warehousing, freight and customs brokerage units.",
    contextNote: "runs a central procurement process for operational software",
    person: "Dana Al-Anazi", title: "Procurement Manager", seniority: "Manager", tenureMonths: 14,
    preset: { industry: 26, geography: 20, size: 8, decisionMaker: 14,
      explanation: "Relevant and in a target city, but above the 500-employee limit and the contact is in procurement rather than operations.",
      nextAction: { title: "Find an operations contact", detail: "Review manually; identify a COO or Operations Director before outreach." } },
  },
  {
    prospectId: "PX-011", name: "Saffron Peak Warehousing", slug: "saffronpeakwarehousing", sector: "Warehousing", city: "Medina", employees: 70, revenueM: 8, founded: 2018,
    description: "Fictional storage and fulfilment provider for e-commerce sellers in Medina.",
    contextNote: "is starting to offer same-day local deliveries",
    person: "Yazeed Al-Shammari", title: "Warehouse Manager", seniority: "Manager", tenureMonths: 9,
    preset: { industry: 20, geography: 10, size: 14, decisionMaker: 20,
      explanation: "Small warehousing operator outside the target cities; the Warehouse Manager has limited influence over fleet software.",
      nextAction: { title: "Save for nurture", detail: "Save the lead and revisit when its delivery operation grows." } },
  },
  {
    prospectId: "PX-012", name: "HarborNest Freight", slug: "harbornestfreight", sector: "Freight", city: "Tabuk", employees: 35, revenueM: 4, founded: 2020,
    description: "Fictional small freight agent arranging subcontracted trucking in the north-west.",
    contextNote: "subcontracts most of its trucking to third parties",
    person: "Maha Al-Malki", title: "Finance Manager", seniority: "Manager", tenureMonths: 33,
    preset: { industry: 18, geography: 8, size: 6, decisionMaker: 20,
      explanation: "Below the size range, outside the target cities, does not run its own fleet, and the contact is not an operations decision-maker.",
      nextAction: { title: "Do not contact now; revisit in 90 days", detail: "Low fit for fleet software today." } },
  },
];

let cached: Dataset | null = null;

/** The fixed 12-record Synthetic Demo Dataset. No randomness. */
export function getDataset(): Dataset {
  if (cached) return cached;
  const companies: Company[] = [];
  const contacts: Contact[] = [];
  ROWS.forEach((r, i) => {
    const id = `co-${String(i + 1).padStart(2, "0")}`;
    const domain = `${r.slug}.example`;
    companies.push({
      id, prospectId: r.prospectId, name: r.name, website: `www.${domain}`, sector: r.sector, industry: "Logistics and Supply Chain",
      employees: r.employees, sizeCategory: sizeCategory(r.employees), revenueM: r.revenueM, country: "Saudi Arabia", city: r.city,
      founded: r.founded, description: r.description, contextNote: r.contextNote, source: DATA_SOURCE, preset: r.preset,
    });
    const [first = "", ...rest] = r.person.split(" ");
    const last = rest.join("").toLowerCase().replace(/[^a-z]/g, "");
    contacts.push({
      id: `ct-${String(i + 1).padStart(2, "0")}`, companyId: id, name: r.person, title: r.title, seniority: r.seniority,
      department: /finance|procurement/i.test(r.title) ? "Finance" : "Operations", tenureMonths: r.tenureMonths,
      email: `${first.toLowerCase()}.${last}@${domain}`,
      summary: `Fictional ${r.title} at ${r.name} (${r.city}), ${r.tenureMonths} months in role.`,
    });
  });
  cached = { companies, contacts };
  return cached;
}
