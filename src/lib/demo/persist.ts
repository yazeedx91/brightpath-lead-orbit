// Validates saved demo state so a corrupted localStorage value can never break the app.
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

export function parseStoredState<T>(raw: string | null): T | null {
  if (!raw) return null;
  let v: unknown;
  try { v = JSON.parse(raw); } catch { return null; }
  if (!isObj(v)) return null;
  const { campaigns, leads, drafts, events, activeCampaignId, guideStep } = v as Record<string, unknown> & { campaigns: unknown; leads: unknown; drafts: unknown; events: unknown; activeCampaignId: unknown; guideStep: unknown };
  if (!Array.isArray(campaigns) || !campaigns.every((c) => isObj(c) && typeof c["id"] === "string" && typeof c["name"] === "string" && Array.isArray(c["positions"]) && Array.isArray(c["cities"]) && isObj(c["stats"]))) return null;
  if (!Array.isArray(leads) || !leads.every((l) => isObj(l) && typeof l["id"] === "string" && typeof l["campaignId"] === "string" && typeof l["score"] === "number" && Array.isArray(l["factors"]))) return null;
  if (!isObj(drafts) || !Array.isArray(events)) return null;
  if (activeCampaignId !== null && typeof activeCampaignId !== "string") return null;
  if (guideStep !== null && typeof guideStep !== "number") return null;
  return v as T;
}
