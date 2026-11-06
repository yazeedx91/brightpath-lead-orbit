import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Compass, X } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { SAMPLE_ID, useDemo } from "@/lib/demo/store";

const STEPS = [
  { title: "Campaign brief", body: "This editable sample brief tells the agent who to target: Saudi logistics companies and their operations leaders. Click Next to run the AI agent." },
  { title: "AI agent at work", body: "The agent works through 8 stages, from understanding the brief to drafting outreach. Everything here is a local simulation." },
  { title: "Review discovered leads", body: "Every prospect has a lead score, a qualification label and a review status. Approve, reject or save prospects from the table." },
  { title: "Explainable lead profile", body: "See exactly why the agent selected this prospect: the score breakdown, its reasons and the recommended next action." },
  { title: "Personalised outreach", body: "Generate a draft from the prospect's data, edit it, save it or copy it. Nothing is ever sent." },
  { title: "Campaign analytics", body: "All metrics come from the same demo data and update as you approve leads and save drafts." },
];

export function useGuide() {
  const { setGuideStep, runCampaign, leads } = useDemo();
  const navigate = useNavigate();
  const topLead = leads.filter((l) => l.campaignId === SAMPLE_ID).sort((a, b) => b.score - a.score)[0];

  const go = useCallback(
    (step: number, withAction: boolean) => {
      setGuideStep(step);
      switch (step) {
        case 0: return navigate({ to: "/campaigns/$id/edit", params: { id: SAMPLE_ID } });
        case 1:
          if (withAction) runCampaign(SAMPLE_ID);
          return navigate({ to: "/campaigns/$id/run", params: { id: SAMPLE_ID } });
        case 2: return navigate({ to: "/leads", search: { campaign: SAMPLE_ID } });
        case 3: return topLead ? navigate({ to: "/leads/$id", params: { id: topLead.id } }) : navigate({ to: "/leads", search: { campaign: SAMPLE_ID } });
        case 4: return navigate({ to: "/outreach", search: { lead: topLead?.id } });
        default: return navigate({ to: "/analytics" });
      }
    },
    [navigate, runCampaign, setGuideStep, topLead],
  );
  return { start: () => go(0, false), go, total: STEPS.length };
}

export function GuideCard() {
  const { guideStep, setGuideStep } = useDemo();
  const { go, total } = useGuide();
  if (guideStep === null) return null;
  const step = STEPS[guideStep];
  if (!step) return null;
  const last = guideStep === total - 1;
  return (
    <div className="fixed bottom-5 right-5 z-40 w-[340px] max-w-[calc(100vw-2.5rem)] rounded-lg border bg-card p-4 shadow-[var(--shadow-elevated)]">
      <div className="mb-2 flex items-center gap-2">
        <Compass className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Guided demo · {guideStep + 1}/{total}</span>
        <button className="ml-auto text-muted-foreground hover:text-foreground" onClick={() => setGuideStep(null)} aria-label="Exit guided demo"><X className="h-4 w-4" /></button>
      </div>
      <div className="font-display text-sm font-bold">{step.title}</div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
      <div className="mt-3 flex h-1 gap-1">
        {STEPS.map((s, i) => <span key={s.title} className={i <= guideStep ? "flex-1 rounded-full bg-primary" : "flex-1 rounded-full bg-muted"} />)}
      </div>
      <div className="mt-3 flex justify-between">
        <Button size="sm" variant="ghost" disabled={guideStep === 0} onClick={() => go(guideStep - 1, false)}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
        {last ? (
          <Button size="sm" onClick={() => setGuideStep(null)}>Finish</Button>
        ) : (
          <Button size="sm" onClick={() => go(guideStep + 1, true)}>Next <ArrowRight className="h-3.5 w-3.5" /></Button>
        )}
      </div>
    </div>
  );
}
