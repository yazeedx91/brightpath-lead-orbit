import { Link, createFileRoute } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { useState } from "react";
import { DraftEditor } from "@/components/app/DraftEditor";
import { Avatar, PageHeader, Panel, ScoreBadge, pageHead } from "@/components/app/ui";
import { useDemo } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/outreach")({
  head: () => pageHead("Outreach", "Review, edit and approve AI-personalised outreach drafts."),
  component: Outreach,
});

function Outreach() {
  const { leads, contacts, companies } = useDemo();
  const queue = leads.filter((l) => l.status === "qualified" && l.tier !== "Cold").sort((a, b) => b.score - a.score);
  const approved = leads.filter((l) => l.status === "approved").length;
  const [selected, setSelected] = useState<string | null>(null);
  const active = queue.find((l) => l.id === selected) ?? queue[0];

  return (
    <>
      <PageHeader title="Outreach approval" description="Every message is drafted by the agent and waits for your approval. Nothing is sent without a human decision." actions={<div className="rounded-md border bg-card px-3 py-2 text-xs"><span className="font-semibold tabular-nums">{queue.length}</span> to review · <span className="font-semibold tabular-nums">{approved}</span> approved</div>} />
      {queue.length === 0 ? (
        <Panel><div className="flex flex-col items-center py-12 text-center text-sm text-muted-foreground"><Inbox className="mb-3 h-8 w-8" />Inbox zero. <Link to="/campaigns/new" className="mt-1 text-primary">Launch a campaign</Link> to generate new drafts.</div></Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="max-h-[70vh] overflow-y-auto rounded-lg border bg-card shadow-[var(--shadow-card)]">
            {queue.map((l) => {
              const ct = contacts.get(l.contactId)!; const co = companies.get(l.companyId)!;
              return (
                <button key={l.id} onClick={() => setSelected(l.id)} className={cn("flex w-full items-center gap-3 border-b px-4 py-3 text-left last:border-0 hover:bg-muted/40", active?.id === l.id && "bg-accent")}>
                  <Avatar name={ct.name} />
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{ct.name}</div><div className="truncate text-xs text-muted-foreground">{co.name}</div></div>
                  <ScoreBadge score={l.score} tier={l.tier} />
                </button>
              );
            })}
          </div>
          {active && (
            <Panel title={`To: ${contacts.get(active.contactId)!.name} · ${companies.get(active.companyId)!.name}`} action={<Link to="/leads/$id" params={{ id: active.id }} className="text-xs font-medium text-primary">View profile</Link>}>
              <DraftEditor key={active.id} leadId={active.id} onDone={() => setSelected(null)} />
            </Panel>
          )}
        </div>
      )}
    </>
  );
}
