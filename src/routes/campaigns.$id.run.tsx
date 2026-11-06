import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Brain, Building2, Calculator, CheckCircle2, ClipboardCheck, FastForward, FileText, Loader2, Pause, Play, Search, Target, UserSearch, RotateCcw, FlaskConical,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CampaignStatusBadge, Chip, PageHeader, Panel, pageHead } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getDataset } from "@/lib/demo/data";
import { runPipeline } from "@/lib/demo/engine";
import { useDemo } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/campaigns/$id/run")({
  head: () => pageHead("Agent Activity", "Watch the ProjectX agent work through a multi-step prospecting task (simulated)."),
  component: Run,
});

const STAGES = [
  { label: "Understanding campaign requirements", icon: Target },
  { label: "Discovering target companies", icon: Search },
  { label: "Identifying decision-makers", icon: UserSearch },
  { label: "Enriching prospect information", icon: Building2 },
  { label: "Evaluating prospect relevance", icon: Brain },
  { label: "Calculating lead scores", icon: Calculator },
  { label: "Preparing qualified leads", icon: ClipboardCheck },
  { label: "Generating outreach drafts", icon: FileText },
];

interface Ev { stage: number; msg: string; reason?: string; discovered?: number; enriched?: number; qualified?: number }

function Run() {
  const { id } = Route.useParams();
  const { campaigns } = useDemo();
  const status = campaigns.find((c) => c.id === id)?.status;
  return <RunInner key={`${id}-${status === "running" ? "run" : "idle"}`} id={id} />;
}

