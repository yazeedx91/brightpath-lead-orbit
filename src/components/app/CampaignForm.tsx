import { useNavigate } from "@tanstack/react-router";
import { Info, Plus, Rocket, RotateCcw, Save, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES, INDUSTRIES, OBJECTIVES, POSITION_SUGGESTIONS, SIZE_PRESETS } from "@/lib/demo/data";
import { SAMPLE_CAMPAIGN } from "@/lib/demo/engine";
import { useDemo } from "@/lib/demo/store";
import type { CampaignInput } from "@/lib/demo/types";
import { cn } from "@/lib/utils";
import { DemoTag, Panel } from "./ui";

const EMPTY: CampaignInput = {
  name: "", industry: "", country: "", cities: [], sizeLabel: "Custom", employeeMin: 1, employeeMax: 1000,
  revenueMin: 0, revenueMax: 0, positions: [], icp: "", offering: "", objective: OBJECTIVES[0]!,
};

export function CampaignForm({ initial, campaignId, isSample }: { initial: CampaignInput; campaignId?: string; isSample: boolean }) {
  const { saveCampaign, runCampaign } = useDemo();
  const navigate = useNavigate();
  const [v, setV] = useState<CampaignInput>(initial);
  const [posInput, setPosInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof CampaignInput>(k: K, val: CampaignInput[K]) => setV((p) => ({ ...p, [k]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!v.name.trim()) e["name"] = "Give the campaign a name";
    if (!v.industry) e["industry"] = "Select a target industry";
    if (!v.country) e["country"] = "Select a target country";
    if (v.employeeMin > v.employeeMax) e["employees"] = "Minimum must be below maximum";
    if (v.revenueMax > 0 && v.revenueMin > v.revenueMax) e["revenue"] = "Minimum must be below maximum";
    if (v.positions.length === 0) e["positions"] = "Add at least one decision-maker position";
    if (!v.offering.trim()) e["offering"] = "Describe what you are promoting";
    setErrors(e);
    if (Object.keys(e).length) toast.error("Please complete the highlighted fields");
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return null;
    const id = saveCampaign(v, campaignId);
    return id;
  };
  const onSave = () => { const id = save(); if (id) { toast.success("Campaign saved"); if (!campaignId) navigate({ to: "/campaigns/$id/edit", params: { id } }); } };
  const onRun = () => { const id = save(); if (id) { runCampaign(id); navigate({ to: "/campaigns/$id/run", params: { id } }); } };

  const addPosition = (p: string) => {
    const t = p.trim();
    if (t && !v.positions.some((x) => x.toLowerCase() === t.toLowerCase())) set("positions", [...v.positions, t]);
    setPosInput("");
  };
  const cities = v.country ? COUNTRIES[v.country] ?? [] : [];

  return (
    <div className="space-y-6">
      {isSample && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning-soft px-4 py-3 text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div><span className="mr-2"><DemoTag>Editable sample scenario</DemoTag></span>This preconfigured brief is fictional. It is not an actual ProjectX customer or campaign — change any field.</div>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Campaign basics">
          <div className="space-y-4">
            <Field label="Campaign name" error={errors["name"]}><Input value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Saudi Logistics Prospecting" /></Field>
            <Field label="Target industry" error={errors["industry"]}>
              <Select value={v.industry} onValueChange={(x) => set("industry", x)}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Campaign objective">
              <Select value={v.objective} onValueChange={(x) => set("objective", x)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OBJECTIVES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Product or service being promoted" error={errors["offering"]}>
              <Textarea className="min-h-20 text-sm" value={v.offering} onChange={(e) => set("offering", e.target.value)} placeholder="What are you selling?" />
            </Field>
          </div>
        </Panel>

        <Panel title="Location">
          <div className="space-y-4">
            <Field label="Target country" error={errors["country"]}>
              <Select value={v.country} onValueChange={(x) => setV((p) => ({ ...p, country: x, cities: [] }))}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>{Object.keys(COUNTRIES).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Target cities or regions" hint="Leave empty to target the whole country">
              {cities.length === 0 ? <p className="text-xs text-muted-foreground">Select a country first.</p> : (
                <div className="flex flex-wrap gap-1.5">
                  {cities.map((c) => {
                    const on = v.cities.includes(c);
                    return <button key={c} type="button" onClick={() => set("cities", on ? v.cities.filter((x) => x !== c) : [...v.cities, c])}
                      className={cn("rounded-md border px-2.5 py-1 text-xs transition-colors", on ? "border-primary bg-accent font-medium text-accent-foreground" : "bg-card text-muted-foreground hover:border-primary/40")}>{c}</button>;
                  })}
                </div>
              )}
            </Field>
            <Field label="Company size">
              <Select value={v.sizeLabel} onValueChange={(x) => { const p = SIZE_PRESETS.find((s) => s.label === x); setV((o) => ({ ...o, sizeLabel: x, ...(p ? { employeeMin: p.min, employeeMax: p.max } : {}) })); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SIZE_PRESETS.map((s) => <SelectItem key={s.label} value={s.label}>{s.label}</SelectItem>)}<SelectItem value="Custom">Custom range</SelectItem></SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Employee count range" error={errors["employees"]}>
                <div className="flex items-center gap-1.5">
                  <Input type="number" min={1} value={v.employeeMin} onChange={(e) => setV((p) => ({ ...p, employeeMin: +e.target.value, sizeLabel: "Custom" }))} />
                  <span className="text-muted-foreground">–</span>
                  <Input type="number" min={1} value={v.employeeMax} onChange={(e) => setV((p) => ({ ...p, employeeMax: +e.target.value, sizeLabel: "Custom" }))} />
                </div>
              </Field>
              <Field label="Annual revenue (USD M)" error={errors["revenue"]} hint="0 – 0 means any">
                <div className="flex items-center gap-1.5">
                  <Input type="number" min={0} value={v.revenueMin} onChange={(e) => set("revenueMin", +e.target.value)} />
                  <span className="text-muted-foreground">–</span>
                  <Input type="number" min={0} value={v.revenueMax} onChange={(e) => set("revenueMax", +e.target.value)} />
                </div>
              </Field>
            </div>
          </div>
        </Panel>

        <Panel title="Decision-makers & ideal customer" className="lg:col-span-2">
          <div className="grid gap-6 lg:grid-cols-2">
            <Field label="Target decision-maker positions" error={errors["positions"]}>
              <div className="flex flex-wrap gap-1.5">
                {v.positions.map((p) => (
                  <span key={p} className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">{p}
                    <button type="button" onClick={() => set("positions", v.positions.filter((x) => x !== p))} aria-label={`Remove ${p}`}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input value={posInput} onChange={(e) => setPosInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPosition(posInput); } }} placeholder="Add a position and press Enter" />
                <Button type="button" variant="outline" size="icon" onClick={() => addPosition(posInput)} aria-label="Add position"><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {POSITION_SUGGESTIONS.filter((p) => !v.positions.includes(p)).slice(0, 6).map((p) => (
                  <button key={p} type="button" onClick={() => addPosition(p)} className="rounded border border-dashed px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary hover:text-primary">+ {p}</button>
                ))}
              </div>
            </Field>
            <Field label="Ideal customer profile">
              <Textarea className="min-h-32 text-sm" value={v.icp} onChange={(e) => set("icp", e.target.value)} placeholder="Describe the companies you want to win" />
            </Field>
          </div>
        </Panel>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <Button variant="ghost" size="sm" onClick={() => { setV(SAMPLE_CAMPAIGN); setErrors({}); }}><RotateCcw className="h-3.5 w-3.5" /> Load sample</Button>
        <Button variant="ghost" size="sm" onClick={() => { setV(EMPTY); setErrors({}); }}>Clear</Button>
        <span className="hidden text-xs text-muted-foreground md:inline">Simulated locally — no real data sources are searched.</span>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={onSave}><Save className="h-4 w-4" /> Save campaign</Button>
          <Button onClick={onRun}><Rocket className="h-4 w-4" /> Run AI agent</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, error, hint }: { label: string; children: ReactNode; error?: string | undefined; hint?: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-muted-foreground">{label}{hint && <span className="font-normal">{hint}</span>}</div>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
