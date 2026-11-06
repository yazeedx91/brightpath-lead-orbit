import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getDataset } from "./data";
import { SAMPLE_CAMPAIGN, generateDraft, runPipeline } from "./engine";
import type { ActivityEvent, Campaign, CampaignInput, Company, Contact, Draft, Lead, ReviewStatus, Tone } from "./types";

interface State {
  campaigns: Campaign[];
  leads: Lead[];
  drafts: Record<string, Draft>;
  events: ActivityEvent[];
  activeCampaignId: string | null;
  guideStep: number | null;
}

const STORAGE_KEY = "projectx-demo-v4";
export const SAMPLE_ID = "cmp-saudi-logistics";
const EMPTY_STATS = { discovered: 0, enriched: 0, qualified: 0, review: 0, lowFit: 0, drafts: 0 };

export function buildSeed(): State {
  const data = getDataset();
  const res = runPipeline(SAMPLE_ID, SAMPLE_CAMPAIGN, data);
  const leads = res.leads;
  const campaigns: Campaign[] = [
    { ...SAMPLE_CAMPAIGN, id: SAMPLE_ID, createdAt: "2026-11-02T09:15:00Z", status: "complete", isSample: true, stats: res.stats },
    {
      id: "cmp-uae-retail",
      name: "UAE Retail Distribution",
      industry: "Retail and E-commerce",
      country: "United Arab Emirates",
      cities: ["Dubai", "Abu Dhabi"],
      sizeLabel: "Upper mid-market (500–2,000)",
      employeeMin: 500,
      employeeMax: 2000,
      revenueMin: 20,
      revenueMax: 400,
      positions: ["Chief Operating Officer", "Supply Chain Director", "Logistics Manager"],
      icp: "Omnichannel retailers in the UAE managing their own last-mile delivery.",
      offering: "FleetFlow — a fictional fleet and logistics workflow optimization software.",
      objective: "Generate qualified pipeline",
      createdAt: "2026-11-04T11:40:00Z",
      status: "draft",
      isSample: false,
      stats: EMPTY_STATS,
    },
  ];
  const drafts: Record<string, Draft> = {};
  const events: ActivityEvent[] = [
    { id: "e4", at: "2026-11-04T11:40:00Z", kind: "campaign", message: "Draft campaign “UAE Retail Distribution” saved (not run)" },
    { id: "e3", at: "2026-11-02T09:18:00Z", kind: "agent", message: `Agent generated ${res.stats.drafts} outreach drafts for qualified prospects` },
    { id: "e2", at: "2026-11-02T09:17:00Z", kind: "agent", message: `Scored ${res.stats.discovered} prospects: ${res.stats.qualified} qualified, ${res.stats.review} review, ${res.stats.lowFit} low fit` },
    { id: "e1", at: "2026-11-02T09:15:00Z", kind: "campaign", message: "Sample campaign “Saudi Logistics Prospecting” loaded from the Synthetic Demo Dataset" },
  ];
  return { campaigns, leads, drafts, events, activeCampaignId: SAMPLE_ID, guideStep: null };
}

interface Store extends State {
  companies: Map<string, Company>;
  contacts: Map<string, Contact>;
  saveCampaign: (input: CampaignInput, id?: string) => string;
  runCampaign: (id: string) => void;
  completeCampaign: (id: string) => void;
  setReview: (leadIds: string[], review: ReviewStatus) => void;
  buildDraft: (leadId: string, tone: Tone, variant: number) => Omit<Draft, "savedAt"> | null;
  saveDraft: (draft: Omit<Draft, "savedAt">) => void;
  setGuideStep: (step: number | null) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);
