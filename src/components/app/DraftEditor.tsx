import { Check, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDemo } from "@/lib/demo/store";
import type { Tone } from "@/lib/demo/types";
import { Chip } from "./ui";

export function DraftEditor({ leadId, onDone }: { leadId: string; onDone?: () => void }) {
  const { getDraft, regenerateDraft, saveDraft, setStatus, leads } = useDemo();
  const draft = getDraft(leadId);
  const lead = leads.find((l) => l.id === leadId);
  const [subject, setSubject] = useState(draft?.subject ?? "");
  const [body, setBody] = useState(draft?.body ?? "");
  useEffect(() => { setSubject(draft?.subject ?? ""); setBody(draft?.body ?? ""); }, [draft?.subject, draft?.body, leadId]);
  if (!draft || !lead) return null;
  const dirty = subject !== draft.subject || body !== draft.body;
  const decided = lead.status !== "qualified";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup type="single" size="sm" variant="outline" value={draft.tone} onValueChange={(v) => v && regenerateDraft(leadId, v as Tone)}>
          <ToggleGroupItem value="friendly">Friendly</ToggleGroupItem>
          <ToggleGroupItem value="formal">Formal</ToggleGroupItem>
          <ToggleGroupItem value="concise">Concise</ToggleGroupItem>
        </ToggleGroup>
        <Button variant="ghost" size="sm" onClick={() => { regenerateDraft(leadId, draft.tone); toast("New variant generated"); }}><RefreshCw className="h-3.5 w-3.5" /> Regenerate</Button>
        {draft.edited && <span className="text-xs text-muted-foreground">Edited by you</span>}
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Subject</label>
        <Input className="mt-1.5" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <Textarea className="min-h-72 font-sans text-sm leading-relaxed" value={body} onChange={(e) => setBody(e.target.value)} />
      <div className="flex flex-wrap gap-1.5"><span className="mr-1 text-xs text-muted-foreground">Personalised with:</span>{draft.personalization.map((p) => <Chip key={p}>{p}</Chip>)}</div>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
        {dirty && <Button variant="ghost" onClick={() => { saveDraft(leadId, { subject, body }); toast.success("Draft saved"); }}>Save edits</Button>}
        {decided ? (
          <span className="text-sm text-muted-foreground">Decision recorded.</span>
        ) : (
          <>
            <Button variant="outline" onClick={() => { setStatus([leadId], "rejected"); toast("Lead rejected"); onDone?.(); }}><X className="h-4 w-4" /> Reject</Button>
            <Button onClick={() => { if (dirty) saveDraft(leadId, { subject, body }); setStatus([leadId], "approved"); toast.success("Approved and queued", { description: "Demo mode: no email is actually sent." }); onDone?.(); }}><Check className="h-4 w-4" /> Approve & queue</Button>
          </>
        )}
      </div>
    </div>
  );
}
