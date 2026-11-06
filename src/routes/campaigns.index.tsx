import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Chip, PageHeader, pageHead } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { CONTACTED, useDemo } from "@/lib/demo/store";

export const Route = createFileRoute("/campaigns/")({
  head: () => pageHead("Campaigns", "Prospecting campaigns run by the ProjectX AI agent."),
  component: Campaigns,
});

function Campaigns() {
  const { campaigns, leads } = useDemo();
  return (
    <>
      <PageHeader title="Campaigns" description="Each campaign is an ideal customer profile the agent prospects against." actions={<Button asChild><Link to="/campaigns/new"><Plus className="h-4 w-4" /> New campaign</Link></Button>} />
      <div className="grid gap-4 md:grid-cols-2">
        {campaigns.map((c) => {
          const cl = leads.filter((l) => l.campaignId === c.id);
          return (
            <Link key={c.id} to="/campaigns/$id/run" params={{ id: c.id }} className="rounded-lg border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{c.name}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">Created {c.createdAt}</p>
                </div>
                <span className={c.status === "complete" ? "rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success" : "rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning"}>{c.status === "complete" ? "Complete" : "Running"}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {[...c.icp.industries, ...c.icp.regions].map((x) => <Chip key={x}>{x}</Chip>)}
                <Chip>{c.icp.employeeMin}–{c.icp.employeeMax} employees</Chip>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2 border-t pt-4 text-center">
                {[["Companies", c.stats.matched], ["Contacts", c.stats.contacts], ["Qualified", cl.length], ["Contacted", cl.filter((l) => CONTACTED.includes(l.status)).length]].map(([k, v]) => (
                  <div key={k}><div className="font-display text-lg font-bold tabular-nums">{v}</div><div className="text-[11px] text-muted-foreground">{k}</div></div>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
