import { Link, createFileRoute } from "@tanstack/react-router";
import { CampaignForm } from "@/components/app/CampaignForm";
import { CampaignStatusBadge, PageHeader, pageHead } from "@/components/app/ui";
import { useDemo } from "@/lib/demo/store";

export const Route = createFileRoute("/campaigns/$id/edit")({
  head: () => pageHead("Edit Campaign", "Edit a ProjectX campaign brief and run the AI agent."),
  component: EditCampaign,
});

function EditCampaign() {
  const { id } = Route.useParams();
  const { campaigns } = useDemo();
  const c = campaigns.find((x) => x.id === id);
  if (!c) return <p className="text-sm text-muted-foreground">Campaign not found. <Link to="/campaigns" className="text-primary">Back to campaigns</Link></p>;
  const { id: _id, createdAt: _c, status, isSample, stats: _s, ...input } = c;
  return (
    <>
      <PageHeader eyebrow={<span className="flex items-center gap-2">Edit campaign <CampaignStatusBadge status={status} /></span>} title={c.name} description="Saving updates the brief. Running the agent again replaces this campaign's leads." />
      <CampaignForm key={id} initial={input} campaignId={id} isSample={isSample} />
    </>
  );
}
