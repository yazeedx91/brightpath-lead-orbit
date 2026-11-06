import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, BarChart3, LayoutDashboard, Mail, Megaphone, RotateCcw, Sparkles, Users } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/activity", label: "Agent Activity", icon: Activity },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/outreach", label: "Outreach", icon: Mail },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { reset, leads } = useDemo();
  const pending = leads.filter((l) => l.status === "qualified" && l.tier !== "Cold").length;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="font-display text-sm font-bold text-sidebar-accent-foreground">ProjectX</div>
            <div className="text-[11px] text-sidebar-foreground/70">AI Lead Generation Agent</div>
          </div>
        </div>
        <nav className="mt-2 flex-1 space-y-0.5 px-3">
          {NAV.map((n) => {
            const active = "exact" in n ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <n.icon className="h-4 w-4" />
                <span className="flex-1">{n.label}</span>
                {n.to === "/outreach" && pending > 0 && (
                  <span className="rounded-full bg-sidebar-primary px-1.5 text-[10px] font-semibold text-sidebar-primary-foreground">{pending}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">MC</div>
            <div className="text-xs">
              <div className="font-medium text-sidebar-accent-foreground">Maya Chen</div>
              <div className="text-sidebar-foreground/70">Northwind Analytics</div>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur md:px-8">
          <div className="flex gap-1 overflow-x-auto md:hidden">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-md p-2 text-muted-foreground" activeProps={{ className: "bg-accent text-accent-foreground" }} activeOptions={{ exact: "exact" in n }}>
                <n.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Demo environment · synthetic data only
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { reset(); toast.success("Demo data restored"); }}>
              <RotateCcw className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Reset demo</span>
            </Button>
            <Button size="sm" asChild>
              <Link to="/campaigns/new"><Sparkles className="h-3.5 w-3.5" /> New campaign</Link>
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
