import { describe, expect, it } from "vitest";
import { getDataset } from "./data";
import { SAMPLE_CAMPAIGN, qualificationFor, runPipeline } from "./engine";
import { prospectsToCsv } from "./csv";
import { parseStoredState } from "./persist";
import { buildSeed } from "./store";

describe("qualification boundaries", () => {
  it.each([[100, "Qualified"], [75, "Qualified"], [74, "Review"], [60, "Review"], [59, "Low Fit"], [0, "Low Fit"]])("score %i is %s", (s, q) => {
    expect(qualificationFor(s as number)).toBe(q);
  });
});

describe("saved state recovery", () => {
  it("accepts a valid saved state", () => {
    const seed = buildSeed();
    expect(parseStoredState(JSON.stringify(seed))).toEqual(seed);
  });
  it.each(["not json", "null", "[]", '{"foo":1}', '{"campaigns":"x","leads":null}', ""])("rejects malformed value %j", (raw) => {
    expect(parseStoredState(raw)).toBeNull();
  });
  it("rejects leads missing a score", () => {
    const seed = buildSeed() as unknown as { leads: Record<string, unknown>[] };
    delete seed.leads[0]!['score'];
    expect(parseStoredState(JSON.stringify(seed))).toBeNull();
  });
});

describe("CSV safety", () => {
  it("neutralises spreadsheet formulas", () => {
    const ds = getDataset();
    const l = runPipeline("x", SAMPLE_CAMPAIGN, ds).leads[0]!;
    const co = { ...ds.companies.find((c) => c.id === l.companyId)!, name: "=HYPERLINK(\"x\")" };
    const ct = { ...ds.contacts.find((c) => c.id === l.contactId)!, name: "+cmd" };
    const line = prospectsToCsv([{ l, co, ct }]).split("\r\n")[1];
    expect(line).toContain(`"'=HYPERLINK(""x"")"`);
    expect(line).toContain("'+cmd");
  });
});

describe("stress: temporary in-memory datasets", () => {
  const base = getDataset();
  const make = (n: number) => {
    const companies = Array.from({ length: n }, (_, i) => ({ ...base.companies[i % 12]!, id: `s-co-${i}`, name: `Stress Co ${i}` }));
    const contacts = Array.from({ length: n }, (_, i) => ({ ...base.contacts[i % 12]!, id: `s-ct-${i}`, companyId: `s-co-${i}` }));
    return { ...base, companies, contacts };
  };
  it.each([100, 500, 1000])("%i prospects: pipeline, filter and sort stay correct and fast", (n) => {
    const t0 = performance.now();
    const res = runPipeline("stress", { ...SAMPLE_CAMPAIGN, name: "Stress" }, make(n));
    const q = res.leads.filter((l) => l.qualification === "Qualified");
    const sorted = [...res.leads].sort((a, b) => a.score - b.score);
    const ms = performance.now() - t0;
    expect(res.leads).toHaveLength(n);
    expect(new Set(res.leads.map((l) => l.id)).size).toBe(n);
    expect(res.stats.qualified + res.stats.review + res.stats.lowFit).toBe(n);
    expect(q.every((l) => l.score >= 75)).toBe(true);
    expect(sorted[0]!.score).toBeLessThanOrEqual(sorted[n - 1]!.score);
    expect(ms).toBeLessThan(3000);
    console.log(`stress ${n}: ${ms.toFixed(1)}ms`);
  });
  it("does not modify the 12-record demo dataset", () => {
    expect(getDataset().companies).toHaveLength(12);
  });
});
