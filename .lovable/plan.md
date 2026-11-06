# ProjectX – Synthetic Demo Dataset and Fixed Lead Scoring

Replace today's generated data (about 150 companies) with a hand-written set of 12 fictional Saudi logistics prospects with preset scores. Every page then shows the same numbers.

## Key assumptions
- **Dataset:** the dataset is exactly these 12 records. Every campaign, including new ones you create, draws from them. Nothing is random.
- **Sample campaign:** "Saudi Logistics Prospecting" uses the preset scores: 96, 93, 90, 87, 84, 82, 80, 78, 72, 68, 64, 52.
- **Custom campaigns:** a campaign you create scores the same 12 companies with the same weights, worked out from that campaign's own criteria. For example, choosing Riyadh only lowers the location points of the Jeddah companies. The same input always gives the same result.
- **New categories:** Qualified (75–100), Review (60–74), Low Fit (below 60). These replace Qualified / Needs review / Not qualified.
- **Starting state:** after a reset, every prospect starts as Pending, with no saved drafts and no approvals. The opening numbers are therefore exactly 12 discovered, 12 enriched, 8 qualified, 3 for review and 1 low fit.
- **Draft campaign:** the extra "UAE Retail Distribution" draft campaign stays but has no prospects, so it does not change any numbers.
- **Removed from scoring:** buying signals and timing are no longer scored. Each company keeps a short fictional "context note" that outreach drafts can mention.

## Scoring model (shown on every prospect profile)
- **Weights:** Industry relevance 30, Geographic relevance 20, Company size suitability 20, Decision-maker relevance 30. The four parts always add up to the total.

| ID | Company | City | Employees | Decision-maker title | Ind/30 | Geo/20 | Size/20 | DM/30 | Score | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| PX-001 | DuneBridge Logistics | Riyadh | 240 | Chief Operating Officer | 30 | 20 | 18 | 28 | 96 | Qualified |
| PX-002 | PalmRoute Distribution | Jeddah | 180 | Operations Director | 28 | 20 | 18 | 27 | 93 | Qualified |
| PX-003 | CedarLine Freight | Dammam | 320 | Supply Chain Director | 27 | 20 | 16 | 27 | 90 | Qualified |
| PX-004 | WadiFlow Warehousing | Riyadh | 140 | Operations Director | 25 | 20 | 17 | 25 | 87 | Qualified |
| PX-005 | AtlasGate Transport | Jeddah | 410 | Fleet Manager | 27 | 20 | 14 | 23 | 84 | Qualified |
| PX-006 | RedDune Supply Chain | Dammam | 95 | Supply Chain Director | 26 | 20 | 12 | 24 | 82 | Qualified |
| PX-007 | GulfSpan Cold Chain | Khobar | 260 | Chief Operating Officer | 24 | 14 | 16 | 26 | 80 | Qualified |
| PX-008 | NexaCargo Arabia | Riyadh | 480 | Fleet Manager | 25 | 20 | 12 | 21 | 78 | Qualified |
| PX-009 | Sandstone Distribution | Mecca | 120 | Logistics Manager | 22 | 12 | 16 | 22 | 72 | Review |
| PX-010 | RouteCraft Logistics | Jeddah | 650 | Procurement Manager | 26 | 20 | 8 | 14 | 68 | Review |
| PX-011 | Saffron Peak Warehousing | Medina | 70 | Warehouse Manager | 20 | 10 | 14 | 20 | 64 | Review |
| PX-012 | HarborNest Freight | Tabuk | 35 | Finance Manager | 18 | 8 | 6 | 20 | 52 | Low Fit |

- **Explanations:** each record carries its own explanation of the qualification decision and a recommended next action. Examples: "Book discovery call with COO" (Qualified), "Confirm decision authority before outreach" (Review), "Do not contact now; revisit in 90 days" (Low Fit).
- **What each record shows:** the unique ID, a fictional description, the industry (Logistics / Transportation / Warehousing / Distribution / Cold Chain), the size category, a fictional decision-maker, a fictional email at `.example`, and a fictional website at `.example`. Each also shows "Source: Synthetic Demo Dataset" and a "SYNTHETIC DATA" label.

## Changes by page
- **Overview:** six counts: Discovered 12, Enriched 12, Qualified 8, Review 3, Low Fit 1, Drafts generated 8. The performance summary uses the same counts.
- **Campaigns:** the sample campaign card shows 12 / 12 / 8 / 3 / 1.
- **Agent Activity:**
  - The steps describe "Loading the Synthetic Demo Dataset (12 records)". There are no claims of internet or real-source searches.
  - The counters end at 12 discovered, 12 enriched and 8 qualified.
  - The agent writes 8 drafts, one per qualified prospect.
- **Leads:**
  - Adds an ID column and a "Synthetic data" label on every row.
  - The qualification filter uses Qualified / Review / Low Fit.
  - Review actions (Approve, Reject, Save) are unchanged.
- **Lead profile:**
  - **Score breakdown:** four component bars showing points out of 30/20/20/30, with a total line that checks the sum, for example "30 + 20 + 18 + 28 = 96".
  - **Record details:** the qualification explanation, the recommended next action, the source, and the SYNTHETIC DATA label.
  - **Website and email:** shown as plain text, not clickable. The email is marked "fictional, not verified".
- **Outreach:** drafts use each record's decision-maker, city and context note.
- **Analytics:**
  - The qualification chart shows 8 / 3 / 1. The funnel reads Discovered 12, Enriched 12, Qualified 8, then Approved and Drafts saved, which update live.
  - The score distribution chart uses bands that match the categories: below 60, 60–74 and 75–100. A ten-band version is shown underneath.

## Technical details
- **Data file:** `data.ts` becomes a hand-written array of 12 `Company` and 12 `Contact` objects. Each sample-campaign record stores its preset component scores, its explanation and its next action. The random-number generator and the generated companies are removed.
- **Scoring (`engine.ts`):**
  - A `qualificationFor` helper uses the 75 and 60 cut-offs.
  - For the sample campaign, the score breakdown uses the preset component scores.
  - For custom campaigns, scores come from fixed rules:
    - industry relevance by sector;
    - location: city match 20, same country 10, otherwise 0;
    - size suitability: distance from the target range;
    - decision-maker match: exact title 30, related title 20, other 10.
  - Each part is a whole number, so the parts always add up to the total.
- **Data types:** `Qualification` becomes "Qualified" | "Review" | "Low Fit". Campaign stats become `{ discovered, enriched, qualified, review, lowFit, drafts }`.
- **Clean-up:** every page that uses the old labels or stats is updated, along with the profile score bars. The saved-data key moves to v4 so old saved data is ignored.
- **Tests (`engine.test.ts`):**
  - the 75/60 cut-offs;
  - the preset totals are exactly [96, 93, 90, 87, 84, 82, 80, 78, 72, 68, 64, 52];
  - each prospect's four parts add up to its total, and no part exceeds its weight;
  - the counts are 8 / 3 / 1;
  - every record has a `.example` email and website and "Synthetic Demo Dataset" as its source;
  - scoring the same campaign twice gives the same result.
- **Browser check:** after a reset, confirm 12 / 12 / 8 / 3 / 1 on the Overview, Campaigns, Leads (filter counts) and Analytics pages. Then open PX-001 and check that 30 + 20 + 18 + 28 = 96 is shown.
