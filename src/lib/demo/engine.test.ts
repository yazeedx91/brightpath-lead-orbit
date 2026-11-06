import { describe, expect, it } from "vitest";
import { getDataset } from "./data";
import { SAMPLE_CAMPAIGN, generateDraft, nextAction, qualificationFor, runPipeline } from "./engine";
import { DATA_SOURCE } from "./types";

describe("synthetic dataset and scoring", () => {
  it("qualification: Qualified 75–100, Review 60–74, Low Fit below 60", () => {
    expect(qualificationFor(75)).toBe("Qualified");
    expect(qualificationFor(74)).toBe("Review");
    expect(qualificationFor(60)).toBe("Review");
    expect(qualificationFor(59)).toBe("Low Fit");
  });

  it("sample campaign produces the predetermined scores", () => {
    const res = runPipeline("s", SAMPLE_CAMPAIGN, getDataset());
    expect(res.leads.map((l) => l.score)).toEqual([96, 93, 90, 87, 84, 82, 80, 78, 72, 68, 64, 52]);
  });

  it("component scores add up to the total and respect 30/20/20/30 weights", () => {
    const res = runPipeline("s", SAMPLE_CAMPAIGN, getDataset());
    for (const l of res.leads) {
      expect(l.factors.reduce((a, f) => a + f.points, 0)).toBe(l.score);
      expect(l.factors.map((f) => f.weight)).toEqual([30, 20, 20, 30]);
      for (const f of l.factors) expect(f.points).toBeLessThanOrEqual(f.weight);
    }
  });

  it("produces 12 discovered: 8 Qualified, 3 Review, 1 Low Fit", () => {
    const { stats } = runPipeline("s", SAMPLE_CAMPAIGN, getDataset());
    expect(stats).toEqual({ discovered: 12, enriched: 12, qualified: 8, review: 3, lowFit: 1, drafts: 8 });
  });

  it("every record is fictional: .example email and website, synthetic source", () => {
    const d = getDataset();
    expect(d.companies).toHaveLength(12);
    for (const c of d.companies) {
      expect(c.website.endsWith(".example")).toBe(true);
      expect(c.source).toBe(DATA_SOURCE);
    }
    for (const ct of d.contacts) expect(ct.email.endsWith(".example")).toBe(true);
  });

  it("custom campaigns score deterministically and still sum correctly", () => {
    const custom = { ...SAMPLE_CAMPAIGN, cities: ["Riyadh"] };
    const a = runPipeline("c", custom, getDataset());
    const b = runPipeline("c", custom, getDataset());
    expect(a.leads.map((l) => l.score)).toEqual(b.leads.map((l) => l.score));
    for (const l of a.leads) expect(l.factors.reduce((s, f) => s + f.points, 0)).toBe(l.score);
  });

  it("draft includes first name, company, city and offering", () => {
    const d = getDataset();
    const lead = runPipeline("x", SAMPLE_CAMPAIGN, d).leads[0]!;
    const co = d.companies.find((c) => c.id === lead.companyId)!;
    const ct = d.contacts.find((c) => c.id === lead.contactId)!;
    const draft = generateDraft(lead, co, ct, SAMPLE_CAMPAIGN, "friendly");
    const text = `${draft.subject}\n${draft.body}`;
    for (const s of [ct.name.split(" ")[0]!, co.name, co.city, SAMPLE_CAMPAIGN.offering]) expect(text).toContain(s);
  });

  it("next action respects review decisions", () => {
    const rec = { title: "Book discovery call with COO", detail: "" };
    expect(nextAction({ qualification: "Qualified", review: "Pending", recommendation: rec }).title).toBe("Book discovery call with COO");
    expect(nextAction({ qualification: "Qualified", review: "Approved", recommendation: rec }).title).toBe("Send personalised intro");
    expect(nextAction({ qualification: "Qualified", review: "Rejected", recommendation: rec }).title).toBe("No further action");
  });
});
