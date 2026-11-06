import { createFileRoute } from "@tanstack/react-router";
import { CampaignForm } from "@/components/app/CampaignForm";
import { PageHeader, pageHead } from "@/components/app/ui";
import { SAMPLE_CAMPAIGN } from "@/lib/demo/engine";

export const Route = createFileRoute("/campaigns/new")({
  head: () => pageHead("Create Campaign", "Define a target brief and let the ProjectX agent prospect for you."),
  component: NewCampaign,
});

function NewCampaign() {
  return (
    <>
      <PageHeader eyebrow="Create campaign" title="New prospecting campaign" description="Tell the agent who you sell to and what you offer. It prefills with an editable sample scenario." />
      <CampaignForm initial={SAMPLE_CAMPAIGN} isSample />
    </>
  );
}
