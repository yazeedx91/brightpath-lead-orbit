import type { ReactNode } from "react";
import type { LeadStatus, Tier } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: string; actions?: ReactNode; eyebrow?: string }) {
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

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border bg-card shadow-[var(--shadow-card)]", className)}>
      {title && (
        <div className="flex items-center justify-between border-b px-5 py-3.5">
          <h2 className="text-sm font-semibold">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

const TIER: Record<Tier, string> = {
  Hot: "bg-hot-soft text-hot",
  Warm: "bg-warning-soft text-warning",
  Cold: "bg-muted text-muted-foreground",
};

export function ScoreBadge({ score, tier }: { score: number; tier: Tier }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums", TIER[tier])}>
      {score} <span className="font-medium opacity-80">{tier}</span>
    </span>
  );
}

const STATUS: Record<LeadStatus, string> = {
  qualified: "bg-accent text-accent-foreground",
  approved: "bg-primary/10 text-primary",
  rejected: "bg-muted text-muted-foreground line-through",
  contacted: "bg-secondary text-secondary-foreground",
  replied: "bg-success-soft text-success",
  meeting: "bg-success text-primary-foreground",
};
const STATUS_LABEL: Record<LeadStatus, string> = {
  qualified: "Awaiting approval",
  approved: "Approved",
  rejected: "Rejected",
  contacted: "Contacted",
  replied: "Replied",
  meeting: "Meeting booked",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS[status])}>{STATUS_LABEL[status]}</span>;
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
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
