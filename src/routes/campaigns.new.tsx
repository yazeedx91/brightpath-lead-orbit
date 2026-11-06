import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Rocket, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { PageHeader, Panel, pageHead } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEPARTMENTS, INDUSTRIES, REGIONS, SENIORITIES, SIGNAL_TYPES } from "@/lib/demo/data";
import { interpretICP } from "@/lib/demo/engine";
import { useDemo } from "@/lib/demo/store";
import type { ICP } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/campaigns/new")({
  head: () => pageHead("New Campaign", "Describe your ideal customer and let the ProjectX agent prospect for you."),
  component: NewCampaign,
});

const EXAMPLE = "Healthcare SaaS and Fintech companies in MENA and Europe with 100-1500 employees. Target VP and Director revenue and marketing leaders at companies that are hiring or recently raised funding. Exclude Granite.";

function Toggle<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T[]; onChange: (v: T[]) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
            className={cn("rounded-md border px-2.5 py-1 text-xs transition-colors", on ? "border-primary bg-accent font-medium text-accent-foreground" : "bg-card text-muted-foreground hover:border-primary/40")}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function NewCampaign() {
  const { createCampaign } = useDemo();
  const navigate = useNavigate();
  const [text, setText] = useState(EXAMPLE);
  const [name, setName] = useState("MENA Healthcare & Fintech Growth");
  const [icp, setIcp] = useState<ICP | null>(null);
  const [thinking, setThinking] = useState(false);

  const interpret = () => {
    setThinking(true);
    setTimeout(() => { setIcp(interpretICP(text)); setThinking(false); }, 900);
  };
  const set = <K extends keyof ICP>(k: K, v: ICP[K]) => setIcp((p) => (p ? { ...p, [k]: v } : p));

  const launch = () => {
    if (!icp) return;
    const id = createCampaign(name || "Untitled campaign", icp);
    navigate({ to: "/campaigns/$id/run", params: { id } });
  };

  return (
    <>
      <PageHeader eyebrow="Step 1 of 2 · Define your target" title="New campaign" description="Describe who you want to sell to in plain language. The agent turns it into precise targeting criteria you can adjust." />
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Describe your ideal customer" className="lg:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Campaign name</label>
          <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="mt-4 block text-xs font-medium text-muted-foreground">Ideal customer profile</label>
          <Textarea className="mt-1.5 min-h-44 text-sm" value={text} onChange={(e) => setText(e.target.value)} />
          <Button className="mt-4 w-full" onClick={interpret} disabled={thinking || !text.trim()}>
            <Sparkles className="h-4 w-4" /> {thinking ? "Interpreting…" : icp ? "Re-interpret" : "Interpret with agent"}
          </Button>
        </Panel>

        <Panel title="Targeting criteria" className="lg:col-span-3">
          {!icp ? (
            <div className="flex h-full min-h-64 flex-col items-center justify-center text-center text-sm text-muted-foreground">
              <Sparkles className="mb-3 h-6 w-6 text-primary" />
              {thinking ? "Reading your description and mapping it to industries, regions and buyer personas…" : "The agent's interpretation will appear here."}
            </div>
          ) : (
            <div className="space-y-5">
              <Field label="Industries"><Toggle options={INDUSTRIES} value={icp.industries} onChange={(v) => set("industries", v)} /></Field>
              <Field label="Regions"><Toggle options={REGIONS} value={icp.regions} onChange={(v) => set("regions", v)} /></Field>
              <Field label="Company size (employees)">
                <div className="flex items-center gap-2">
                  <Input type="number" className="w-28" value={icp.employeeMin} onChange={(e) => set("employeeMin", +e.target.value)} />
                  <span className="text-muted-foreground">to</span>
                  <Input type="number" className="w-28" value={icp.employeeMax} onChange={(e) => set("employeeMax", +e.target.value)} />
                </div>
              </Field>
              <Field label="Seniority"><Toggle options={SENIORITIES} value={icp.seniority} onChange={(v) => set("seniority", v)} /></Field>
              <Field label="Departments"><Toggle options={DEPARTMENTS} value={icp.departments} onChange={(v) => set("departments", v)} /></Field>
              <Field label="Buying signals to prioritise"><Toggle options={SIGNAL_TYPES} value={icp.signals} onChange={(v) => set("signals", v)} /></Field>
              {icp.exclusions.length > 0 && (
                <Field label="Exclusions">
                  <div className="flex flex-wrap gap-1.5">
                    {icp.exclusions.map((e) => (
                      <span key={e} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">{e}
                        <button onClick={() => set("exclusions", icp.exclusions.filter((x) => x !== e))} aria-label={`Remove ${e}`}><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                </Field>
              )}
              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-xs text-muted-foreground">Synthetic data only — nothing is contacted.</p>
                <Button onClick={launch}><Rocket className="h-4 w-4" /> Launch agent</Button>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="mb-2 text-xs font-medium text-muted-foreground">{label}</div>{children}</div>;
}
