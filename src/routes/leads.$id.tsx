import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Building2, Lightbulb, Mail, MapPin, Users, Zap } from "lucide-react";
import { DraftEditor } from "@/components/app/DraftEditor";
import { Avatar, Chip, Panel, ScoreBadge, StatusBadge, pageHead } from "@/components/app/ui";
import { improvementTips } from "@/lib/demo/engine";
import { useDemo } from "@/lib/demo/store";

export const Route = createFileRoute("/leads/$id")({
  head: () => pageHead("Lead Profile", "Enriched prospect profile with an explainable AI lead score."),
  component: LeadProfile,
});

function LeadProfile() {
  const { id } = Route.useParams();
  const { leads, companies, contacts, campaigns } = useDemo();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return <p className="text-sm text-muted-foreground">Lead not found. <Link to="/leads" className="text-primary">Back to leads</Link></p>;
  const ct = contacts.get(lead.contactId)!; const co = companies.get(lead.companyId)!;
  const campaign = campaigns.find((c) => c.id === lead.campaignId);
  const tips = improvementTips(lead.factors);

  return (
    <>
      <Link to="/leads" className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3" /> All leads</Link>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar name={ct.name} className="h-14 w-14 text-base" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{ct.name}</h1>
          <p className="text-sm text-muted-foreground">{ct.title} at {co.name} · {campaign?.name}</p>
        </div>
        <div className="flex items-center gap-2"><StatusBadge status={lead.status} /><ScoreBadge score={lead.score} tier={lead.tier} /></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Why this score" action={<span className="font-display text-xl font-bold tabular-nums">{lead.score}<span className="text-sm font-medium text-muted-foreground">/100</span></span>}>
            <div className="mb-5 flex h-2.5 overflow-hidden rounded-full bg-muted">
              {lead.factors.map((f, i) => <div key={f.key} style={{ width: `${f.points}%`, background: `var(--chart-${i + 1})` }} />)}
            </div>
            <div className="space-y-4">
              {lead.factors.map((f, i) => (
                <div key={f.key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: `var(--chart-${i + 1})` }} />{f.label}</span>
                    <span className="tabular-nums text-muted-foreground">{f.points} / {f.weight}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${f.value * 100}%`, background: `var(--chart-${i + 1})` }} /></div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{f.reason}</p>
                </div>
              ))}
            </div>
            {tips.length > 0 && (
              <div className="mt-5 rounded-md bg-accent/60 p-3 text-xs text-accent-foreground">
                <div className="mb-1 flex items-center gap-1.5 font-semibold"><Lightbulb className="h-3.5 w-3.5" /> What would raise this score</div>
                <ul className="list-disc space-y-0.5 pl-5">{tips.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
            )}
          </Panel>
          <Panel title="Personalised outreach draft"><DraftEditor leadId={lead.id} /></Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Prospect">
            <dl className="space-y-3 text-sm">
              <Row icon={Mail} k="Email" v={ct.email} />
              <Row icon={Users} k="Seniority" v={`${ct.seniority} · ${ct.department}`} />
              <Row icon={Zap} k="Tenure" v={`${ct.tenureMonths} months in role`} />
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{ct.summary}</p>
          </Panel>
          <Panel title="Company">
            <div className="mb-3 font-semibold">{co.name} <span className="font-normal text-muted-foreground">· {co.domain}</span></div>
            <dl className="space-y-3 text-sm">
              <Row icon={Building2} k="Industry" v={`${co.industry} · ${co.fundingStage}`} />
              <Row icon={Users} k="Size" v={`${co.employees.toLocaleString()} employees · ${co.revenueBand}`} />
              <Row icon={MapPin} k="HQ" v={`${co.hq} · ${co.region}`} />
            </dl>
            <div className="mt-4 flex flex-wrap gap-1.5">{co.techStack.map((t) => <Chip key={t}>{t}</Chip>)}</div>
          </Panel>
          <Panel title="Buying signals">
            {co.signals.length === 0 ? <p className="text-sm text-muted-foreground">No recent signals detected.</p> : (
              <ul className="space-y-3">
                {[...co.signals].sort((a, b) => a.daysAgo - b.daysAgo).map((s) => (
                  <li key={s.type} className="flex gap-3 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div><div className="font-medium">{s.type}</div><div className="text-xs text-muted-foreground">{co.name} {s.detail} · {s.daysAgo} days ago</div></div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

function Row({ icon: Icon, k, v }: { icon: typeof Mail; k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="truncate">{v}</dd></div>
    </div>
  );
}
