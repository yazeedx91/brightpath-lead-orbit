import { Navigate, createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/components/app/ui";
import { useDemo } from "@/lib/demo/store";

export const Route = createFileRoute("/activity")({
  head: () => pageHead("Agent Activity", "Watch the ProjectX agent prospect in real time."),
  component: Activity,
});

function Activity() {
  const { campaigns } = useDemo();
  const c = campaigns.find((x) => x.status === "running") ?? campaigns[0];
  if (!c) return <Navigate to="/campaigns/new" />;
  return <Navigate to="/campaigns/$id/run" params={{ id: c.id }} />;
}
