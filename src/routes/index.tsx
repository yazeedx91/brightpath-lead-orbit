import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, ArrowRight, CircleSlash, Database, Bot, CheckCircle2, FileText, Megaphone, PlayCircle, Plus, Search, UserCheck, Users } from "lucide-react";
import { useGuide } from "@/components/app/GuidedDemo";
import { CampaignStatusBadge, Chip, DemoTag, PageHeader, Panel, Stat, pageHead } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { SAMPLE_ID, formatTime, useDemo } from "@/lib/demo/store";
import type { ActivityEvent } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => pageHead("Overview", "Executive overview of the ProjectX AI lead generation agent: prospects, qualification and outreach."),
  component: Overview,
});

const KIND_ICON: Record<ActivityEvent["kind"], typeof Bot> = { agent: Bot, campaign: Megaphone, review: UserCheck, draft: FileText };

function Overview() {
  const { leads, campaigns, drafts, events, runCampaign } = useDemo();
  const navigate = useNavigate();
  const { start } = useGuide();
  const discovered = campaigns.reduce((a, c) => a + (c.status === "complete" ? c.stats.discovered : 0), 0);
  const qualified = leads.filter((l) => l.qualification === "Qualified").length;
  const enriched = campaigns.reduce((a, c) => a + (c.status === "complete" ? c.stats.enriched : 0), 0);
  const review = leads.filter((l) => l.qualification === "Review").length;
  const lowFit = leads.filter((l) => l.qualification === "Low Fit").length;
  const generated = campaigns.reduce((a, c) => a + (c.status === "complete" ? c.stats.drafts : 0), 0);
  const approved = leads.filter((l) => l.review === "Approved").length;
  const reviewed = leads.filter((l) => l.review !== "Pending").length;
  const sample = campaigns.find((c) => c.id === SAMPLE_ID);
  const funnel = [
    { label: "Discovered", value: discovered },
    { label: "Enriched", value: enriched },
    { label: "Qualified", value: qualified },
    { label: "Review", value: review },
    { label: "Approved", value: approved },
    { label: "Drafts saved", value: Object.keys(drafts).length },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Welcome back, Maya"
        title="Your AI prospecting agent"
        description="ProjectX understands your ideal customer, discovers matching companies, finds decision-makers, scores every prospect with clear reasons and drafts personalised outreach for your approval."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ActionCard icon={PlayCircle} title="Start Guided Demo" detail="Five-step walkthrough" onClick={start} primary />
        <ActionCard icon={Plus} title="Create Campaign" detail="Define a target profile" onClick={() => navigate({ to: "/campaigns/new" })} />
        <ActionCard icon={Bot} title="Run AI Agent" detail="Run the sample campaign" onClick={() => { runCampaign(SAMPLE_ID); navigate({ to: "/campaigns/$id/run", params: { id: SAMPLE_ID } }); }} />
        <ActionCard icon={CheckCircle2} title="View Qualified Leads" detail={`${qualified} prospects scored 75+`} onClick={() => navigate({ to: "/leads", search: { campaign: undefined, qual: "Qualified" } })} />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Discovered" value={discovered} hint="Synthetic Demo Dataset" icon={<Search className="h-4 w-4" />} />
        <Stat label="Enriched" value={enriched} hint="Profiles completed" icon={<Database className="h-4 w-4" />} />
        <Stat label="Qualified" value={qualified} hint="Score 75–100" icon={<CheckCircle2 className="h-4 w-4" />} />
        <Stat label="Needs review" value={review} hint="Score 60–74" icon={<Users className="h-4 w-4" />} />
        <Stat label="Low fit" value={lowFit} hint="Score below 60" icon={<CircleSlash className="h-4 w-4" />} />
        <Stat label="Drafts" value={generated} hint={`${Object.keys(drafts).length} saved by you`} icon={<FileText className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {sample && (
          <Panel className="lg:col-span-2" title={<span className="flex items-center gap-2">Sample campaign <DemoTag /></span>} action={<CampaignStatusBadge status={sample.status} />}>
            <div className="flex flex-col gap-5 md:flex-row">
              <div className="flex-1">
                <h3 className="text-lg font-bold">{sample.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Editable sample scenario — not an actual ProjectX customer or campaign.</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Chip>{sample.industry}</Chip><Chip>{sample.cities.join(", ")}</Chip><Chip>{sample.employeeMin}–{sample.employeeMax} employees</Chip>
                </div>
                <p className="mt-3 text-xs text-muted-foreground"><span className="font-medium text-foreground">Targets:</span> {sample.positions.join(", ")}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild><Link to="/campaigns/$id/run" params={{ id: sample.id }}><Activity className="h-3.5 w-3.5" /> Agent activity</Link></Button>
                  <Button size="sm" variant="outline" asChild><Link to="/leads" search={{ campaign: sample.id, qual: undefined }}>View leads</Link></Button>
                </div>
              </div>
              <div className="w-full space-y-3 md:w-64">
                <div className="text-xs font-medium text-muted-foreground">Performance summary</div>
                {funnel.map((f) => (
                  <div key={f.label}>
                    <div className="flex justify-between text-xs"><span>{f.label}</span><span className="font-semibold tabular-nums">{f.value}</span></div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${funnel[0]!.value ? (f.value / funnel[0]!.value) * 100 : 0}%` }} /></div>
                  </div>
                ))}
                <div className="border-t pt-3 text-xs text-muted-foreground">Approval rate <span className="float-right font-semibold text-foreground">{reviewed ? Math.round((approved / reviewed) * 100) : 0}%</span></div>
              </div>
            </div>
          </Panel>
        )}

        <Panel title="Recent campaign activity" bodyClassName="p-0">
          <ul className="divide-y">
            {events.slice(0, 6).map((e) => {
              const Icon = KIND_ICON[e.kind];
              return (
                <li key={e.id} className="flex gap-3 px-5 py-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground"><Icon className="h-3.5 w-3.5" /></div>
                  <div className="min-w-0"><div className="text-sm">{e.message}</div><div className="text-[11px] text-muted-foreground">{formatTime(e.at)}</div></div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-6" title="Campaigns" action={<Link to="/campaigns" className="flex items-center gap-1 text-xs font-medium text-primary">All campaigns <ArrowRight className="h-3 w-3" /></Link>} bodyClassName="p-0">
        <div className="divide-y">
          {campaigns.slice(0, 4).map((c) => (
            <Link key={c.id} to="/campaigns/$id/run" params={{ id: c.id }} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/40">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 truncate text-sm font-medium">{c.name}{c.isSample && <DemoTag />}</div>
                <div className="truncate text-xs text-muted-foreground">{c.industry} · {c.country}</div>
              </div>
              <div className="hidden text-right text-xs text-muted-foreground sm:block"><span className="font-semibold text-foreground tabular-nums">{c.stats.qualified}</span> qualified of {c.stats.discovered}</div>
              <CampaignStatusBadge status={c.status} />
            </Link>
          ))}
        </div>
      </Panel>
    </>
  );
}

function ActionCard({ icon: Icon, title, detail, onClick, primary }: { icon: typeof Bot; title: string; detail: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg border p-4 text-left shadow-[var(--shadow-card)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        primary ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90" : "bg-card hover:border-primary/40 hover:bg-accent/40",
      )}
    >
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", primary ? "bg-primary-foreground/15" : "bg-accent text-accent-foreground")}><Icon className="h-4 w-4" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className={cn("block text-xs leading-snug", primary ? "text-primary-foreground/80" : "text-muted-foreground")}>{detail}</span>
      </span>
      <ArrowRight className={cn("h-4 w-4 shrink-0", primary ? "text-primary-foreground/80" : "text-muted-foreground")} />
    </button>
  );
}
