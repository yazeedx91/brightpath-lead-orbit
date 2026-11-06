import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, Pencil, Play, Plus } from "lucide-react";
import { CampaignStatusBadge, Chip, DemoTag, PageHeader, pageHead } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { formatTime, useDemo } from "@/lib/demo/store";

export const Route = createFileRoute("/campaigns/")({
  head: () => pageHead("Campaigns", "All prospecting campaigns run by the ProjectX AI agent."),
  component: Campaigns,
});

function Campaigns() {
  const { campaigns, leads, runCampaign } = useDemo();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title="Campaigns" description="Each campaign is a target brief the agent prospects against." actions={<Button asChild><Link to="/campaigns/new"><Plus className="h-4 w-4" /> Create campaign</Link></Button>} />
      <div className="grid gap-4 md:grid-cols-2">
        {campaigns.map((c) => {
          const cl = leads.filter((l) => l.campaignId === c.id);
          return (
            <div key={c.id} className="flex flex-col rounded-lg border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 font-semibold">{c.name}{c.isSample && <DemoTag>Demo sample</DemoTag>}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">Created {formatTime(c.createdAt)} · {c.objective}</p>
                </div>
                <CampaignStatusBadge status={c.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Chip>{c.industry}</Chip><Chip>{c.country}</Chip>{c.cities.map((x) => <Chip key={x}>{x}</Chip>)}<Chip>{c.employeeMin}–{c.employeeMax} employees</Chip>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 border-t pt-4 text-center sm:grid-cols-6">
                {([["Discovered", c.stats.discovered], ["Enriched", c.stats.enriched], ["Qualified", c.stats.qualified], ["Review", c.stats.review], ["Low fit", c.stats.lowFit], ["Approved", cl.filter((l) => l.review === "Approved").length]] as const).map(([k, v]) => (
                  <div key={k}><div className="font-display text-lg font-bold tabular-nums">{v}</div><div className="text-[11px] text-muted-foreground">{k}</div></div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                <Button size="sm" variant="outline" asChild><Link to="/campaigns/$id/edit" params={{ id: c.id }}><Pencil className="h-3.5 w-3.5" /> Edit</Link></Button>
                <Button size="sm" variant="outline" asChild><Link to="/campaigns/$id/run" params={{ id: c.id }}><Activity className="h-3.5 w-3.5" /> Activity</Link></Button>
                {c.status === "complete" && <Button size="sm" variant="outline" asChild><Link to="/leads" search={{ campaign: c.id }}>Leads</Link></Button>}
                {c.status !== "running" && (
                  <Button size="sm" className="ml-auto" onClick={() => { runCampaign(c.id); navigate({ to: "/campaigns/$id/run", params: { id: c.id } }); }}>
                    <Play className="h-3.5 w-3.5" /> {c.status === "complete" ? "Run again" : "Run AI agent"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
