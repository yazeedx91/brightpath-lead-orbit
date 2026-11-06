import { Link, createFileRoute } from "@tanstack/react-router";
import { Brain, Building2, CheckCircle2, Circle, FileText, Loader2, Pause, Play, Search, Sparkles, Target, UserSearch, FastForward } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chip, PageHeader, Panel, pageHead } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { getDataset } from "@/lib/demo/data";
import { runPipeline } from "@/lib/demo/engine";
import { useDemo } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/campaigns/$id/run")({
  head: () => pageHead("Agent Activity", "Live view of the ProjectX agent discovering and qualifying prospects."),
  component: Run,
});

const STEPS = [
  { label: "Understand ICP", icon: Target },
  { label: "Discover companies", icon: Search },
  { label: "Identify decision-makers", icon: UserSearch },
  { label: "Enrich profiles", icon: Building2 },
  { label: "Score & qualify", icon: Brain },
  { label: "Draft outreach", icon: FileText },
];

interface Ev { step: number; msg: string; reason?: string; c?: Partial<Record<"scanned" | "matched" | "contacts" | "qualified" | "drafts", number>> }

function Run() {
  const { id } = Route.useParams();
  const { campaigns, completeCampaign, companies, contacts } = useDemo();
  const campaign = campaigns.find((c) => c.id === id);

  const events = useMemo<Ev[]>(() => {
    if (!campaign) return [];
    const data = getDataset();
    const res = runPipeline(id, campaign.icp, data);
    const icp = campaign.icp;
    const matchedCos = Array.from(new Set(res.leads.map((l) => l.companyId))).map((x) => companies.get(x)!);
    const ev: Ev[] = [
      { step: 0, msg: "Parsing ideal customer profile", reason: `Targeting ${icp.industries.join(", ") || "all industries"} in ${icp.regions.join(", ") || "all regions"}, ${icp.employeeMin}–${icp.employeeMax} employees.` },
      { step: 0, msg: `Buyer personas: ${icp.seniority.join(", ")}${icp.departments.length ? ` in ${icp.departments.join(", ")}` : ""}` },
      { step: 1, msg: "Searching synthetic company index", c: { scanned: Math.round(res.stats.scanned * 0.4) } },
      { step: 1, msg: "Applying industry, region and size filters", c: { scanned: res.stats.scanned } },
      ...(icp.exclusions.length ? [{ step: 1, msg: `Excluding: ${icp.exclusions.join(", ")}` }] : []),
      { step: 1, msg: `${res.stats.matched} companies match the profile`, c: { matched: res.stats.matched }, reason: "Companies outside the target industry and region were discarded before enrichment to save effort." },
      { step: 2, msg: "Mapping org charts for matched companies", c: { contacts: Math.round(res.stats.contacts / 2) } },
      { step: 2, msg: `${res.stats.contacts} potential decision-makers identified`, c: { contacts: res.stats.contacts } },
      ...matchedCos.slice(0, 5).map((co) => ({ step: 3, msg: `Enriched ${co.name} — ${co.employees.toLocaleString()} employees, ${co.fundingStage}, ${co.techStack.join(" / ")}` })),
      { step: 3, msg: `Detected ${matchedCos.reduce((a, c) => a + c.signals.length, 0)} buying signals across accounts` },
      ...res.leads.slice(0, 5).map((l, i) => {
        const ct = contacts.get(l.contactId)!; const co = companies.get(l.companyId)!;
        return { step: 4, msg: `Scored ${ct.name} (${ct.title}, ${co.name}) → ${l.score} ${l.tier}`, c: { qualified: Math.round(((i + 1) / 5) * res.leads.length) }, reason: i === 0 ? l.factors.map((f) => `${f.label}: ${f.points}/${f.weight}`).join(" · ") : undefined };
      }),
      { step: 4, msg: `${res.leads.length} leads qualified (${res.leads.filter((l) => l.tier === "Hot").length} hot)`, c: { qualified: res.leads.length } },
      { step: 5, msg: "Writing personalised drafts from signals and role context", c: { drafts: Math.round(res.leads.length / 2) } },
      { step: 5, msg: "Drafts queued for human approval — nothing is sent automatically", c: { drafts: res.leads.filter((l) => l.tier !== "Cold").length } },
    ];
    return ev;
  }, [campaign?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const done0 = campaign?.status === "complete";
  const [shown, setShown] = useState(done0 ? events.length : 0);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused || shown >= events.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 900 / speed);
    return () => clearTimeout(t);
  }, [shown, paused, speed, events.length]);

  useEffect(() => {
    if (shown >= events.length && events.length && campaign?.status === "running") completeCampaign(id);
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [shown, events.length, campaign?.status, completeCampaign, id]);

  if (!campaign) return <p className="text-sm text-muted-foreground">Campaign not found. <Link to="/campaigns" className="text-primary">Back to campaigns</Link></p>;

  const visible = events.slice(0, shown);
  const counters = visible.reduce((a, e) => ({ ...a, ...e.c }), { scanned: 0, matched: 0, contacts: 0, qualified: 0, drafts: 0 } as Record<string, number>);
  const current = shown >= events.length ? STEPS.length : events[shown]?.step ?? 0;
  const finished = shown >= events.length;

  return (
    <>
      <PageHeader eyebrow="Agent activity" title={campaign.name}
        description={finished ? "Run complete. Review the qualified leads and approve outreach." : "The agent is working through your campaign. You can pause, speed up or skip at any time."}
        actions={finished ? (
          <>
            <Button variant="outline" asChild><Link to="/leads" search={{ campaign: id }}>View leads</Link></Button>
            <Button asChild><Link to="/outreach">Review drafts</Link></Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={() => setPaused((p) => !p)}>{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}{paused ? "Resume" : "Pause"}</Button>
            <Button variant="outline" size="sm" onClick={() => setSpeed((s) => (s === 1 ? 4 : 1))}><FastForward className="h-4 w-4" /> {speed}x</Button>
            <Button size="sm" onClick={() => setShown(events.length)}>Skip to results</Button>
          </>
        )} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[["Records scanned", counters.scanned], ["Companies matched", counters.matched], ["Decision-makers", counters.contacts], ["Qualified leads", counters.qualified], ["Drafts written", counters.drafts]].map(([k, v]) => (
          <div key={k} className="rounded-lg border bg-card p-4 shadow-[var(--shadow-card)]">
            <div className="text-[11px] font-medium text-muted-foreground">{k}</div>
            <div className="mt-1 font-display text-2xl font-bold tabular-nums">{Number(v).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Pipeline">
          <ol className="space-y-1">
            {STEPS.map((s, i) => {
              const state = i < current ? "done" : i === current ? "active" : "todo";
              return (
                <li key={s.label} className={cn("flex items-center gap-3 rounded-md px-2 py-2.5 text-sm", state === "active" && "bg-accent")}>
                  {state === "done" ? <CheckCircle2 className="h-4 w-4 text-success" /> : state === "active" ? <Loader2 className={cn("h-4 w-4 text-primary", !paused && "animate-spin")} /> : <Circle className="h-4 w-4 text-border" />}
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className={cn(state === "todo" && "text-muted-foreground", state === "active" && "font-medium text-accent-foreground")}>{s.label}</span>
                </li>
              );
            })}
          </ol>
          <div className="mt-5 border-t pt-4">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Criteria</div>
            <div className="flex flex-wrap gap-1.5">{[...campaign.icp.industries, ...campaign.icp.regions, ...campaign.icp.signals].map((x) => <Chip key={x}>{x}</Chip>)}</div>
          </div>
        </Panel>

        <Panel title="Agent log" className="lg:col-span-2" action={<span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Sparkles className="h-3 w-3 text-primary" />{finished ? "Complete" : paused ? "Paused" : "Running"}</span>}>
          <div ref={logRef} className="h-[440px] space-y-2 overflow-y-auto pr-2 font-mono text-[12.5px]">
            {visible.map((e, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                <div className="flex gap-3">
                  <span className="shrink-0 tabular-nums text-muted-foreground">{String(Math.floor(i * 1.7)).padStart(2, "0")}s</span>
                  <span className="shrink-0 text-primary">[{STEPS[e.step].label.split(" ")[0].toLowerCase()}]</span>
                  <span>{e.msg}</span>
                </div>
                {e.reason && (
                  <div className="ml-12 mt-1.5 rounded-md border-l-2 border-primary bg-accent/60 px-3 py-2 font-sans text-xs text-accent-foreground">
                    <span className="font-semibold">Reasoning · </span>{e.reason}
                  </div>
                )}
              </div>
            ))}
            {!finished && <div className="flex gap-3 text-muted-foreground"><span className="animate-pulse">▍</span></div>}
          </div>
        </Panel>
      </div>
    </>
  );
}
