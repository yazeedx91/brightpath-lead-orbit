import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Bot, CheckCircle2 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Avatar, PageHeader, Panel, ScoreBadge, Stat, StatusBadge, pageHead } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { CONTACTED, useDemo } from "@/lib/demo/store";

export const Route = createFileRoute("/")({
  head: () => pageHead("Executive Dashboard", "Pipeline overview of the ProjectX AI lead generation agent."),
  component: Dashboard,
});

function Dashboard() {
  const { leads, campaigns, companies, contacts } = useDemo();
  const active = leads.filter((l) => l.status !== "rejected");
  const contacted = leads.filter((l) => CONTACTED.includes(l.status));
  const replied = leads.filter((l) => l.status === "replied" || l.status === "meeting");
  const meetings = leads.filter((l) => l.status === "meeting");
  const awaiting = leads.filter((l) => l.status === "qualified" && l.tier !== "Cold").sort((a, b) => b.score - a.score);
  const funnel = [
    { stage: "Discovered", value: campaigns.reduce((a, c) => a + c.stats.contacts, 0) },
    { stage: "Qualified", value: leads.length },
    { stage: "Approved", value: leads.filter((l) => ["approved", ...CONTACTED].includes(l.status)).length },
    { stage: "Contacted", value: contacted.length },
    { stage: "Replied", value: replied.length },
    { stage: "Meetings", value: meetings.length },
  ];

  return (
    <>
      <PageHeader eyebrow="Good afternoon, Maya" title="Executive Dashboard" description="Your AI agent has been prospecting across all active campaigns. Here is where things stand." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Qualified leads" value={active.length} hint={`${leads.filter((l) => l.tier === "Hot").length} hot prospects`} />
        <Stat label="Awaiting your approval" value={awaiting.length} hint="Drafts ready to review" />
        <Stat label="Reply rate" value={`${contacted.length ? Math.round((replied.length / contacted.length) * 100) : 0}%`} hint={`${replied.length} of ${contacted.length} contacted`} />
        <Stat label="Meetings booked" value={meetings.length} hint="From AI-drafted outreach" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Pipeline funnel" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={funnel} margin={{ left: -20 }}>
                <XAxis dataKey="stage" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Agent status">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Bot className="h-5 w-5" /></div>
            <div className="text-sm">
              <div className="font-semibold">Idle — all runs complete</div>
              <div className="text-muted-foreground">Last run qualified {campaigns[0]?.stats.qualified ?? 0} leads.</div>
            </div>
          </div>
          <ul className="mt-5 space-y-3 text-sm">
            {campaigns.slice(0, 4).map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="tabular-nums text-muted-foreground">{c.stats.qualified}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" className="mt-5 w-full" asChild><Link to="/campaigns/new">Launch new campaign</Link></Button>
        </Panel>
      </div>

      <Panel className="mt-6" title="Leads awaiting approval" action={<Link to="/outreach" className="flex items-center gap-1 text-xs font-medium text-primary">Review all <ArrowRight className="h-3 w-3" /></Link>}>
        <div className="-my-2 divide-y">
          {awaiting.slice(0, 6).map((l) => {
            const ct = contacts.get(l.contactId)!; const co = companies.get(l.companyId)!;
            return (
              <Link key={l.id} to="/leads/$id" params={{ id: l.id }} className="flex items-center gap-3 py-3 hover:bg-muted/40">
                <Avatar name={ct.name} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{ct.name} <span className="font-normal text-muted-foreground">· {ct.title}</span></div>
                  <div className="truncate text-xs text-muted-foreground">{co.name} · {co.industry} · {co.signals[0]?.detail ?? "no recent signals"}</div>
                </div>
                <StatusBadge status={l.status} />
                <ScoreBadge score={l.score} tier={l.tier} />
              </Link>
            );
          })}
          {awaiting.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Nothing waiting. Launch a campaign to find new leads.</p>}
        </div>
      </Panel>
    </>
  );
}
