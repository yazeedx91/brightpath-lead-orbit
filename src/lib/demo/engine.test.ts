import { describe, expect, it } from "vitest";
import { getDataset } from "./data";
import { SAMPLE_CAMPAIGN, generateDraft, nextAction, qualificationFor, runPipeline } from "./engine";

describe("lead engine", () => {
  it("qualification: Qualified >= 70, Needs review 50-69, Not qualified < 50", () => {
    expect(qualificationFor(70)).toBe("Qualified");
    expect(qualificationFor(69)).toBe("Needs review");
    expect(qualificationFor(50)).toBe("Needs review");
    expect(qualificationFor(49)).toBe("Not qualified");
  });

  it("Saudi sample ranks Riyadh/Jeddah/Dammam logistics companies (50–500 staff) at the top", () => {
    const d = getDataset();
    const res = runPipeline("t", SAMPLE_CAMPAIGN, d);
    const top = res.leads.slice(0, 10);
    expect(top.length).toBe(10);
    for (const l of top) {
      const co = d.companies.find((c) => c.id === l.companyId)!;
      expect(co.industry).toBe("Logistics and Supply Chain");
      expect(["Riyadh", "Jeddah", "Dammam"]).toContain(co.city);
      expect(co.employees).toBeGreaterThanOrEqual(50);
      expect(co.employees).toBeLessThanOrEqual(500);
    }
    expect(res.stats.qualified).toBeGreaterThan(0);
  });

  it("scores are deterministic and within 0-100", () => {
    const d = getDataset();
    const a = runPipeline("x", SAMPLE_CAMPAIGN, d).leads.map((l) => l.score);
    const b = runPipeline("x", SAMPLE_CAMPAIGN, d).leads.map((l) => l.score);
    expect(a).toEqual(b);
    expect(a.every((s) => s >= 0 && s <= 100)).toBe(true);
  });

  it("draft includes contact first name, company, city and the offering", () => {
    const d = getDataset();
    const lead = runPipeline("x", SAMPLE_CAMPAIGN, d).leads[0]!;
    const co = d.companies.find((c) => c.id === lead.companyId)!;
    const ct = d.contacts.find((c) => c.id === lead.contactId)!;
    const draft = generateDraft(lead, co, ct, SAMPLE_CAMPAIGN, "friendly");
    const text = `${draft.subject}\n${draft.body}`;
    expect(text).toContain(ct.name.split(" ")[0]!);
    expect(text).toContain(co.name);
    expect(text).toContain(co.city);
    expect(text).toContain(SAMPLE_CAMPAIGN.offering);
  });

  it("next action follows qualification and review", () => {
    expect(nextAction({ qualification: "Qualified", review: "Pending", factors: [] }).title).toBe("Approve and send a personalised intro");
    expect(nextAction({ qualification: "Qualified", review: "Approved", factors: [] }).title).toBe("Send personalised intro");
    expect(nextAction({ qualification: "Not qualified", review: "Pending", factors: [] }).title).toBe("Hold for 30 days");
    expect(nextAction({ qualification: "Qualified", review: "Rejected", factors: [] }).title).toBe("No further action");
  });
});
