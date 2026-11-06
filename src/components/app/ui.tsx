import type { ReactNode } from "react";
import type { CampaignStatus, Qualification, ReviewStatus } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: string; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">{eyebrow}</div>}
        <h1 className="text-2xl font-bold text-foreground md:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className, bodyClassName }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={cn("rounded-lg border bg-card shadow-[var(--shadow-card)]", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
          <h2 className="text-sm font-semibold">{title}</h2>
          {action}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">{label}{icon}</div>
      <div className="mt-2 font-display text-3xl font-bold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function scoreTone(score: number) {
  return score >= 75 ? "bg-success-soft text-success" : score >= 60 ? "bg-warning-soft text-warning" : "bg-muted text-muted-foreground";
}

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  return <span className={cn("inline-flex min-w-9 justify-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums", scoreTone(score), className)}>{score}</span>;
}

const QUAL: Record<Qualification, string> = {
  Qualified: "bg-success-soft text-success",
  Review: "bg-warning-soft text-warning",
  "Low Fit": "bg-muted text-muted-foreground",
};
export function QualificationBadge({ value }: { value: Qualification }) {
  return <span className={cn("inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium", QUAL[value])}>{value}</span>;
}

const REVIEW: Record<ReviewStatus, string> = {
  Pending: "border-border text-muted-foreground",
  Approved: "border-primary/30 bg-primary/10 text-primary",
  Rejected: "border-destructive/30 bg-destructive/10 text-destructive",
  Saved: "border-hot/30 bg-hot-soft text-hot",
};
export function ReviewBadge({ value }: { value: ReviewStatus }) {
  return <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium", REVIEW[value])}>{value}</span>;
}

const CSTATUS: Record<CampaignStatus, [string, string]> = {
  draft: ["Draft", "bg-muted text-muted-foreground"],
  running: ["Running", "bg-warning-soft text-warning"],
  complete: ["Complete", "bg-success-soft text-success"],
};
export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const [label, cls] = CSTATUS[status];
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", cls)}>{status === "running" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />}{label}</span>;
}

export function SyntheticTag({ compact = false }: { compact?: boolean }) {
  return <span className="inline-flex whitespace-nowrap rounded border border-dashed border-muted-foreground/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{compact ? "Synthetic" : "Synthetic data"}</span>;
}

export function DemoTag({ children = "DEMO" }: { children?: ReactNode }) {
  return <span className="inline-flex rounded border border-warning/40 bg-warning-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">{children}</span>;
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.split(" ").map((p) => p.replace("Al-", "")[0]).slice(0, 2).join("");
  return <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground", className)}>{initials}</div>;
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center rounded-md border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{children}</span>;
}

export function pageHead(title: string, description: string) {
  const t = `${title} · ProjectX`;
  return {
    meta: [
      { title: t },
      { name: "description", content: description },
      { property: "og:title", content: t },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
