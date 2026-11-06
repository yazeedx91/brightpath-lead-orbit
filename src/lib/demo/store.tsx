import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getDataset } from "./data";
import { generateDraft, interpretICP, runPipeline } from "./engine";
import type { Campaign, Company, Contact, Draft, ICP, Lead, LeadStatus, Tone } from "./types";

interface State {
  campaigns: Campaign[];
  leads: Lead[];
  drafts: Record<string, Draft>;
}

const STORAGE_KEY = "projectx-demo-v2";

const SEED_STATUSES: LeadStatus[] = ["meeting", "replied", "contacted", "contacted", "approved", "qualified", "replied", "contacted", "qualified", "rejected"];

export function buildSeed(): State {
  const data = getDataset();
  const icps: { id: string; name: string; createdAt: string; icp: ICP }[] = [
    {
      id: "cmp-fintech",
      name: "Q4 Fintech & Cybersecurity Expansion",
      createdAt: "2026-10-12",
      icp: interpretICP("Fintech and Cybersecurity companies in Europe and MENA with 100-2000 employees. Target VP and C-level revenue leaders at companies that recently raised funding or are hiring."),
    },
    {
      id: "cmp-logistics",
      name: "Logistics Ops Leaders – North America",
      createdAt: "2026-10-26",
      icp: interpretICP("Logistics and Manufacturing companies in North America, 200-4000 employees. Director and VP operations leaders with expansion or tech change signals."),
    },
  ];
  const campaigns: Campaign[] = [];
  const leads: Lead[] = [];
  for (const c of icps) {
    const res = runPipeline(c.id, c.icp, data);
    campaigns.push({ id: c.id, name: c.name, icp: c.icp, createdAt: c.createdAt, status: "complete", stats: res.stats });
    const seen = new Set(leads.map((l) => l.contactId));
    res.leads.filter((l) => !seen.has(l.contactId)).forEach((l, i) => {
      const status = l.tier === "Cold" ? (i % 3 === 0 ? "rejected" : "qualified") : SEED_STATUSES[i % SEED_STATUSES.length]!;
      leads.push({ ...l, status });
    });
  }
  return { campaigns, leads, drafts: {} };
}

interface Store extends State {
  companies: Map<string, Company>;
  contacts: Map<string, Contact>;
  createCampaign: (name: string, icp: ICP) => string;
  completeCampaign: (id: string) => void;
  setStatus: (leadIds: string[], status: LeadStatus) => void;
  getDraft: (leadId: string) => Draft | null;
  regenerateDraft: (leadId: string, tone: Tone) => void;
  saveDraft: (leadId: string, patch: Partial<Pick<Draft, "subject" | "body">>) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => buildSeed());
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
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

  const createCampaign = useCallback((name: string, icp: ICP) => {
    const id = `cmp-${Date.now().toString(36)}`;
    setState((s) => ({
      ...s,
      campaigns: [{ id, name, icp, createdAt: new Date().toISOString().slice(0, 10), status: "running", stats: { scanned: 0, matched: 0, contacts: 0, qualified: 0 } }, ...s.campaigns],
    }));
    return id;
  }, []);

  const completeCampaign = useCallback((id: string) => {
    setState((s) => {
      const c = s.campaigns.find((x) => x.id === id);
      if (!c || c.status === "complete") return s;
      const res = runPipeline(id, c.icp, getDataset());
      return {
        ...s,
        campaigns: s.campaigns.map((x) => (x.id === id ? { ...x, status: "complete", stats: res.stats } : x)),
        leads: [...s.leads.filter((l) => l.campaignId !== id), ...res.leads],
      };
    });
  }, []);

  const setStatus = useCallback((ids: string[], status: LeadStatus) => {
    const set = new Set(ids);
    setState((s) => ({ ...s, leads: s.leads.map((l) => (set.has(l.id) ? { ...l, status } : l)) }));
  }, []);

  const build = useCallback(
    (leadId: string, tone: Tone, variant: number, leads: Lead[]) => {
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) return null;
      return generateDraft(lead, companies.get(lead.companyId)!, contacts.get(lead.contactId)!, tone, variant);
    },
    [companies, contacts],
  );

  const getDraft = useCallback(
    (leadId: string) => state.drafts[leadId] ?? build(leadId, "friendly", 0, state.leads),
    [state.drafts, state.leads, build],
  );

  const regenerateDraft = useCallback((leadId: string, tone: Tone) => {
    setState((s) => {
      const prev = s.drafts[leadId];
      const variant = prev && prev.tone === tone ? prev.variant + 1 : 0;
      const d = build(leadId, tone, variant, s.leads);
      return d ? { ...s, drafts: { ...s.drafts, [leadId]: d } } : s;
    });
  }, [build]);

  const saveDraft = useCallback((leadId: string, patch: Partial<Pick<Draft, "subject" | "body">>) => {
    setState((s) => {
      const base = s.drafts[leadId] ?? build(leadId, "friendly", 0, s.leads);
      if (!base) return s;
      return { ...s, drafts: { ...s.drafts, [leadId]: { ...base, ...patch, edited: true } } };
    });
  }, [build]);

  const reset = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setState(buildSeed());
  }, []);

  const value: Store = { ...state, companies, contacts, createCampaign, completeCampaign, setStatus, getDraft, regenerateDraft, saveDraft, reset };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemo() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDemo must be used within DemoProvider");
  return v;
}

export const CONTACTED: LeadStatus[] = ["contacted", "replied", "meeting"];
