import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ArrowUpDown, Bookmark, Check, ExternalLink, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader, QualificationBadge, ReviewBadge, ScoreBadge, pageHead } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDemo } from "@/lib/demo/store";
import type { ReviewStatus } from "@/lib/demo/types";

export const Route = createFileRoute("/leads/")({
  validateSearch: (s: Record<string, unknown>): { campaign?: string | undefined } => ({ campaign: typeof s["campaign"] === "string" ? s["campaign"] : undefined }),
  head: () => pageHead("Leads", "Discovered prospects with lead scores, qualification and review status."),
  component: Leads,
});

type SortKey = "score" | "company" | "contact" | "size";

function Leads() {
  const { leads, campaigns, companies, contacts, setReview } = useDemo();
  const { campaign } = Route.useSearch();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [qual, setQual] = useState("all");
  const [rev, setRev] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "score", dir: -1 });
  const [sel, setSel] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    const list = leads
      .filter((l) => !campaign || l.campaignId === campaign)
      .filter((l) => qual === "all" || l.qualification === qual)
      .filter((l) => rev === "all" || l.review === rev)
      .map((l) => ({ l, co: companies.get(l.companyId)!, ct: contacts.get(l.contactId)! }))
      .filter(({ co, ct }) => !q || `${ct.name} ${co.name} ${ct.title} ${co.city}`.toLowerCase().includes(q.toLowerCase()));
    const val = (r: (typeof list)[number]): number | string =>
      sort.key === "score" ? r.l.score : sort.key === "company" ? r.co.name : sort.key === "contact" ? r.ct.name : r.co.employees;
    return list.sort((a, b) => { const x = val(a); const y = val(b); return (x < y ? -1 : x > y ? 1 : 0) * sort.dir; });
  }, [leads, campaign, qual, rev, q, sort, companies, contacts]);

  const act = (ids: string[], r: ReviewStatus) => {
    setReview(ids, r);
    toast.success(`${ids.length} prospect${ids.length > 1 ? "s" : ""} ${r === "Saved" ? "saved" : r.toLowerCase()}`);
    setSel(new Set());
  };
  const toggleSort = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : key === "score" || key === "size" ? -1 : 1 }));
  const SortHead = ({ k, children }: { k: SortKey; children: string }) => (
    <button className="inline-flex items-center gap-1 font-medium hover:text-foreground" onClick={() => toggleSort(k)}>
      {children}{sort.key === k ? (sort.dir === -1 ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
    </button>
  );
  const counts = { all: rows.length, approved: rows.filter((r) => r.l.review === "Approved").length };

  return (
    <>
      <PageHeader title="Lead discovery" description={`${counts.all} prospects shown · ${counts.approved} approved. Open any prospect to see why the agent selected it.`} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search prospects" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search prospects" />
        </div>
        <Select value={campaign ?? "all"} onValueChange={(v) => navigate({ to: "/leads", search: { campaign: v === "all" ? undefined : v } })}>
          <SelectTrigger className="w-56" aria-label="Campaign"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All campaigns</SelectItem>{campaigns.filter((c) => c.status === "complete").map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={qual} onValueChange={setQual}>
          <SelectTrigger className="w-44" aria-label="Qualification"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All qualification</SelectItem>{["Qualified", "Needs review", "Not qualified"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={rev} onValueChange={setRev}>
          <SelectTrigger className="w-40" aria-label="Review status"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All reviews</SelectItem>{["Pending", "Approved", "Saved", "Rejected"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        {sel.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{sel.size} selected</span>
            <Button size="sm" variant="outline" onClick={() => act([...sel], "Rejected")}><X className="h-3.5 w-3.5" /> Reject</Button>
            <Button size="sm" variant="outline" onClick={() => act([...sel], "Saved")}><Bookmark className="h-3.5 w-3.5" /> Save</Button>
            <Button size="sm" onClick={() => act([...sel], "Approved")}><Check className="h-3.5 w-3.5" /> Approve</Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[1180px] text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-3"><Checkbox checked={rows.length > 0 && sel.size === rows.length} onCheckedChange={(v) => setSel(v ? new Set(rows.map((r) => r.l.id)) : new Set())} aria-label="Select all" /></th>
              <th className="px-3 py-3"><SortHead k="company">Company</SortHead></th>
              <th className="px-3 py-3"><SortHead k="contact">Contact person</SortHead></th>
              <th className="px-3 py-3 font-medium">Job title</th>
              <th className="px-3 py-3 font-medium">Industry</th>
              <th className="px-3 py-3 font-medium">Location</th>
              <th className="px-3 py-3"><SortHead k="size">Company size</SortHead></th>
              <th className="px-3 py-3"><SortHead k="score">Lead score</SortHead></th>
              <th className="px-3 py-3 font-medium">Qualification</th>
              <th className="px-3 py-3 font-medium">Review</th>
              <th className="px-3 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(({ l, co, ct }) => (
              <tr key={l.id} className="hover:bg-muted/40">
                <td className="px-4 py-3"><Checkbox checked={sel.has(l.id)} onCheckedChange={(v) => { const n = new Set(sel); if (v) n.add(l.id); else n.delete(l.id); setSel(n); }} aria-label={`Select ${ct.name}`} /></td>
                <td className="px-3 py-3 font-medium">{co.name}</td>
                <td className="px-3 py-3"><Link to="/leads/$id" params={{ id: l.id }} className="font-medium text-primary hover:underline">{ct.name}</Link></td>
                <td className="px-3 py-3 text-muted-foreground">{ct.title}</td>
                <td className="px-3 py-3 text-muted-foreground">{co.industry}</td>
                <td className="px-3 py-3 text-muted-foreground">{co.city}, {co.country}</td>
                <td className="px-3 py-3 tabular-nums text-muted-foreground">{co.employees.toLocaleString("en-US")}</td>
                <td className="px-3 py-3"><ScoreBadge score={l.score} /></td>
                <td className="px-3 py-3"><QualificationBadge value={l.qualification} /></td>
                <td className="px-3 py-3"><ReviewBadge value={l.review} /></td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1">
                    <IconAction label="Approve" active={l.review === "Approved"} onClick={() => act([l.id], "Approved")}><Check className="h-4 w-4" /></IconAction>
                    <IconAction label="Reject" active={l.review === "Rejected"} onClick={() => act([l.id], "Rejected")}><X className="h-4 w-4" /></IconAction>
                    <IconAction label="Save" active={l.review === "Saved"} onClick={() => act([l.id], "Saved")}><Bookmark className="h-4 w-4" /></IconAction>
                    <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8" asChild><Link to="/leads/$id" params={{ id: l.id }} aria-label="Open profile"><ExternalLink className="h-4 w-4" /></Link></Button></TooltipTrigger><TooltipContent>Open profile</TooltipContent></Tooltip>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={11} className="py-14 text-center text-sm text-muted-foreground">No prospects match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function IconAction({ label, active, onClick, children }: { label: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant={active ? "secondary" : "ghost"} className="h-8 w-8" onClick={onClick} aria-label={label} aria-pressed={active}>{children}</Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