function RunInner({ id }: { id: string }) {
  const { campaigns, completeCampaign, runCampaign, companies, contacts } = useDemo();
  const campaign = campaigns.find((c) => c.id === id);

  const events = useMemo<Ev[]>(() => {
    if (!campaign) return [];
    const res = runPipeline(id, campaign, getDataset());
    const c = campaign;
    const top = res.leads.slice(0, 3);
    const q = res.stats.qualified;
    const n = res.stats.discovered;
    const step = (k: number) => Math.max(1, Math.round((n * k) / 4));
    return [
      { stage: 0, msg: `Reading brief “${c.name}”`, reason: `Goal: ${c.objective.toLowerCase()}. Offering: ${c.offering.split(/ — | - /)[0]}.` },
      { stage: 0, msg: `Target: ${c.industry} in ${c.cities.length ? c.cities.join(", ") : "all cities"}, ${c.country} · ${c.employeeMin}–${c.employeeMax} employees` },
      { stage: 0, msg: `Decision-makers: ${c.positions.join(", ")}` },
      { stage: 1, msg: `Loading the Synthetic Demo Dataset (${n} fictional records)`, reason: "Demonstration only: no websites, search engines or real databases are queried." },
      { stage: 1, msg: `${n} candidate companies available in the dataset`, discovered: step(2) },
      { stage: 2, msg: `Matched one decision-maker per company`, discovered: n },
      ...res.leads.slice(0, 3).map((l, i) => {
        const co = companies.get(l.companyId)!;
        return { stage: 3, msg: `Enriched ${co.prospectId} ${co.name} — ${co.sector}, ${co.city}, ${co.employees} employees`, enriched: step(i + 1) };
      }),
      { stage: 3, msg: `Enriched all ${n} prospect profiles`, enriched: n },
      { stage: 4, msg: "Evaluating industry, geography, company size and decision-maker relevance" },
      ...top.slice(0, 1).map((l) => {
        const ct = contacts.get(l.contactId)!;
        return { stage: 4, msg: `Strong match: ${ct.name}, ${ct.title} at ${companies.get(l.companyId)!.name}`, reason: l.explanation };
      }),
      ...top.map((l, i) => {
        const ct = contacts.get(l.contactId)!;
        return { stage: 5, msg: `Scored ${ct.name}: ${l.factors.map((f) => f.points).join(" + ")} = ${l.score}/100`, qualified: Math.min(q, i + 1) };
      }),
      { stage: 5, msg: `Scored all ${n} prospects with weights 30 / 20 / 20 / 30`, qualified: q },
      { stage: 6, msg: `${q} Qualified (75–100), ${res.stats.review} Review (60–74), ${res.stats.lowFit} Low Fit (below 60)`, qualified: q },
      { stage: 6, msg: "Queued all prospects for human review" },
      { stage: 7, msg: `Writing personalised drafts for ${q} qualified prospects` },
      { stage: 7, msg: `${res.stats.drafts} outreach drafts ready — nothing is sent automatically` },
    ];
  }, [campaign?.id, campaign?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const initialShown = campaign?.status === "complete" ? events.length : 0;
  const [shown, setShown] = useState(initialShown);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const running = campaign?.status === "running";

  useEffect(() => {
    if (!running || paused || shown >= events.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 1000 / speed);
    return () => clearTimeout(t);
  }, [shown, paused, speed, events.length, running]);

  useEffect(() => {
    if (running && events.length && shown >= events.length) completeCampaign(id);
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [shown, events.length, running, completeCampaign, id]);

  if (!campaign) return <p className="text-sm text-muted-foreground">Campaign not found. <Link to="/campaigns" className="text-primary">Back to campaigns</Link></p>;

  const isDraft = campaign.status === "draft";
  const visibleCount = campaign.status === "complete" ? events.length : running ? shown : 0;
  const visible = events.slice(0, visibleCount);
  const discovered = visible.reduce((a, e) => e.discovered ?? a, 0);
  const qualified = visible.reduce((a, e) => e.qualified ?? a, 0);
  const enriched = visible.reduce((a, e) => e.enriched ?? a, 0);
  const finished = campaign.status === "complete";
  const currentStage = finished ? STAGES.length : events[visibleCount]?.stage ?? 0;
  const pct = events.length ? Math.round((visibleCount / events.length) * 100) : 0;
  const current = finished ? null : events[visibleCount];

  return (
    <>
      <PageHeader
        eyebrow={<span className="flex items-center gap-2">AI agent activity <CampaignStatusBadge status={campaign.status} /></span>}
        title={campaign.name}
        description={finished ? "Run complete. Review the prospects and outreach drafts." : isDraft ? "This campaign has not been run yet." : "The agent is working autonomously through your campaign."}
        actions={finished ? (
          <>
            <Button variant="outline" onClick={() => runCampaign(id)}><RotateCcw className="h-4 w-4" /> Run again</Button>
            <Button variant="outline" asChild><Link to="/outreach" search={{ lead: undefined }}>Outreach</Link></Button>
            <Button asChild><Link to="/leads" search={{ campaign: id }}>Review leads</Link></Button>
          </>
        ) : isDraft ? (
          <Button onClick={() => runCampaign(id)}><Play className="h-4 w-4" /> Run AI agent</Button>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={() => setPaused((p) => !p)}>{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}{paused ? "Resume" : "Pause"}</Button>
            <Button variant="outline" size="sm" onClick={() => setSpeed((s) => (s === 1 ? 4 : 1))}><FastForward className="h-4 w-4" /> {speed}x</Button>
            <Button size="sm" onClick={() => setShown(events.length)}>Skip to results</Button>
          </>
        )}
      />

      <div className="mb-6 flex items-center gap-2 rounded-md border border-dashed border-warning/50 bg-warning-soft/60 px-3 py-2 text-xs text-warning">
        <FlaskConical className="h-3.5 w-3.5" /> Simulated demonstration — all prospects come from the Synthetic Demo Dataset and are processed locally. No websites, databases or AI services are contacted.
      </div>

      <div className="grid gap-4 sm:grid-cols-5">
        <div className="rounded-lg border bg-card p-4 shadow-[var(--shadow-card)] sm:col-span-2">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground"><span>Processing progress</span><span className="tabular-nums text-foreground">{pct}%</span></div>
          <Progress value={pct} className="mt-3 h-2" />
          <div className="mt-2 text-xs text-muted-foreground">{Math.min(currentStage, STAGES.length)} of {STAGES.length} stages complete</div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="text-xs font-medium text-muted-foreground">Discovered prospects</div>
          <div className="mt-1 font-display text-3xl font-bold tabular-nums">{discovered}</div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="text-xs font-medium text-muted-foreground">Enriched prospects</div>
          <div className="mt-1 font-display text-3xl font-bold tabular-nums">{enriched}</div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="text-xs font-medium text-muted-foreground">Qualified prospects</div>
          <div className="mt-1 font-display text-3xl font-bold tabular-nums text-success">{qualified}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <div className="rounded-lg border border-primary/30 bg-accent/50 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Current activity</div>
            {finished ? (
              <div className="mt-2 flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="h-4 w-4 text-success" /> All stages complete</div>
            ) : isDraft ? (
              <div className="mt-2 text-sm text-muted-foreground">Waiting to start. Click “Run AI agent”.</div>
            ) : (
              <>
                <div className="mt-2 flex items-center gap-2 font-medium">
                  <Loader2 className={cn("h-4 w-4 text-primary", !paused && "animate-spin")} />{STAGES[currentStage]?.label}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{paused ? "Paused" : current?.msg ?? "…"}</div>
              </>
            )}
          </div>
          <Panel title="Stages">
            <ol className="space-y-0.5">
              {STAGES.map((s, i) => {
                const state = isDraft ? "todo" : i < currentStage ? "done" : i === currentStage ? "active" : "todo";
                return (
                  <li key={s.label} className={cn("flex items-center gap-3 rounded-md px-2 py-2 text-sm", state === "active" && "bg-accent")}>
                    {state === "done" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : state === "active" ? <Loader2 className={cn("h-4 w-4 shrink-0 text-primary", !paused && "animate-spin")} /> : <s.icon className="h-4 w-4 shrink-0 text-muted-foreground/50" />}
                    <span className={cn(state === "todo" && "text-muted-foreground", state === "active" && "font-medium text-accent-foreground")}>{s.label}</span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 border-t pt-4">
              <div className="mb-2 text-xs font-medium text-muted-foreground">Brief</div>
              <div className="flex flex-wrap gap-1.5"><Chip>{campaign.industry}</Chip><Chip>{campaign.country}</Chip>{campaign.cities.map((x) => <Chip key={x}>{x}</Chip>)}</div>
            </div>
          </Panel>
        </div>

        <Panel title="Activity timeline" className="lg:col-span-2" action={<span className="text-xs text-muted-foreground">{finished ? "Complete" : isDraft ? "Not started" : paused ? "Paused" : "Live"}</span>}>
          <div ref={logRef} className="h-[520px] overflow-y-auto pr-2">
            {visible.length === 0 && <p className="py-20 text-center text-sm text-muted-foreground">{isDraft ? "The timeline will appear when the agent starts." : "Starting…"}</p>}
            <ol className="relative space-y-4 border-l pl-5">
              {visible.map((e, i) => {
                const firstOfStage = i === 0 || visible[i - 1]?.stage !== e.stage;
                return (
                  <li key={i} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                    <span className={cn("absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-card", firstOfStage ? "bg-primary" : "bg-border")} />
                    {firstOfStage && <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-primary">{STAGES[e.stage]?.label}</div>}
                    <div className="flex gap-3 text-sm">
                      <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">00:{String(i * 2).padStart(2, "0")}</span>
                      <span>{e.msg}</span>
                    </div>
                    {e.reason && <div className="ml-12 mt-1.5 rounded-md border-l-2 border-primary bg-accent/60 px-3 py-2 text-xs text-accent-foreground"><span className="font-semibold">Agent reasoning · </span>{e.reason}</div>}
                  </li>
                );
              })}
            </ol>
          </div>
        </Panel>
      </div>
    </>
  );
}
