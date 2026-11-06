import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar, PageHeader, ScoreBadge, StatusBadge, pageHead } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDUSTRIES } from "@/lib/demo/data";
import { useDemo } from "@/lib/demo/store";

export const Route = createFileRoute("/leads/")({
  validateSearch: (s: Record<string, unknown>): { campaign?: string | undefined } => ({ campaign: typeof s["campaign"] === "string" ? s["campaign"] : undefined }),
  head: () => pageHead("Leads", "Discovered and qualified prospects ranked by explainable AI lead score."),
  component: Leads,
});

function Leads() {
  const { leads, campaigns, companies, contacts, setStatus } = useDemo();
  const { campaign } = Route.useSearch();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [status, setSt] = useState("all");
  const [sel, setSel] = useState<Set<string>>(new Set());

  const rows = useMemo(() => leads
    .filter((l) => !campaign || l.campaignId === campaign)
    .filter((l) => tier === "all" || l.tier === tier)
    .filter((l) => status === "all" || l.status === status)
    .filter((l) => industry === "all" || companies.get(l.companyId)!.industry === industry)
    .filter((l) => {
      if (!q) return true;
      const s = `${contacts.get(l.contactId)!.name} ${companies.get(l.companyId)!.name} ${contacts.get(l.contactId)!.title}`.toLowerCase();
      return s.includes(q.toLowerCase());
    })
    .sort((a, b) => b.score - a.score), [leads, campaign, tier, status, industry, q, companies, contacts]);

  const bulk = (s: "approved" | "rejected") => {
    setStatus([...sel], s); toast.success(`${sel.size} lead${sel.size > 1 ? "s" : ""} ${s}`); setSel(new Set());
  };

  return (
    <>
      <PageHeader title="Leads" description={`${rows.length} prospects, ranked by score. Click any lead to see why the agent qualified it.`} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search name, company, title" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={campaign ?? "all"} onValueChange={(v) => navigate({ to: "/leads", search: { campaign: v === "all" ? undefined : v } })}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All campaigns</SelectItem>{campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={tier} onValueChange={setTier}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All tiers</SelectItem>{["Hot", "Warm", "Cold"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All industries</SelectItem>{INDUSTRIES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={status} onValueChange={setSt}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {[["qualified", "Awaiting approval"], ["approved", "Approved"], ["contacted", "Contacted"], ["replied", "Replied"], ["meeting", "Meeting booked"], ["rejected", "Rejected"]].map(([v, l]) => <SelectItem key={v} value={v!}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        {sel.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{sel.size} selected</span>
            <Button size="sm" variant="outline" onClick={() => bulk("rejected")}><X className="h-3.5 w-3.5" /> Reject</Button>
            <Button size="sm" onClick={() => bulk("approved")}><Check className="h-3.5 w-3.5" /> Approve</Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-3"><Checkbox checked={rows.length > 0 && sel.size === rows.length} onCheckedChange={(v) => setSel(v ? new Set(rows.map((r) => r.id)) : new Set())} aria-label="Select all" /></th>
              <th className="px-3 py-3 font-medium">Prospect</th>
              <th className="px-3 py-3 font-medium">Company</th>
              <th className="px-3 py-3 font-medium">Top signal</th>
              <th className="px-3 py-3 font-medium">Score</th>
              <th className="px-3 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((l) => {
              const ct = contacts.get(l.contactId)!; const co = companies.get(l.companyId)!;
              return (
                <tr key={l.id} className="cursor-pointer hover:bg-muted/40" onClick={() => navigate({ to: "/leads/$id", params: { id: l.id } })}>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={sel.has(l.id)} onCheckedChange={(v) => { const n = new Set(sel); v ? n.add(l.id) : n.delete(l.id); setSel(n); }} aria-label={`Select ${ct.name}`} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3"><Avatar name={ct.name} />
                      <div><Link to="/leads/$id" params={{ id: l.id }} className="font-medium hover:text-primary">{ct.name}</Link><div className="text-xs text-muted-foreground">{ct.title}</div></div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><div className="font-medium">{co.name}</div><div className="text-xs text-muted-foreground">{co.industry} · {co.employees.toLocaleString()} · {co.region}</div></td>
                  <td className="max-w-56 truncate px-3 py-3 text-xs text-muted-foreground">{co.signals[0] ? `${co.signals[0].type}: ${co.signals[0].detail}` : "—"}</td>
                  <td className="px-3 py-3"><ScoreBadge score={l.score} tier={l.tier} /></td>
                  <td className="px-3 py-3"><StatusBadge status={l.status} /></td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No leads match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