const nowIso = () => new Date().toISOString();
let evSeq = 0;
const ev = (kind: ActivityEvent["kind"], message: string): ActivityEvent => ({ id: `ev-${Date.now().toString(36)}-${evSeq++}`, at: nowIso(), kind, message });

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => buildSeed());
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as State);
    } catch { /* ignore */ }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const { companies, contacts } = useMemo(() => {
    const d = getDataset();
    return { companies: new Map(d.companies.map((c) => [c.id, c])), contacts: new Map(d.contacts.map((c) => [c.id, c])) };
  }, []);

  const saveCampaign = useCallback((input: CampaignInput, id?: string) => {
    const cid = id ?? `cmp-${Date.now().toString(36)}`;
    setState((s) => {
      const existing = s.campaigns.find((c) => c.id === cid);
      const campaigns = existing
        ? s.campaigns.map((c) => (c.id === cid ? { ...c, ...input } : c))
        : [{ ...input, id: cid, createdAt: nowIso(), status: "draft" as const, isSample: false, stats: EMPTY_STATS }, ...s.campaigns];
      return { ...s, campaigns, activeCampaignId: cid, events: [ev("campaign", `Campaign “${input.name}” ${existing ? "updated" : "saved as draft"}`), ...s.events] };
    });
    return cid;
  }, []);

  const runCampaign = useCallback((id: string) => {
    setState((s) => {
      const c = s.campaigns.find((x) => x.id === id);
      if (!c) return s;
      return {
        ...s,
        activeCampaignId: id,
        campaigns: s.campaigns.map((x) => (x.id === id ? { ...x, status: "running" as const } : x)),
        events: [ev("agent", `AI agent started on “${c.name}”`), ...s.events],
      };
    });
  }, []);

  const completeCampaign = useCallback((id: string) => {
    setState((s) => {
      const c = s.campaigns.find((x) => x.id === id);
      if (!c || c.status !== "running") return s;
      const res = runPipeline(id, c, getDataset());
      const drafts = Object.fromEntries(Object.entries(s.drafts).filter(([k]) => !k.startsWith(`${id}__`)));
      return {
        ...s,
        drafts,
        campaigns: s.campaigns.map((x) => (x.id === id ? { ...x, status: "complete" as const, stats: res.stats } : x)),
        leads: [...s.leads.filter((l) => l.campaignId !== id), ...res.leads],
        events: [ev("agent", `Agent qualified ${res.stats.qualified} of ${res.stats.discovered} prospects for “${c.name}”`), ...s.events],
      };
    });
  }, []);

  const setReview = useCallback((ids: string[], review: ReviewStatus) => {
    const set = new Set(ids);
    setState((s) => ({
      ...s,
      leads: s.leads.map((l) => (set.has(l.id) ? { ...l, review } : l)),
      events: [ev("review", `${ids.length} prospect${ids.length === 1 ? "" : "s"} marked ${review.toLowerCase()}`), ...s.events],
    }));
  }, []);

  const buildDraft = useCallback(
    (leadId: string, tone: Tone, variant: number) => {
      const lead = state.leads.find((l) => l.id === leadId);
      const campaign = lead && state.campaigns.find((c) => c.id === lead.campaignId);
      if (!lead || !campaign) return null;
      return generateDraft(lead, companies.get(lead.companyId)!, contacts.get(lead.contactId)!, campaign, tone, variant);
    },
    [state.leads, state.campaigns, companies, contacts],
  );

  const saveDraft = useCallback((d: Omit<Draft, "savedAt">) => {
    setState((s) => {
      const lead = s.leads.find((l) => l.id === d.leadId);
      const name = lead ? contacts.get(lead.contactId)?.name ?? "prospect" : "prospect";
      return { ...s, drafts: { ...s.drafts, [d.leadId]: { ...d, savedAt: nowIso() } }, events: [ev("draft", `Outreach draft saved for ${name}`), ...s.events] };
    });
  }, [contacts]);

  const setGuideStep = useCallback((step: number | null) => setState((s) => ({ ...s, guideStep: step })), []);

  const reset = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setState(buildSeed());
  }, []);

  const value: Store = { ...state, companies, contacts, saveCampaign, runCampaign, completeCampaign, setReview, buildDraft, saveDraft, setGuideStep, reset };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemo() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDemo must be used within DemoProvider");
  return v;
}

export function formatTime(iso: string) {
  const d = new Date(iso);
  const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()];
  return `${m} ${d.getUTCDate()}, ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`;
}
