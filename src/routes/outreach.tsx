import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Copy, Mail, RefreshCw, Save, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar, PageHeader, Panel, ReviewBadge, ScoreBadge, pageHead } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatTime, useDemo } from "@/lib/demo/store";
import type { Tone } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/outreach")({
  validateSearch: (s: Record<string, unknown>): { lead?: string | undefined } => ({ lead: typeof s["lead"] === "string" ? s["lead"] : undefined }),
  head: () => pageHead("Outreach", "Generate, edit, save and copy personalised outreach drafts. Messages are never sent."),
  component: Outreach,
});

const REVIEW_ORDER = { Approved: 0, Saved: 1, Pending: 2, Rejected: 3 } as const;

function Outreach() {
  const { leads, contacts, companies, drafts, buildDraft, saveDraft } = useDemo();
  const { lead: leadParam } = Route.useSearch();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [view, setView] = useState<"prospects" | "saved">("prospects");

  const candidates = useMemo(() => leads
    .filter((l) => l.review !== "Rejected" && (l.qualification !== "Low Fit" || l.review !== "Pending"))
    .sort((a, b) => REVIEW_ORDER[a.review] - REVIEW_ORDER[b.review] || b.score - a.score), [leads]);
  const list = (view === "saved" ? leads.filter((l) => drafts[l.id]) : candidates).filter((l) => {
    if (!q) return true;
    return `${contacts.get(l.contactId)!.name} ${companies.get(l.companyId)!.name}`.toLowerCase().includes(q.toLowerCase());
  });
  const selectedId = leadParam && leads.some((l) => l.id === leadParam) ? leadParam : candidates[0]?.id;
  const lead = leads.find((l) => l.id === selectedId);
  const saved = selectedId ? drafts[selectedId] : undefined;

  const [tone, setTone] = useState<Tone>("friendly");
  const [variant, setVariant] = useState(0);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (saved) { setTone(saved.tone); setVariant(saved.variant); setSubject(saved.subject); setBody(saved.body); setGenerated(true); }
    else { setSubject(""); setBody(""); setGenerated(false); setVariant(0); }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const generate = (t: Tone, v: number) => {
    if (!selectedId) return;
    const d = buildDraft(selectedId, t, v);
    if (!d) return;
    setTone(t); setVariant(v); setSubject(d.subject); setBody(d.body); setGenerated(true);
  };
  const onSave = () => { if (selectedId) { saveDraft({ leadId: selectedId, tone, variant, subject, body }); toast.success("Draft saved"); } };
  const onCopy = async () => {
    try { await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`); toast.success("Draft copied to clipboard"); }
    catch { toast.error("Copy failed — select the text and copy manually"); }
  };
  const dirty = !!saved && (saved.subject !== subject || saved.body !== body);

  return (
    <>
      <PageHeader title="Personalised outreach" description="Generate drafts from each prospect's role, company, city and buying signals. Edit, save or copy them into your own email client." />
      <div className="mb-6 flex items-center gap-2 rounded-md border bg-accent/50 px-3 py-2 text-xs text-accent-foreground"><ShieldCheck className="h-3.5 w-3.5" /> Demo mode: ProjectX never sends messages. Drafts stay in this browser.</div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="flex max-h-[75vh] flex-col rounded-lg border bg-card shadow-[var(--shadow-card)]">
          <div className="space-y-3 border-b p-3">
            <Tabs value={view} onValueChange={(v) => setView(v as "prospects" | "saved")}>
              <TabsList className="w-full"><TabsTrigger value="prospects" className="flex-1">Prospects</TabsTrigger><TabsTrigger value="saved" className="flex-1">Saved drafts ({Object.keys(drafts).length})</TabsTrigger></TabsList>
            </Tabs>
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8" placeholder="Select a prospect" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search prospects" /></div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {list.map((l) => {
              const ct = contacts.get(l.contactId)!; const co = companies.get(l.companyId)!;
              return (
                <button key={l.id} onClick={() => navigate({ to: "/outreach", search: { lead: l.id } })} className={cn("flex w-full items-center gap-3 border-b px-4 py-3 text-left last:border-0 hover:bg-muted/40", selectedId === l.id && "bg-accent")}>
                  <Avatar name={ct.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate text-sm font-medium">{ct.name}{drafts[l.id] && <Mail className="h-3 w-3 text-primary" />}</div>
                    <div className="truncate text-xs text-muted-foreground">{co.name} · {co.city}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1"><ScoreBadge score={l.score} /><ReviewBadge value={l.review} /></div>
                </button>
              );
            })}
            {list.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">{view === "saved" ? "No saved drafts yet." : "No prospects found."}</p>}
          </div>
        </div>

        {lead ? (() => {
          const ct = contacts.get(lead.contactId)!; const co = companies.get(lead.companyId)!;
          return (
            <Panel title={<span>To: {ct.name} <span className="font-normal text-muted-foreground">· {ct.email}</span></span>} action={<Link to="/leads/$id" params={{ id: lead.id }} className="text-xs font-medium text-primary">View profile</Link>}>
              <div className="mb-4 text-xs text-muted-foreground">{ct.title} at {co.name}, {co.city} · score {lead.score} · {co.prospectId} · Synthetic Demo Dataset</div>
              <div className="flex flex-wrap items-center gap-3">
                <ToggleGroup type="single" size="sm" variant="outline" value={tone} onValueChange={(v) => v && (generated ? generate(v as Tone, 0) : setTone(v as Tone))} aria-label="Tone">
                  <ToggleGroupItem value="friendly">Friendly</ToggleGroupItem>
                  <ToggleGroupItem value="formal">Formal</ToggleGroupItem>
                  <ToggleGroupItem value="concise">Concise</ToggleGroupItem>
                </ToggleGroup>
                {generated ? (
                  <Button variant="ghost" size="sm" onClick={() => generate(tone, variant + 1)}><RefreshCw className="h-3.5 w-3.5" /> Regenerate</Button>
                ) : null}
                {saved && <span className="ml-auto text-xs text-muted-foreground">Saved {formatTime(saved.savedAt)}{dirty ? " · unsaved changes" : ""}</span>}
              </div>

              {!generated ? (
                <div className="mt-6 flex flex-col items-center rounded-lg border border-dashed py-16 text-center">
                  <Sparkles className="mb-3 h-6 w-6 text-primary" />
                  <p className="text-sm text-muted-foreground">No draft yet for {ct.name.split(" ")[0]}.</p>
                  <Button className="mt-4" onClick={() => generate(tone, 0)}><Sparkles className="h-4 w-4" /> Generate personalised draft</Button>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div><label className="text-xs font-medium text-muted-foreground" htmlFor="subject">Subject</label><Input id="subject" className="mt-1.5" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground" htmlFor="body">Message</label><Textarea id="body" className="mt-1.5 min-h-[360px] text-sm leading-relaxed" value={body} onChange={(e) => setBody(e.target.value)} /></div>
                  <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
                    <span className="mr-auto inline-flex h-5 items-center rounded-full border bg-muted px-2 text-[11px] font-medium text-muted-foreground">Not sent · demo only</span>
                    <Button variant="outline" onClick={onCopy}><Copy className="h-4 w-4" /> Copy draft</Button>
                    <Button onClick={onSave} disabled={!subject.trim() || !body.trim()}><Save className="h-4 w-4" /> Save draft</Button>
                  </div>
                </div>
              )}
            </Panel>
          );
        })() : (
          <Panel><p className="py-16 text-center text-sm text-muted-foreground">Select a prospect to start. <Link to="/campaigns/new" className="text-primary">Run a campaign</Link> to discover prospects.</p></Panel>
        )}
      </div>
    </>
  );
}
