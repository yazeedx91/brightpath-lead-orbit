import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, LayoutDashboard, Mail, Megaphone, PlusCircle, RotateCcw, Sparkles, Users } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarInset,
  SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { useDemo } from "@/lib/demo/store";
import { GuideCard } from "./GuidedDemo";
import { CampaignStatusBadge } from "./ui";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/campaigns/new", label: "Create Campaign", icon: PlusCircle },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/outreach", label: "Outreach", icon: Mail },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

function isActive(path: string, to: string) {
  if (to === "/") return path === "/";
  if (to === "/campaigns") return path === "/campaigns" || (path.startsWith("/campaigns/") && path !== "/campaigns/new");
  return path.startsWith(to);
}

function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { leads } = useDemo();
  const { setOpenMobile } = useSidebar();
  const pending = leads.filter((l) => l.review === "Pending" && l.qualification !== "Low Fit").length;
  return (
    <Sidebar collapsible="icon" className="top-14 h-[calc(100svh-3.5rem)]">
      <SidebarContent className="pt-3">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((n) => (
                <SidebarMenuItem key={n.to}>
                  <SidebarMenuButton asChild isActive={isActive(path, n.to)} tooltip={n.label}>
                    <Link to={n.to} onClick={() => setOpenMobile(false)}><n.icon /><span>{n.label}</span></Link>
                  </SidebarMenuButton>
                  {n.to === "/leads" && pending > 0 && <SidebarMenuBadge title={`${pending} prospects awaiting review`} className="rounded-full bg-sidebar-accent px-1.5 text-[10px] font-semibold">{pending} to review</SidebarMenuBadge>}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 rounded-md p-1 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">MC</div>
          <div className="text-xs group-data-[collapsible=icon]:hidden">
            <div className="font-medium text-sidebar-accent-foreground">Maya Chen</div>
            <div className="text-sidebar-foreground/70">Demo user</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { reset, campaigns, activeCampaignId } = useDemo();
  const active = campaigns.find((c) => c.id === activeCampaignId) ?? campaigns[0];
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-3 md:px-5">
          <SidebarTrigger />
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></div>
            <div className="leading-tight">
              <div className="font-display text-sm font-bold">ProjectX</div>
              <div className="hidden text-[11px] text-muted-foreground sm:block">AI Lead Generation Agent</div>
            </div>
          </Link>
          <span className="ml-1 rounded-full border border-warning/40 bg-warning-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warning">Demo mode</span>
          {active && (
            <Link to="/campaigns/$id/run" params={{ id: active.id }} className="ml-auto hidden items-center gap-2 rounded-md border px-2.5 py-1 text-xs hover:bg-muted lg:flex">
              <span className="text-muted-foreground">Current campaign:</span>
              <span className="max-w-48 truncate font-medium">{active.name}</span>
              <CampaignStatusBadge status={active.status} />
            </Link>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className={active ? "ml-auto lg:ml-0" : "ml-auto"}><RotateCcw className="h-3.5 w-3.5" /><span className="hidden sm:inline">Reset demo</span></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset the demo?</AlertDialogTitle>
                <AlertDialogDescription>This restores the original Synthetic Demo Dataset and sample campaign. Custom campaigns, review decisions and saved drafts will be removed. This cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={() => { reset(); toast.success("Demo data restored"); }}>Reset demo</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </header>
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="min-w-0 bg-background">
            <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8">{children}</div>
          </SidebarInset>
        </div>
      </div>
      <GuideCard />
    </SidebarProvider>
  );
}
