import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, RefreshCw, Save, Sparkles, AlertTriangle, ArrowLeft, Bookmark, Building2, Check, CheckCircle2, Globe, Mail, MapPin, Send, Users, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { Avatar, Chip, Panel, QualificationBadge, ReviewBadge, SyntheticTag, pageHead, scoreTone } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { nextAction, selectionReasons } from "@/lib/demo/engine";
import { formatTime, useDemo } from "@/lib/demo/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewStatus, Tone } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leads/$id")({
  head: () => pageHead("Lead Profile", "Prospect profile with explainable lead score and recommended next action."),
  component: LeadProfile,
});

function LeadProfile() {
  const { id } = Route.useParams();
  const { leads, companies, contacts, campaigns, setReview } = useDemo();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return <p className="text-sm text-muted-foreground">Prospect not found. <Link to="/leads" search={{ campaign: undefined, qual: undefined }} className="text-primary">Back to leads</Link></p>;
  const ct = contacts.get(lead.contactId)!;
  const co = companies.get(lead.companyId)!;
  const campaign = campaigns.find((c) => c.id === lead.campaignId);
  const { positives, concerns } = selectionReasons(lead);
  const action = nextAction(lead);
  const act = (r: ReviewStatus) => { setReview([lead.id], r); toast.success(`Prospect ${r === "Saved" ? "saved" : r.toLowerCase()}`); };

  return (
    <>
      <Link to="/leads" search={{ campaign: lead.campaignId, qual: undefined }} className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3" /> Back to leads</Link>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <Avatar name={ct.name} className="h-14 w-14 text-base" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{ct.name}</h1>
          <p className="text-sm text-muted-foreground">{ct.title} at {co.name} · {campaign?.name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2"><span className="font-mono text-xs text-muted-foreground">{co.prospectId}</span><QualificationBadge value={lead.qualification} /><ReviewBadge value={lead.review} /><SyntheticTag /></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={lead.review === "Rejected" ? "secondary" : "outline"} onClick={() => act("Rejected")}><X className="h-4 w-4" /> Reject</Button>
          <Button variant={lead.review === "Saved" ? "secondary" : "outline"} onClick={() => act("Saved")}><Bookmark className="h-4 w-4" /> Save</Button>
          <Button variant={lead.review === "Approved" ? "secondary" : "default"} onClick={() => act("Approved")}><Check className="h-4 w-4" /> {lead.review === "Approved" ? "Approved" : "Approve"}</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-[180px_1fr]">
            <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-5 text-center shadow-[var(--shadow-card)]">
              <div className="text-xs font-medium text-muted-foreground">Lead score</div>
              <div className={cn("mt-2 flex h-24 w-24 items-center justify-center rounded-full font-display text-4xl font-bold tabular-nums", scoreTone(lead.score))}>{lead.score}</div>
              <div className="mt-2 text-xs text-muted-foreground">out of 100</div>
              <div className="mt-3"><QualificationBadge value={lead.qualification} /></div>
            </div>
            <div className="rounded-lg border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">Recommended next action</div>
              <div className="mt-2 text-lg font-bold">{action.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{action.detail}</p>
              <div className="mt-3 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Qualification: </span>{lead.explanation}</div>
              {lead.review !== "Rejected" && <Button size="sm" variant="outline" className="mt-4" asChild><Link to="/outreach" search={{ lead: lead.id }}><Send className="h-3.5 w-3.5" /> Open in Outreach</Link></Button>}
            </div>
          </div>

          {lead.qualification !== "Low Fit" && lead.review !== "Rejected" && <OutreachPanel key={lead.id} leadId={lead.id} />}

          <Panel title="Score breakdown" action={<span className="text-xs text-muted-foreground">Weights 30 / 20 / 20 / 30</span>}>
            <div className="mb-5 flex h-2.5 overflow-hidden rounded-full bg-muted">
              {lead.factors.map((f, i) => <div key={f.key} style={{ width: `${f.points}%`, background: `var(--chart-${i + 1})` }} />)}
            </div>
            <div className="space-y-4">
              {lead.factors.map((f, i) => (
                <div key={f.key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: `var(--chart-${i + 1})` }} />{f.label} <span className="font-normal text-muted-foreground">({f.weight}%)</span></span>
                    <span className="font-semibold tabular-nums">{f.points} <span className="font-normal text-muted-foreground">/ {f.weight}</span></span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${(f.points / f.weight) * 100}%`, background: `var(--chart-${i + 1})` }} /></div>
                  <p className="mt-1 text-xs text-muted-foreground">{f.reason}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-md bg-muted/60 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono font-semibold tabular-nums">{lead.factors.map((f) => f.points).join(" + ")} = {lead.score}</span>
            </div>
          </Panel>

          <Panel title="Reasons for selection">
            <ul className="space-y-2">
              {positives.map((r) => <li key={r} className="flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />{r}</li>)}
              {positives.length === 0 && <li className="text-sm text-muted-foreground">No strong matching factors.</li>}
            </ul>
            {concerns.length > 0 && (
              <>
                <div className="mb-2 mt-5 text-xs font-medium text-muted-foreground">Concerns</div>
                <ul className="space-y-2">{concerns.map((r) => <li key={r} className="flex gap-2 text-sm text-muted-foreground"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />{r}</li>)}</ul>
              </>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Decision-maker">
            <div className="mb-3 font-semibold">{ct.name}</div>
            <dl className="space-y-3 text-sm">
              <Row icon={Users} k="Position" v={`${ct.title} · ${ct.seniority}`} />
              <Row icon={Mail} k="Email (fictional, not verified)" v={<>{ct.email.split("@")[0]}<wbr />@{ct.email.split("@")[1]}</>} />
              <Row icon={Zap} k="Time in role" v={`${ct.tenureMonths} months`} />
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{ct.summary}</p>
          </Panel>
          <Panel title="Company overview">
            <div className="mb-2 font-semibold">{co.name}</div>
            <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{co.description}</p>
            <dl className="space-y-3 text-sm">
              <Row icon={Building2} k="Industry" v={`${co.sector} · ${co.industry}`} />
              <Row icon={Users} k="Company size" v={`${co.employees} employees · ${co.sizeCategory}`} />
              <Row icon={MapPin} k="Location" v={`${co.city}, ${co.country}`} />
              <Row icon={Globe} k="Website (fictional)" v={co.website.replace("https://", "")} />
            </dl>
            <div className="mt-4 flex flex-wrap gap-1.5"><Chip>Founded {co.founded}</Chip></div>
          </Panel>
          <Panel title="Record details" action={<SyntheticTag />}>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-xs text-muted-foreground">Prospect ID</dt><dd className="font-mono">{co.prospectId}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Source</dt><dd>{co.source}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Context note (fictional)</dt><dd>{co.name} {co.contextNote}.</dd></div>
            </dl>
            <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">All companies, people, emails and websites in this record are invented for demonstration. Contact details are not verified.</p>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Row({ icon: Icon, k, v }: { icon: typeof Mail; k: string; v: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="break-words">{v}</dd></div>
    </div>
  );
}

function OutreachPanel({ leadId }: { leadId: string }) {
  const { drafts, buildDraft, saveDraft } = useDemo();
  const saved = drafts[leadId];
  const [subject, setSubject] = useState(saved?.subject ?? "");
  const [body, setBody] = useState(saved?.body ?? "");
  const [meta, setMeta] = useState({ tone: saved?.tone ?? ("friendly" as Tone), variant: saved?.variant ?? 0 });
  useEffect(() => {
    if (saved && !subject && !body) { setSubject(saved.subject); setBody(saved.body); setMeta({ tone: saved.tone, variant: saved.variant }); }
  }, [saved]); // eslint-disable-line react-hooks/exhaustive-deps
  const has = !!subject || !!body;
  const generate = () => {
    const v = has ? meta.variant + 1 : meta.variant;
    const d = buildDraft(leadId, meta.tone, v);
    if (!d) return;
    setSubject(d.subject); setBody(d.body); setMeta({ tone: d.tone, variant: d.variant });
  };
  const onSave = () => { saveDraft({ leadId, tone: meta.tone, variant: meta.variant, subject, body }); toast.success("Draft saved"); };
  const onCopy = async () => {
    try { await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`); toast.success("Draft copied to clipboard"); }
    catch { toast.error("Copy failed — select the text and copy manually"); }
  };
  return (
    <Panel title="Outreach draft" action={<span className="inline-flex h-5 items-center rounded-full border bg-muted px-2 text-[11px] font-medium text-muted-foreground">Not sent · demo only</span>}>
      {!has ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">Write a personalised email using this prospect's name, title, company, industry, the fictional company context and your offering.</p>
          <Button onClick={generate}><Sparkles className="h-4 w-4" /> Generate Outreach</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Subject</span><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></label>
          <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Message</span><Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} className="leading-relaxed" /></label>
          <div className="flex flex-wrap items-center gap-2 border-t pt-3">
            <span className="text-xs text-muted-foreground">{saved ? `Saved ${formatTime(saved.savedAt)}` : "Not saved yet"}</span>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button variant="ghost" onClick={generate}><RefreshCw className="h-4 w-4" /> Regenerate</Button>
              <Button variant="outline" onClick={onCopy}><Copy className="h-4 w-4" /> Copy</Button>
              <Button onClick={onSave} disabled={!subject.trim() || !body.trim()}><Save className="h-4 w-4" /> Save draft</Button>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
