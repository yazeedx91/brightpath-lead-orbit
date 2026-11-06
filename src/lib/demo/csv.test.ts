import { describe, expect, it } from "vitest";
import { getDataset } from "./data";
import { SAMPLE_CAMPAIGN, runPipeline } from "./engine";
import { CSV_HEADERS, prospectsToCsv } from "./csv";

describe("CSV export", () => {
  const ds = getDataset();
  const res = runPipeline("c1", SAMPLE_CAMPAIGN, ds);
  const rows = res.leads.map((l) => ({ l, co: ds.companies.find((c) => c.id === l.companyId)!, ct: ds.contacts.find((c) => c.id === l.contactId)! }));

  it("has a header row plus one row per sample prospect (12)", () => {
    const lines = prospectsToCsv(rows).trim().split("\r\n");
    expect(lines[0]).toBe(CSV_HEADERS.join(","));
    expect(lines).toHaveLength(13);
  });

  it("quotes cells containing commas and escapes quotes", () => {
    const r = { ...rows[0]!, co: { ...rows[0]!.co, name: 'Acme, "Fast" Co' } };
    expect(prospectsToCsv([r])).toContain('"Acme, ""Fast"" Co"');
  });
});
