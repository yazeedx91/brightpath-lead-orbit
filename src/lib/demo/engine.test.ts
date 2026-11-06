import { describe, expect, it } from "vitest";
import { getDataset } from "./data";
import { filterCompanies, generateDraft, interpretICP, runPipeline, scoreLead, tierFor } from "./engine";

const icp = interpretICP("Fintech companies in Europe with 100-2000 employees, VP revenue leaders, recently raised funding.");

describe("lead engine", () => {
  it("tiers: Hot >= 80, Warm 60-79, Cold < 60", () => {
    expect(tierFor(80)).toBe("Hot");
    expect(tierFor(79)).toBe("Warm");
    expect(tierFor(60)).toBe("Warm");
    expect(tierFor(59)).toBe("Cold");
  });

  it("scores are deterministic and within 0-100", () => {
    const d = getDataset();
    for (const ct of d.contacts) {
      const co = d.companies.find((c) => c.id === ct.companyId)!;
      const a = scoreLead(icp, co, ct);
      expect(a.score).toBeGreaterThanOrEqual(0);
      expect(a.score).toBeLessThanOrEqual(100);
      expect(scoreLead(icp, co, ct).score).toBe(a.score);
    }
    expect(runPipeline("x", icp, d).leads.map((l) => l.score)).toEqual(runPipeline("x", icp, d).leads.map((l) => l.score));
  });

  it("exclusions remove matching companies", () => {
    const d = getDataset();
    const target = d.companies.find((c) => c.industry === "Fintech")!;
    const out = filterCompanies({ ...icp, exclusions: [target.name] }, d.companies);
    expect(out.some((c) => c.id === target.id)).toBe(false);
  });

  it("draft includes first name, company and a signal or industry", () => {
    const d = getDataset();
    const lead = runPipeline("x", icp, d).leads[0];
    const co = d.companies.find((c) => c.id === lead.companyId)!;
    const ct = d.contacts.find((c) => c.id === lead.contactId)!;
    const draft = generateDraft(lead, co, ct, "friendly");
    expect(draft.body).toContain(ct.name.split(" ")[0]);
    expect(draft.body).toContain(co.name);
    if (co.signals[0]) expect(draft.body).toContain(co.signals[0].detail);
  });
});
