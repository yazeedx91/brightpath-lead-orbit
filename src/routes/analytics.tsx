import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Panel, Stat, pageHead } from "@/components/app/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CONTACTED, useDemo } from "@/lib/demo/store";

export const Route = createFileRoute("/analytics")({
  head: () => pageHead("Campaign Analytics", "Performance of ProjectX prospecting campaigns: funnel, scores and replies."),
  component: Analytics,
});

function Analytics() {
  const { leads, campaigns, companies } = useDemo();
  const [cid, setCid] = useState("all");
  const ls = leads.filter((l) => cid === "all" || l.campaignId === cid);
  const contacted = ls.filter((l) => CONTACTED.includes(l.status));
  const replied = ls.filter((l) => l.status === "replied" || l.status === "meeting");
  const meetings = ls.filter((l) => l.status === "meeting");

  const daily = Array.from({ length: 14 }, (_, d) => {
    const day = ls.filter((l) => l.discoveredDay <= d);
    return {
      day: `Day ${d + 1}`,
      Qualified: day.length,
      Contacted: day.filter((l) => CONTACTED.includes(l.status) && l.discoveredDay + 2 <= d).length,
      Replied: day.filter((l) => (l.status === "replied" || l.status === "meeting") && l.discoveredDay + 4 <= d).length,
    };
  });
  const dist = [40, 50, 60, 70, 80, 90].map((b) => ({ range: `${b}–${b + 9}`, Leads: ls.filter((l) => l.score >= b && l.score < b + 10).length }));
  const byInd = Object.entries(ls.reduce<Record<string, { leads: number; replied: number }>>((a, l) => {
    const i = companies.get(l.companyId)!.industry; a[i] ??= { leads: 0, replied: 0 }; a[i].leads++;
    if (l.status === "replied" || l.status === "meeting") a[i].replied++; return a;
  }, {})).map(([industry, v]) => ({ industry, Leads: v.leads, Replies: v.replied })).sort((a, b) => b.Leads - a.Leads);
  const avg = ls.length ? Math.round(ls.reduce((a, l) => a + l.score, 0) / ls.length) : 0;

  return (
    <>
      <PageHeader title="Campaign analytics" description="Simulated performance over the first 14 days of each campaign."
        actions={<Select value={cid} onValueChange={setCid}><SelectTrigger className="w-64"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All campaigns</SelectItem>{campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Qualified leads" value={ls.length} hint={`Average score ${avg}`} />
        <Stat label="Contacted" value={contacted.length} />
        <Stat label="Reply rate" value={`${contacted.length ? Math.round((replied.length / contacted.length) * 100) : 0}%`} hint="Industry benchmark: 8%" />
        <Stat label="Meetings booked" value={meetings.length} hint={`${contacted.length ? Math.round((meetings.length / contacted.length) * 100) : 0}% of contacted`} />
      </div>
      <Panel title="Pipeline over time" className="mt-6">
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={daily} margin={{ left: -20 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="Qualified" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.12} strokeWidth={2} />
              <Area type="monotone" dataKey="Contacted" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.12} strokeWidth={2} />
              <Area type="monotone" dataKey="Replied" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Lead score distribution">
          <div className="h-64"><ResponsiveContainer><BarChart data={dist} margin={{ left: -20 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="range" tickLine={false} axisLine={false} fontSize={12} /><YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip cursor={{ fill: "var(--muted)" }} /><Bar dataKey="Leads" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Performance by industry">
          <div className="h-64"><ResponsiveContainer><BarChart data={byInd} layout="vertical" margin={{ left: 30 }}>
            <XAxis type="number" hide /><YAxis type="category" dataKey="industry" tickLine={false} axisLine={false} fontSize={12} width={110} />
            <Tooltip cursor={{ fill: "var(--muted)" }} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Leads" fill="var(--chart-5)" radius={[0, 4, 4, 0]} /><Bar dataKey="Replies" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
          </BarChart></ResponsiveContainer></div>
        </Panel>
      </div>
    </>
  );
}
