import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Compass, X } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { SAMPLE_ID, useDemo } from "@/lib/demo/store";

const STEPS = [
  { title: "Create a campaign", body: "A campaign tells the agent who to target. This editable sample brief focuses on Saudi logistics companies and their operations leaders." },
  { title: "Launch the agent", body: "The agent validates the brief and works through each stage locally. Use Skip to results at any time." },
  { title: "Discover prospects", body: "Every discovered prospect appears here with a lead score, qualification and review status. Search, filter, sort, approve, reject or save." },
  { title: "Qualify leads", body: "Each score is explained: four weighted components, reasons for selection and a recommended next action." },
  { title: "Generate outreach", body: "Draft a personalised email from the prospect's role, company and context. Edit, save or copy it. Nothing is ever sent." },
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
        case 2: return navigate({ to: "/leads", search: { campaign: SAMPLE_ID, qual: undefined } });
        case 3: return topLead ? navigate({ to: "/leads/$id", params: { id: topLead.id } }) : navigate({ to: "/leads", search: { campaign: SAMPLE_ID, qual: undefined } });
        default: return navigate({ to: "/outreach", search: { lead: topLead?.id } });
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
      <div className="mt-3 flex h-1 gap-1" aria-hidden>
        {STEPS.map((s, i) => <span key={s.title} className={i <= guideStep ? "flex-1 rounded-full bg-primary" : "flex-1 rounded-full bg-muted"} />)}
      </div>
      <div className="mt-3 flex justify-between">
        <Button size="sm" variant="ghost" disabled={guideStep === 0} onClick={() => go(guideStep - 1, false)}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
        {last ? (
          <Button size="sm" onClick={() => setGuideStep(null)}>Finish guide</Button>
        ) : (
          <Button size="sm" onClick={() => go(guideStep + 1, true)}>Next <ArrowRight className="h-3.5 w-3.5" /></Button>
        )}
      </div>
    </div>
  );
}
